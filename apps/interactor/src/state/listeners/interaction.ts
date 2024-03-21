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
import { AbstractRoleplayStrategy } from '../../libs/prompts/strategies'
import { getRoleplayStrategyFromSlug } from '../../libs/prompts/strategies/roleplay'
import { selectAllParentDialogues } from '../selectors'

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
    const promptBuilder = new PromptBuilder<AbstractRoleplayStrategy>({
      maxNewTokens: 200,
      strategy: getRoleplayStrategyFromSlug(strategySlug, tokenizer),
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
    const stream = textCompletion({
      ...completionQuery,
      model: state.settings.model,
      serviceBaseUrl: servicesEndpoint,
      // indentifer is used to always use the server for this narration, saving KV cache.
      identifier: simpleHash(
        state.settings.user.name + '_' + state.narration.id
      ),
    })

    for await (const result of stream) {
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
      action.payload.characterId
    )
  },
})
