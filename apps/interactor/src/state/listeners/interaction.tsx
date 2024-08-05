import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit';
import {
  interactionStart,
  interactionFailure,
  interactionSuccess,
  regenerationStart,
  NarrationResponse,
  continueResponse,
  characterResponseStart,
} from '../slices/narrationSlice';
import { RootState } from '../store';
import textCompletion from '../../libs/textCompletion';
import PromptBuilder from '../../libs/prompts/PromptBuilder';
import { retrieveModelMetadata } from '../../libs/retrieveMetadata';
import { AbstractRoleplayStrategy, fillTextTemplate } from '../../libs/prompts/strategies';
import { getRoleplayStrategyFromSlug } from '../../libs/prompts/strategies/roleplay';
import { selectAllParentDialogues, selectCurrentScene, selectCurrentSceneObjectives } from '../selectors';
import { NovelV3 } from '@mikugg/bot-utils';
import { CustomEventType, postMessage } from '../../libs/stateEvents';
import { unlockAchievement } from '../../libs/platformAPI';
import { addItem } from '../slices/inventorySlice';
import { removeObjective } from '../slices/objectivesSlice';
import { toast } from 'react-toastify';
import { GiOpenChest } from 'react-icons/gi';
import { novelActionToStateAction } from '../mutations';

// a simple hash function to generate a unique identifier for the narration
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return `${hash}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${hash}`;
}

async function waitForLastYield<T>(generator: AsyncGenerator<T>): Promise<T | undefined> {
  let lastValue: T | undefined;

  for await (const value of generator) {
    lastValue = value;
  }

  return lastValue;
}

const interactionEffect = async (
  dispatch: Dispatch,
  state: RootState,
  servicesEndpoint: string,
  apiEndpoint: string,
  selectedCharacterId: string,
) => {
  try {
    let currentResponseState: NarrationResponse = state.narration.responses[state.narration.currentResponseId]!;
    const currentCharacterResponse = currentResponseState.characters.find(
      ({ characterId }) => characterId === selectedCharacterId,
    );
    const currentCharacter = state.novel.characters.find((character) => character.id === selectedCharacterId);
    const identifier = simpleHash(state.settings.user.name + '_' + state.narration.id);
    const currentScene = selectCurrentScene(state);
    const { secondary, strategy, truncation_length, tokenizer } = (await retrieveModelMetadata(
      servicesEndpoint,
      state.settings.model,
    )) || {
      strategy: 'alpacarp',
      tokenizer: 'llama',
      truncation_length: 4096,
    };
    const maxMessages = selectAllParentDialogues(state).length;
    const primaryStrategy = getRoleplayStrategyFromSlug(strategy, tokenizer);
    const secondaryStrategy = getRoleplayStrategyFromSlug(secondary.strategy, secondary.tokenizer);

    const [responsePromptBuilder, secondaryPromptBuilder] = [
      new PromptBuilder<AbstractRoleplayStrategy>({
        maxNewTokens: 200,
        strategy: primaryStrategy,
        truncationLength: truncation_length - 150,
      }),
      new PromptBuilder<AbstractRoleplayStrategy>({
        maxNewTokens: 200,
        strategy: secondaryStrategy,
        truncationLength: secondary.truncation_length - 150,
      }),
    ];

    if (!currentCharacterResponse?.emotion) {
      const emotionPrompt = secondaryPromptBuilder.buildPrompt(
        { state, currentCharacterId: selectedCharacterId },
        maxMessages,
      );
      const emotionTemplate = emotionPrompt.template.slice(
        0,
        emotionPrompt.template.indexOf('{{SEL emotion options=emotions}}') + '{{SEL emotion options=emotions}}'.length,
      );

      const emotionResult = await waitForLastYield(
        textCompletion({
          template: emotionTemplate,
          variables: emotionPrompt.variables,
          model: secondary.id,
          serviceBaseUrl: servicesEndpoint,
          identifier,
        }),
      );

      if (emotionResult?.get('emotion')) {
        currentResponseState = secondaryPromptBuilder.completeResponse(currentResponseState, emotionResult, {
          state,
          currentCharacterId: selectedCharacterId,
        });
        dispatch(
          interactionSuccess({
            ...currentResponseState,
            completed: false,
          }),
        );
      }
    }

    const startText =
      currentResponseState.characters.find(({ characterId }) => characterId == selectedCharacterId)?.text || '';
    let completionQuery = responsePromptBuilder.buildPrompt(
      {
        state: {
          ...state,
          narration: {
            ...state.narration,
            responses: {
              ...state.narration.responses,
              [state.narration.currentResponseId]: currentResponseState,
            },
          },
        },
        currentCharacterId: selectedCharacterId,
      },
      maxMessages,
    );

    const stream = textCompletion({
      ...completionQuery,
      model: state.settings.model,
      serviceBaseUrl: servicesEndpoint,
      identifier,
    });

    let finishedCompletionResult = new Map<string, string>();
    for await (const result of stream) {
      finishedCompletionResult = result;
      result.set('text', startText + (result.get('text') || ''));
      currentResponseState = responsePromptBuilder.completeResponse(currentResponseState, result, {
        state,
        currentCharacterId: selectedCharacterId,
      });
      dispatch(
        interactionSuccess({
          ...currentResponseState,
          completed: false,
        }),
      );
    }
    if (!currentResponseState.characters.find(({ characterId }) => characterId === selectedCharacterId)?.text) {
      throw new Error('No text');
    }

    dispatch(
      interactionSuccess({
        ...currentResponseState,
        completed: true,
      }),
    );
    secondaryPromptBuilder.setTrucationLength(secondary.truncation_length - 150);
    let prefixConditionPrompt = secondaryPromptBuilder.buildPrompt(
      {
        state: {
          ...state,
          narration: {
            ...state.narration,
            responses: {
              ...state.narration.responses,
              [state.narration.currentResponseId]: currentResponseState,
            },
          },
        },
        currentCharacterId: selectedCharacterId,
      },
      maxMessages,
    ).template;
    finishedCompletionResult.get('text');
    prefixConditionPrompt = prefixConditionPrompt.replace(
      /{{GEN text (.*?)}}/g,
      finishedCompletionResult.get('text') || '',
    );
    prefixConditionPrompt = prefixConditionPrompt.replace(
      '{{SEL emotion options=emotions}}',
      finishedCompletionResult.get('emotion') || '',
    );
    const objectives = [...selectCurrentSceneObjectives(state)];
    if (
      !objectives.some((objective) =>
        objective.actions.some((action) => action.type === NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE),
      ) &&
      !currentScene?.preventSceneGenerationSuggestion
    ) {
      objectives.push({
        id: 'temp_generate_scene_objective',
        condition: '{{char}} and {{user}} are now in a different place',
        name: 'Generate a new scene',
        singleUse: false,
        stateCondition: {
          type: 'IN_SCENE',
          config: {
            sceneIds: [currentScene?.id || ''],
          },
        },
        actions: [
          {
            type: NovelV3.NovelActionType.SUGGEST_CREATE_SCENE,
          },
        ],
      });
    }

    try {
      await Promise.all(
        objectives.map(async (objective) => {
          const condition = objective.condition;
          const conditionResultStream = textCompletion({
            template: fillTextTemplate(
              prefixConditionPrompt +
                AbstractRoleplayStrategy.getConditionPrompt({
                  condition,
                  instructionPrefix: secondaryStrategy.template().instruction,
                  responsePrefix: secondaryStrategy.template().response,
                }),
              {
                user: state.settings.user.name,
                bot: currentCharacter?.card.data.name || '',
              },
            ),
            model: secondary.id,
            serviceBaseUrl: servicesEndpoint,
            identifier,
            variables: {
              cond_opt: [' Yes', ' No'],
            },
          });
          let response = '';
          for await (const result of conditionResultStream) {
            response = result.get('cond') || '';
          }
          if (response === ' Yes') {
            objective.actions.forEach((action) => {
              const stateAction = novelActionToStateAction(action);
              if (stateAction) {
                dispatch(stateAction);
              }
              switch (action.type) {
                case NovelV3.NovelActionType.ACHIEVEMENT_UNLOCK:
                  postMessage(CustomEventType.ACHIEVEMENT_UNLOCKED, {
                    achievement: {
                      id: action.params.achievementId,
                      name: objective.name,
                      description: objective.description || '',
                      inventoryItem: action.params.reward,
                    },
                  });
                  unlockAchievement(apiEndpoint, action.params.achievementId);
                  if (action.params.reward) {
                    dispatch(addItem(action.params.reward));
                  }
                  dispatch(removeObjective(objective.id));
                  break;
                case NovelV3.NovelActionType.SHOW_ITEM:
                  const item = state.inventory.items.find((item) => item.id === action.params.itemId);
                  if (!item) {
                    break;
                  }
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
                        <b>{item.name}</b> added to the inventory
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
                    },
                  );
                  break;
              }
            });
            if (objective.singleUse) {
              dispatch(removeObjective(objective.id));
            }
          }
        }),
      );
    } catch (error) {
      dispatch(interactionFailure('Failed to unlock achievement'));
    }
  } catch (error) {
    console.error(error);
    dispatch(interactionFailure());
  }
};

export const interactionListenerMiddleware = createListenerMiddleware();

interactionListenerMiddleware.startListening({
  actionCreator: interactionStart,
  effect: async (action, listenerApi) => {
    await interactionEffect(
      listenerApi.dispatch,
      listenerApi.getState() as RootState,
      action.payload.servicesEndpoint,
      action.payload.apiEndpoint,
      action.payload.selectedCharacterId,
    );
  },
});

export const regenerationListenerMiddleware = createListenerMiddleware();

regenerationListenerMiddleware.startListening({
  actionCreator: regenerationStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    await interactionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint,
      action.payload.apiEndpoint,
      action.payload.characterId,
    );
  },
});

export const continueListenerMiddleware = createListenerMiddleware();

continueListenerMiddleware.startListening({
  actionCreator: continueResponse,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const lastResponseCharacters = state.narration.responses[state.narration.currentResponseId]?.characters;
    const lastResponseCharacterId = lastResponseCharacters?.[lastResponseCharacters.length - 1].characterId || '';
    await interactionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint,
      action.payload.apiEndpoint,
      lastResponseCharacterId,
    );
  },
});

export const characterResponseListenerMiddleware = createListenerMiddleware();

characterResponseListenerMiddleware.startListening({
  actionCreator: characterResponseStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    await interactionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint,
      action.payload.apiEndpoint,
      action.payload.characterId,
    );
  },
});
