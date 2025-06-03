import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit';
import {
  interactionStart,
  interactionFailure,
  interactionSuccess,
  regenerationStart,
  NarrationResponse,
  continueResponse,
  characterResponseStart,
  addSummary,
  setCurrentBattle,
} from '../slices/narrationSlice';
import { RootState } from '../store';
import textCompletion from '../../libs/textCompletion';
import PromptBuilder from '../../libs/prompts/PromptBuilder';
import { retrieveModelMetadata } from '../../libs/retrieveMetadata';
import { fillTextTemplate, SummaryPromptStrategy } from '../../libs/prompts/strategies';
import {
  indicatorVarName,
  RoleplayPromptStrategy,
} from '../../libs/prompts/strategies/roleplay/RoleplayPromptStrategy';
import {
  selectAllParentDialogues,
  selectCurrentInteraction,
  selectCurrentScene,
  selectCurrentSceneObjectives,
  selectMessagesSinceLastSummary,
  selectSummaryEnabled,
} from '../selectors';
import { NovelV3 } from '@mikugg/bot-utils';
import { CustomEventType, postMessage } from '../../libs/stateEvents';
import { unlockAchievement } from '../../libs/platformAPI';
import { addItem } from '../slices/inventorySlice';
import { removeObjective } from '../slices/objectivesSlice';
import { toast } from 'react-toastify';
import { GiOpenChest } from 'react-icons/gi';
import { novelActionToStateAction } from '../mutations';
import { getInitialBattleState } from '../utils/battleUtils';

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
    const currentInteraction = selectCurrentInteraction(state);
    const { secondary, strategy, truncation_length, has_reasoning } = (await retrieveModelMetadata(
      servicesEndpoint,
      state.settings.model,
    )) || {
      strategy: 'llama3',
      tokenizer: 'llama',
      truncation_length: 4096,
    };
    const messagesSinceLastSummary = selectMessagesSinceLastSummary(state);
    const maxMessages = selectSummaryEnabled(state)
      ? Math.max(messagesSinceLastSummary, 16)
      : selectAllParentDialogues(state).length;
    const primaryStrategy = new RoleplayPromptStrategy(strategy, state.novel.language || 'en', has_reasoning);

    const [responsePromptBuilder, secondaryPromptBuilder] = [
      new PromptBuilder<RoleplayPromptStrategy>({
        maxNewTokens: 200,
        strategy: primaryStrategy,
        truncationLength: truncation_length - 150,
      }),
      new PromptBuilder<RoleplayPromptStrategy>({
        maxNewTokens: 200,
        strategy: new RoleplayPromptStrategy(secondary.strategy, state.novel.language || 'en', secondary.has_reasoning),
        truncationLength: secondary.truncation_length - 150,
      }),
    ];

    // Track battle starts and completed objectives
    let battleStartId: string | undefined = undefined;
    const completedObjectiveIds: string[] = [];

    // Check if a battle starts at the beginning of this scene
    if (currentScene?.battleAtBeginning) {
      battleStartId = currentScene.battleAtBeginning;
    }

    // Indicators stuff
    // ----------------------------
    const indicators = [...(currentResponseState.indicators || [])];
    // prefill indicators
    if (state.narration.input.prefillIndicators?.length) {
      state.narration.input.prefillIndicators.forEach((indicator) => {
        indicators.push({
          ...indicator,
          value: indicator.value.toString(),
        });
      });
    }
    // check non-inferred indicators
    currentScene?.indicators?.forEach((indicator) => {
      if (!indicator.inferred && indicator.type !== 'discrete' && !indicators.find((m) => m.id === indicator.id)) {
        const valueString = getPreviousIndicatorValueString(
          state,
          indicator.id,
          currentInteraction?.parentResponseId || null,
          currentScene?.id,
        );
        let value = valueString ? Number(valueString) + Number(indicator.step || 0) : Number(indicator.initialValue);
        value = Math.min(value, indicator.max || 100);
        value = Math.max(value, indicator.min || 0);
        indicators.push({
          ...indicator,
          value: value.toString(),
        });
      }
    });

    // check discrete indicators
    currentScene?.indicators?.forEach((indicator) => {
      if (indicator.type === 'discrete' && !currentResponseState.indicators?.find((m) => m.id === indicator.id)) {
        const previousValue = getPreviousIndicatorValueString(
          state,
          indicator.id,
          currentInteraction?.parentResponseId || null,
          currentScene?.id,
        );
        indicators.push({
          ...indicator,
          value: previousValue?.toString() || indicator.initialValue,
        });
      }
    });

    currentResponseState = {
      ...currentResponseState,
      indicators,
    };

    if (!currentCharacterResponse?.emotion && secondary.id !== state.settings.model) {
      const emotionPrompt = secondaryPromptBuilder.buildPrompt(
        { state, currentCharacterId: selectedCharacterId },
        Math.min(truncation_length / 200, maxMessages),
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
      } else {
        throw new Error('Novel prompt is too big');
      }
    }

    const startText =
      currentResponseState?.characters?.find(({ characterId }) => characterId == selectedCharacterId)?.text || '';
    const completionState = {
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
    };
    const completionQuery = responsePromptBuilder.buildPrompt(completionState, maxMessages);
    const secondaryCompletionQuery = secondaryPromptBuilder.buildPrompt(completionState, maxMessages);

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
    let prefixConditionPrompt = secondaryCompletionQuery.template;
    finishedCompletionResult.get('text');
    prefixConditionPrompt = prefixConditionPrompt.replace(
      /{{GEN text (.*?)}}/g,
      finishedCompletionResult.get('text') || '',
    );
    prefixConditionPrompt = prefixConditionPrompt.replace(
      '{{SEL emotion options=emotions}}',
      finishedCompletionResult.get('emotion') || '',
    );
    for (const indicator of currentResponseState.indicators || []) {
      const indicatorFromScene = currentScene?.indicators?.find((m) => m.id === indicator.id);
      if (indicatorFromScene) {
        prefixConditionPrompt = prefixConditionPrompt.replace(
          `{{GEN ${indicatorVarName(indicatorFromScene?.name || '')} max_tokens=3 stop=["%"]}}`,
          indicator.value.toString(),
        );
      }
    }
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
      const language = state.novel.language || 'en';
      await Promise.all(
        objectives.map(async (objective) => {
          const condition = objective.condition;
          let response = '';
          if (condition) {
            const conditionResultStream = textCompletion({
              template: fillTextTemplate(
                prefixConditionPrompt +
                  RoleplayPromptStrategy.getConditionPrompt({
                    condition,
                    instructionPrefix: primaryStrategy.template().instruction,
                    responsePrefix: primaryStrategy.template().response,
                    language,
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
                cond_opt: [` Yes`, ` No`],
              },
            });
            for await (const result of conditionResultStream) {
              response = result.get('cond') || '';
            }
          } else {
            response = ' Yes';
          }

          if (response === ` Yes`) {
            // Track that this objective was completed
            completedObjectiveIds.push(objective.id);

            objective.actions.forEach((action) => {
              const stateActions = novelActionToStateAction(action);
              for (const stateAction of stateActions) {
                dispatch(stateAction);
              }
              let item: NovelV3.InventoryItem | undefined = undefined;
              switch (action.type) {
                case NovelV3.NovelActionType.ACHIEVEMENT_UNLOCK:
                  postMessage(CustomEventType.ACHIEVEMENT_UNLOCKED, {
                    achievement: {
                      id: action.params.achievementId,
                      name: objective.name,
                      description: objective.description || '',
                      inventoryItem: action.params.reward,
                      collectibleImage: action.params.collectibleImage,
                    },
                  });
                  unlockAchievement(apiEndpoint, action.params.achievementId);
                  if (action.params.reward) {
                    dispatch(addItem(action.params.reward));
                  }
                  dispatch(removeObjective(objective.id));
                  break;
                case NovelV3.NovelActionType.SHOW_ITEM:
                  item = state.inventory.items.find((item) => item.id === action.params.itemId);
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
                case NovelV3.NovelActionType.BATTLE_START: {
                  const battleId = action.params.battleId;
                  // Track that a battle started from this objective
                  if (!battleStartId) {
                    battleStartId = battleId;
                  }
                  const battleConfig = state.novel.battles?.find((b) => b.battleId === battleId);
                  const rpgConfig = state.novel.rpg;
                  if (battleConfig && rpgConfig) {
                    const initialBattleState = getInitialBattleState(battleConfig, rpgConfig);
                    dispatch(setCurrentBattle({ state: initialBattleState, isActive: false }));
                  }
                  break;
                }
                default:
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
      dispatch(interactionFailure('Failed to check a condition'));
    }

    // Update the response with battle start and completed objectives
    if (battleStartId || completedObjectiveIds.length > 0) {
      const updatedResponse = {
        ...currentResponseState,
        ...(battleStartId && { battleStartId }),
        ...(completedObjectiveIds.length > 0 && { objectiveCompletedIds: completedObjectiveIds }),
      };

      dispatch(
        interactionSuccess({
          ...updatedResponse,
          completed: true,
        }),
      );
    }

    try {
      const messagesSinceLastSummary = selectMessagesSinceLastSummary(state);
      const currentInteraction = state.narration.interactions[currentResponseState.parentInteractionId || ''];
      const previousInteraction = currentInteraction
        ? state.narration.interactions[
            state.narration.responses[currentInteraction.parentResponseId || '']?.parentInteractionId || ''
          ]
        : null;
      const sceneChanged = previousInteraction && previousInteraction.sceneId !== currentInteraction?.sceneId;

      if (secondary.truncation_length > 7900 && (messagesSinceLastSummary >= 40 || sceneChanged)) {
        const summaryPromptBuilder = new PromptBuilder<SummaryPromptStrategy>({
          maxNewTokens: 200,
          strategy: new SummaryPromptStrategy(secondary.strategy, state.novel.language || 'en'),
          truncationLength: secondary.truncation_length,
        });

        const messagesToSummarize = Math.min(messagesSinceLastSummary, 60);
        const sentencesToGenerate = Math.max(1, Math.floor(messagesToSummarize / 4));
        let previousResponseState = state.narration.responses[currentInteraction?.parentResponseId || ''];
        if (!previousResponseState || !currentInteraction) {
          return;
        }

        const prompt = summaryPromptBuilder.buildPrompt(
          {
            state,
            characterIds: [currentCharacterResponse?.characterId || ''],
            sentencesToGenerate,
            excludeLastResponse: true,
          },
          messagesToSummarize,
        );

        const stream = textCompletion({
          serviceBaseUrl: servicesEndpoint,
          identifier,
          model: secondary.id,
          template: prompt.template,
          variables: prompt.variables,
        });

        for await (const result of stream) {
          previousResponseState = summaryPromptBuilder.completeResponse(previousResponseState, result, {
            state,
            characterIds: [currentCharacterResponse?.characterId || ''],
            sentencesToGenerate,
          });
        }

        if (previousResponseState.summary) {
          dispatch(
            addSummary({
              responseId: currentInteraction.parentResponseId || '',
              summary: previousResponseState.summary,
            }),
          );
        }
      }
    } catch (error) {
      console.log(error);
      // toast.warn('Failed to generate summary');
    }
  } catch (error) {
    console.error(error);
    dispatch(interactionFailure());
  }
};

const getPreviousIndicatorValueString = (
  state: RootState,
  indicatorId: string,
  parentResponseId: string | null,
  currentSceneId: string,
): string | null => {
  let responseId = parentResponseId;
  if (responseId) {
    const response = state.narration.responses[responseId];
    if (response && response.indicators) {
      const indicator = response.indicators.find((m) => m.id === indicatorId);
      if (indicator) {
        return indicator.value;
      }
    }
    const parentInteraction = state.narration.interactions[response?.parentInteractionId || ''];
    if (parentInteraction?.sceneId !== currentSceneId) {
      return null;
    } else {
      responseId = parentInteraction?.parentResponseId || null;
    }
  }
  return null;
};

export const interactionListenerMiddleware = createListenerMiddleware();

interactionListenerMiddleware.startListening({
  actionCreator: interactionStart,
  effect: async (action, listenerApi) => {
    // Trigger battle at scene start if configured
    const state = listenerApi.getState() as RootState;
    if (action.payload.isNewScene) {
      const scene = state.novel.scenes.find((s) => s.id === action.payload.sceneId);
      const battleId = scene?.battleAtBeginning;
      if (battleId) {
        const battleConfig = state.novel.battles?.find((b) => b.battleId === battleId);
        const rpgConfig = state.novel.rpg;
        if (battleConfig && rpgConfig) {
          const initialBattleState = getInitialBattleState(battleConfig, rpgConfig);
          listenerApi.dispatch(setCurrentBattle({ state: initialBattleState, isActive: false }));
        }
      }
    }
    // Proceed with normal interaction effect
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
