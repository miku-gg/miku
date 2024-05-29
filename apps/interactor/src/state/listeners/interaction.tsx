import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit'
import {
  interactionStart,
  interactionFailure,
  interactionSuccess,
  regenerationStart,
  NarrationResponse,
  continueResponse,
  characterResponseStart,
} from '../slices/narrationSlice'
import { RootState } from '../store'
import textCompletion from '../../libs/textCompletion'
import PromptBuilder from '../../libs/prompts/PromptBuilder'
import { retrieveModelMetadata } from '../../libs/retrieveMetadata'
import {
  AbstractRoleplayStrategy,
  fillTextTemplate,
} from '../../libs/prompts/strategies'
import { getRoleplayStrategyFromSlug } from '../../libs/prompts/strategies/roleplay'
import {
  selectAllParentDialogues,
  selectCurrentScene,
  selectCurrentSceneObjectives,
} from '../selectors'
import { NovelV3 } from '@mikugg/bot-utils'
import { CustomEventType, postMessage } from '../../libs/stateEvents'
import { unlockAchievement } from '../../libs/platformAPI'
import { addItem } from '../slices/inventorySlice'
import { removeObjective } from '../slices/objectivesSlice'
import { toast } from 'react-toastify'
import { GiOpenChest } from 'react-icons/gi'
import { _i18n } from '../../libs/lang/i18n'

// a simple hash function to generate a unique identifier for the narration
function simpleHash(str: string): string {
  let hash = 0
  if (str.length === 0) return `${hash}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `${hash}`
}

const interactionEffect = async (
  dispatch: Dispatch,
  state: RootState,
  servicesEndpoint: string,
  apiEndpoint: string,
  selectedCharacterId: string
) => {
  try {
    let currentResponseState: NarrationResponse =
      state.narration.responses[state.narration.currentResponseId]!
    const {
      strategy: strategySlug,
      truncation_length,
      tokenizer,
    } = (await retrieveModelMetadata(
      servicesEndpoint,
      state.settings.model
    )) || {
      strategy: 'alpacarp',
      tokenizer: 'llama',
      truncation_length: 4096,
    }
    const maxMessages = selectAllParentDialogues(state).length
    const strategy = getRoleplayStrategyFromSlug(strategySlug, tokenizer)
    const promptBuilder = new PromptBuilder<AbstractRoleplayStrategy>({
      maxNewTokens: 200,
      strategy,
      trucationLength: truncation_length,
    })
    const startText =
      currentResponseState.characters.find(
        ({ characterId }) => characterId == selectedCharacterId
      )?.text || ''
    const completionQuery = promptBuilder.buildPrompt(
      { state, currentCharacterId: selectedCharacterId },
      maxMessages
    )
    const currentCharacter = state.novel.characters.find(
      (character) => character.id === selectedCharacterId
    )
    const identifier = simpleHash(
      state.settings.user.name + '_' + state.narration.id
    )
    const currentScene = selectCurrentScene(state)
    const stream = textCompletion({
      ...completionQuery,
      model: state.settings.model,
      serviceBaseUrl: servicesEndpoint,
      // indentifer is used to always use the server for this narration, saving KV cache.
      identifier,
    })

    let finishedCompletionResult = new Map<string, string>()
    for await (const result of stream) {
      finishedCompletionResult = result
      result.set('text', startText + (result.get('text') || ''))
      currentResponseState = promptBuilder.completeResponse(
        currentResponseState,
        result,
        { state, currentCharacterId: selectedCharacterId }
      )
      dispatch(
        interactionSuccess({
          ...currentResponseState,
          completed: false,
        })
      )
    }
    if (
      !currentResponseState.characters.find(
        ({ characterId }) => characterId === selectedCharacterId
      )?.text
    ) {
      throw new Error('No text')
    }

    dispatch(
      interactionSuccess({
        ...currentResponseState,
        completed: true,
      })
    )
    let prefixConditionPrompt = completionQuery.template
    finishedCompletionResult.get('text')
    prefixConditionPrompt = prefixConditionPrompt.replace(
      /{{GEN text (.*?)}}/g,
      finishedCompletionResult.get('text') || ''
    )
    prefixConditionPrompt = prefixConditionPrompt.replace(
      '{{SEL emotion options=emotions}}',
      finishedCompletionResult.get('emotion') || ''
    )
    const objectives = [...selectCurrentSceneObjectives(state)]
    if (
      !objectives.some(
        (objective) =>
          objective.action.type ===
          NovelV3.NovelObjectiveActionType.SUGGEST_ADVANCE_SCENE
      )
    ) {
      objectives.push({
        id: 'temp_generate_scene_objective',
        condition: '{{char}} and {{user}} are now in a different place',
        name: 'Generate a new scene',
        sceneIds: [currentScene?.id || ''],
        action: {
          type: NovelV3.NovelObjectiveActionType.SUGGEST_CREATE_SCENE,
        },
      })
    }

    try {
      await Promise.all(
        objectives.map(async (objective) => {
          const condition = objective.condition
          const conditionResultStream = textCompletion({
            template: fillTextTemplate(
              prefixConditionPrompt +
                AbstractRoleplayStrategy.getConditionPrompt({
                  condition,
                  instructionPrefix: strategy.template().instruction,
                  responsePrefix: strategy.template().response,
                }),
              {
                user: state.settings.user.name,
                bot: currentCharacter?.card.data.name || '',
              }
            ),
            model: state.settings.model,
            serviceBaseUrl: servicesEndpoint,
            identifier,
            variables: {
              cond_opt: [' Yes', ' No'],
            },
          })
          let response = ''
          for await (const result of conditionResultStream) {
            response = result.get('cond') || ''
          }
          if (response === ' Yes') {
            switch (objective.action.type) {
              case NovelV3.NovelObjectiveActionType.SUGGEST_ADVANCE_SCENE:
                dispatch(
                  interactionSuccess({
                    ...currentResponseState,
                    nextScene: objective.action.params.sceneId,
                    completed: true,
                  })
                )
                break
              case NovelV3.NovelObjectiveActionType.SUGGEST_CREATE_SCENE:
                dispatch(
                  interactionSuccess({
                    ...currentResponseState,
                    shouldSuggestScenes: true,
                    completed: true,
                  })
                )
                break
              case NovelV3.NovelObjectiveActionType.ACHIEVEMENT_UNLOCK:
                postMessage(CustomEventType.ACHIEVEMENT_UNLOCKED, {
                  achievement: {
                    id: objective.action.params.achievementId,
                    name: objective.name,
                    description: objective.description || '',
                    inventoryItem: objective.action.params.reward,
                  },
                })
                unlockAchievement(
                  apiEndpoint,
                  objective.action.params.achievementId
                )
                if (objective.action.params.reward) {
                  dispatch(addItem(objective.action.params.reward))
                }
                dispatch(removeObjective(objective.id))
                break
              case NovelV3.NovelObjectiveActionType.ITEM_RECEIVE:
                dispatch(addItem(objective.action.params.item))
                dispatch(removeObjective(objective.id))
                toast(
                  <div
                    style={{
                      textAlign: 'left',
                      display: 'inline-flex',
                      gap: 10,
                    }}
                  >
                    <GiOpenChest />
                    <span>
                      <b>{objective.action.params.item.name}</b>{' '}
                      {_i18n('ADDED_TO_INVENTORY')}
                    </span>
                  </div>,
                  {
                    position: 'top-left',
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false,
                    theme: 'dark',
                    style: {
                      marginTop: 50,
                      marginLeft: 10,
                    },
                  }
                )
                break
            }
          }
        })
      )
    } catch (error) {
      dispatch(interactionFailure(_i18n('ERROR__UNLOCKING_ACHIEVEMENT')))
    }
  } catch (error) {
    console.error(error)
    dispatch(interactionFailure())
  }
}

export const interactionListenerMiddleware = createListenerMiddleware()

interactionListenerMiddleware.startListening({
  actionCreator: interactionStart,
  effect: async (action, listenerApi) => {
    await interactionEffect(
      listenerApi.dispatch,
      listenerApi.getState() as RootState,
      action.payload.servicesEndpoint,
      action.payload.apiEndpoint,
      action.payload.selectedCharacterId
    )
  },
})

export const regenerationListenerMiddleware = createListenerMiddleware()

regenerationListenerMiddleware.startListening({
  actionCreator: regenerationStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    await interactionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint,
      action.payload.apiEndpoint,
      action.payload.characterId
    )
  },
})

export const continueListenerMiddleware = createListenerMiddleware()

continueListenerMiddleware.startListening({
  actionCreator: continueResponse,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const lastResponseCharacters =
      state.narration.responses[state.narration.currentResponseId]?.characters
    const lastResponseCharacterId =
      lastResponseCharacters?.[lastResponseCharacters.length - 1].characterId ||
      ''
    await interactionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint,
      action.payload.apiEndpoint,
      lastResponseCharacterId
    )
  },
})

export const characterResponseListenerMiddleware = createListenerMiddleware()

characterResponseListenerMiddleware.startListening({
  actionCreator: characterResponseStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    await interactionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint,
      action.payload.apiEndpoint,
      action.payload.characterId
    )
  },
})
