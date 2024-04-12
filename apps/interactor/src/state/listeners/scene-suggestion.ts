import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit'
import {
  sceneSuggestionsStart,
  sceneSuggestionsUpdate,
  sceneSuggestionsEnd,
  interactionStart,
} from '../slices/narrationSlice'
import { RootState } from '../store'
import PromptBuilder from '../../libs/prompts/PromptBuilder'
import { AlpacaSceneSuggestionStrategy } from '../../libs/prompts/strategies/suggestion/AlpacaSceneSuggestionStrategy'
import textCompletion from '../../libs/textCompletion'
import {
  selectCharactersInCurrentScene,
  selectCurrentScene,
} from '../selectors'
import { ModelType, NarrationSceneSuggestion } from '../versioning/v3.state'
import { v4 as randomUUID } from 'uuid'
import {
  backgroundInferenceEnd,
  removeImportedBackground,
  setModalOpened,
} from '../slices/creationSlice'
import { addScene } from '../slices/novelSlice'

const sceneSuggestionEffect = async (
  dispatch: Dispatch,
  state: RootState,
  servicesEndpoint: string
) => {
  const currentResponse =
    state.narration.responses[state.narration.currentResponseId]
  try {
    const currentSelectedCharacter = selectCharactersInCurrentScene(state) || []
    const promptBuilder = new PromptBuilder<AlpacaSceneSuggestionStrategy>({
      maxNewTokens: 35,
      strategy: new AlpacaSceneSuggestionStrategy('llama'),
      trucationLength:
        state.settings.model === ModelType.RP_SMART ? 8192 : 4096,
    })
    const prompt = promptBuilder.buildPrompt(state, 3)
    const stream = textCompletion({
      template: prompt.template,
      variables: prompt.variables,
      model: state.settings.model,
      serviceBaseUrl: servicesEndpoint,
      identifier: `${Date.now()}`,
    })

    let suggestions: NarrationSceneSuggestion[] = []
    const ids = Array.from({ length: 6 }, () => randomUUID())
    for await (const result of stream) {
      const _response = promptBuilder.completeResponse([], result, state)
      suggestions = _response.map((suggestion, suggestionIndex) => {
        return {
          sceneId: ids[suggestionIndex],
          actionText: suggestion.actionText,
          music: suggestion.music,
          textPrompt: suggestion.prompt,
          sdPrompt: suggestion.sdPrompt,
          characters: [
            {
              characterId: currentSelectedCharacter.length
                ? currentSelectedCharacter[0].id || ''
                : '',
              outfitPrompt: '',
            },
          ],
        }
      })
      dispatch(
        sceneSuggestionsUpdate({
          suggestions,
          responseId: currentResponse?.id || '',
        })
      )
    }
    dispatch(
      sceneSuggestionsEnd({
        suggestions,
        responseId: currentResponse?.id || '',
      })
    )
  } catch (error) {
    console.error(error)
    dispatch(
      sceneSuggestionsEnd({
        suggestions: [],
        responseId: currentResponse?.id || '',
      })
    )
  }
}

const promptSelectedSuggestedScene = async (
  dispatch: Dispatch,
  state: RootState,
  servicesEndpoint: string,
  sceneId: string
) => {
  const response = state.narration.responses[state.narration.currentResponseId]
  const suggestion = response?.suggestedScenes.find(
    (s) => s.sceneId === sceneId
  )
  const background = state.creation.importedBackgrounds.find(
    (bg) => bg.id === sceneId
  )

  // TODO: Fix outfit prompt
  const currentScene = selectCurrentScene(state)

  dispatch(removeImportedBackground(sceneId))
  dispatch(
    addScene({
      id: sceneId,
      characters:
        currentScene?.characters.map((c) => ({
          id: c.characterId,
          outfit: c.outfit,
        })) || [],
      background: background?.source.jpg || '',
      music: currentScene?.musicId || '',
      name: suggestion?.actionText || '',
      prompt: suggestion?.textPrompt || '',
      children: currentScene?.children || [],
    })
  )

  if (state.creation.inference.lastBackgroundForNewSceneId !== sceneId) {
    return
  }

  dispatch(
    interactionStart({
      sceneId: sceneId,
      text: `OOC: Describe the following scene and add dialogue: ${
        suggestion?.textPrompt || ''
      }`,
      characters: suggestion?.characters.map((r) => r.characterId) || [],
      servicesEndpoint,
      selectedCharacterId:
        suggestion?.characters[
          Math.floor(Math.random() * (suggestion?.characters.length || 0))
        ].characterId || '',
    })
  )
  dispatch(
    setModalOpened({
      id: 'scene-suggestions',
      opened: false,
    })
  )
}

export const sceneSugestionMiddleware = createListenerMiddleware()

sceneSugestionMiddleware.startListening({
  actionCreator: sceneSuggestionsStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    await sceneSuggestionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint
    )
  },
})

sceneSugestionMiddleware.startListening({
  actionCreator: backgroundInferenceEnd,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    await promptSelectedSuggestedScene(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint,
      action.payload.id
    )
  },
})
