import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit';
import { sceneSuggestionsStart, sceneSuggestionsUpdate, sceneSuggestionsEnd } from '../slices/narrationSlice';
import { RootState } from '../store';
import PromptBuilder from '../../libs/prompts/PromptBuilder';
import { SceneSuggestionPromptStrategy } from '../../libs/prompts/strategies/suggestion/SceneSuggestionPromptStrategy';
import textCompletion from '../../libs/textCompletion';
import { selectCharactersInCurrentScene } from '../selectors';
import { NarrationSceneSuggestion } from '../versioning/v3.state';
import { v4 as randomUUID } from 'uuid';
import { retrieveModelMetadata } from '../../libs/retrieveMetadata';

const sceneSuggestionEffect = async (
  dispatch: Dispatch,
  state: RootState,
  servicesEndpoint: string,
  singleScenePrompt?: string,
) => {
  const currentResponse = state.narration.responses[state.narration.currentResponseId];
  try {
    const currentSelectedCharacter = selectCharactersInCurrentScene(state) || [];
    const modelMetadata = await retrieveModelMetadata(servicesEndpoint, state.settings.model);
    const promptBuilder = new PromptBuilder<SceneSuggestionPromptStrategy>({
      maxNewTokens: 35,
      strategy: new SceneSuggestionPromptStrategy(modelMetadata.secondary.strategy),
      truncationLength: modelMetadata.secondary.truncation_length,
    });
    const prompt = promptBuilder.buildPrompt({ state, singleScenePrompt }, 3);
    const stream = textCompletion({
      template: prompt.template,
      variables: prompt.variables,
      model: state.settings.model,
      serviceBaseUrl: servicesEndpoint,
      identifier: `${Date.now()}`,
    });

    let suggestions: NarrationSceneSuggestion[] = [];
    const ids = Array.from({ length: 6 }, () => randomUUID());
    for await (const result of stream) {
      const _response = promptBuilder.completeResponse([], result, {
        state,
        singleScenePrompt,
      });
      suggestions = _response.map((suggestion, suggestionIndex) => {
        return {
          sceneId: ids[suggestionIndex],
          actionText: suggestion.actionText,
          music: suggestion.music,
          textPrompt: suggestion.prompt,
          sdPrompt: suggestion.sdPrompt,
          characters: [
            {
              characterId: currentSelectedCharacter.length ? currentSelectedCharacter[0].id || '' : '',
              outfitPrompt: '',
            },
          ],
        };
      });
      dispatch(
        sceneSuggestionsUpdate({
          suggestions,
          responseId: currentResponse?.id || '',
        }),
      );
    }
    dispatch(
      sceneSuggestionsEnd({
        suggestions,
        responseId: currentResponse?.id || '',
      }),
    );
  } catch (error) {
    console.error(error);
    dispatch(
      sceneSuggestionsEnd({
        suggestions: [],
        responseId: currentResponse?.id || '',
      }),
    );
  }
};

export const sceneSugestionMiddleware = createListenerMiddleware();

sceneSugestionMiddleware.startListening({
  actionCreator: sceneSuggestionsStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    await sceneSuggestionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint,
      action.payload.singleScenePrompt,
    );
  },
});
