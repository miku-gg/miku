import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit'
import {
  sceneSuggestionsStart,
  sceneSuggestionsUpdate,
  sceneSuggestionsEnd,
} from '../slices/narrationSlice'
import { RootState } from '../store'
import PromptBuilder from '../../libs/prompts/PromptBuilder'
import { AlpacaSceneSuggestionStrategy } from '../../libs/prompts/strategies/suggestion/AlpacaSceneSuggestionStrategy'
import textCompletion from '../../libs/textCompletion'
import { selectCharactersInCurrentScene } from '../selectors'
import { NarrationSceneSuggestion } from '../versioning/v3.state'

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
      trucationLength: 4096,
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
    for await (const result of stream) {
      const _response = promptBuilder.completeResponse([], result, state)
      suggestions = _response.map((suggestion) => {
        return {
          actionText: suggestion.actionText,
          probability: Number(suggestion.probability) || 0,
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
