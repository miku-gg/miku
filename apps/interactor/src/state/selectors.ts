import { EmotionTemplateSlug, NovelV3 } from '@mikugg/bot-utils';
import { createSelector } from '@reduxjs/toolkit';
import PromptBuilder from '../libs/prompts/PromptBuilder';
import { RoleplayPromptStrategy, tokenizeAndSum } from '../libs/prompts/strategies';
import { NarrationInteraction, NarrationResponse } from './slices/narrationSlice';
import { NovelCharacterOutfit, NovelScene } from './slices/novelSlice';
import { RootState } from './store';
import { NovelNSFW } from './versioning';
import { NarrationSummarySentence } from './versioning/v3.state';
import { getExistingModelMetadata } from '../libs/retrieveMetadata';

export const selectLastLoadedResponse = (state: RootState): NarrationResponse | undefined => {
  const { currentResponseId } = state.narration;
  const response = state.narration.responses[currentResponseId];
  if (response?.fetching && response?.parentInteractionId) {
    const interaction = state.narration.interactions[response.parentInteractionId];
    let selectedResponseId = interaction?.responsesId.find((id) => !state.narration.responses[id]?.selected);
    if (!selectedResponseId) {
      selectedResponseId = interaction?.parentResponseId || '';
    }
    return state.narration.responses[selectedResponseId || ''];
  } else {
    return response;
  }
};

export const selectTokensCount = (state: RootState) => {
  const currentResponseState: NarrationResponse = state.narration.responses[state.narration.currentResponseId]!;

  const responsePromptBuilder = new PromptBuilder<RoleplayPromptStrategy>({
    maxNewTokens: 200,
    strategy: new RoleplayPromptStrategy('lyra'),
    truncationLength: 32000,
  });

  const messagesSinceLastSummary = selectMessagesSinceLastSummary(state);
  const maxMessages = state.settings.summaries?.enabled
    ? messagesSinceLastSummary
    : selectAllParentDialogues(state).length;

  const tokens = responsePromptBuilder.buildPrompt(
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
      currentCharacterId: currentResponseState.selectedCharacterId || '',
    },
    maxMessages,
  ).totalTokens;
  return tokens;
};

export const selectSceneFromResponse = (
  state: RootState,
  response: NarrationResponse | undefined,
): NovelScene | undefined => {
  const interactionId = response?.parentInteractionId || '';
  if (interactionId) {
    return state.novel.scenes.find((scene) => scene.id === state.narration.interactions[interactionId]?.sceneId);
  } else {
    const start = state.novel.starts.find((start) => start.id === response?.id);
    return state.novel.scenes.find((scene) => scene.id === start?.sceneId);
  }
};

export const selectCurrentScene = (state: RootState): NovelScene | undefined => {
  const { currentResponseId } = state.narration;
  const response = state.narration.responses[currentResponseId];
  return selectSceneFromResponse(state, response);
};

export const selectCharacterOutfits = (state: RootState, characterId: string): NovelCharacterOutfit[] => {
  return (
    state.novel.characters
      .find((character) => character.id === characterId)
      ?.card.data.extensions.mikugg_v2.outfits.map((outfit) => ({
        ...outfit,
        nsfw: outfit.nsfw as NovelNSFW,
        template: outfit.template as EmotionTemplateSlug,
      })) || []
  );
};

export const selectLastImageOfCharacter = (state: RootState, characterId: string, responseId?: string): string => {
  const { currentResponseId } = state.narration;
  responseId = responseId || currentResponseId;
  const response = state.narration.responses[responseId];
  const scene = selectSceneFromResponse(state, response);
  const characterResponse = response?.characters.find((character) => character.characterId === characterId);
  if (characterResponse?.text) {
    const characterOutfitId = scene?.characters.find((character) => character.characterId === characterId)?.outfit;
    const outfits = selectCharacterOutfits(state, characterId);
    const outfit = outfits.find((outfit) => outfit.id === characterOutfitId);
    const emotions = outfit?.emotions.find((emotion) => emotion.id === characterResponse.emotion);
    return emotions?.sources.webm || emotions?.sources.png || '';
  } else if (response?.parentInteractionId) {
    const interaction = state.narration.interactions[response?.parentInteractionId];
    const oldResponseId = interaction?.parentResponseId;
    if (!oldResponseId) return '';
    else return selectLastImageOfCharacter(state, characterId, oldResponseId || '');
  } else {
    return '';
  }
};

export const selectLastLoadedCharacters = createSelector(
  [
    (state) => state,
    selectLastLoadedResponse,
    (state: RootState) => selectSceneFromResponse(state, selectLastLoadedResponse(state)),
    (state: RootState) => state.novel.characters,
    (state) => state,
  ],
  (state: RootState, response?: NarrationResponse, scene?: NovelScene) => {
    return (
      scene?.characters.map(({ characterId, outfit }) => {
        const characterResponse = response?.characters.find((character) => character.characterId === characterId);
        const emotionSlug = characterResponse?.emotion || '';
        return {
          id: characterId || '',
          outfit: outfit || '',
          text: characterResponse?.text || '',
          image: selectLastImageOfCharacter(state, characterId, response?.id),
          emotion: emotionSlug,
          selected: characterId === response?.selectedCharacterId,
          reasoning: characterResponse?.reasoning || '',
        };
      }) || []
    );
  },
);

export const selectLastSelectedCharacter = createSelector([selectLastLoadedCharacters], (characters) => {
  return characters.find((character) => character.selected) || characters[0];
});

export const selectScenes = createSelector(
  [
    (state: RootState) => state.novel.scenes,
    (state: RootState) => state.novel.characters,
    (state: RootState) => state.novel.backgrounds,
  ],
  (scenes, characters, backgrounds) => {
    return scenes.map((scene) => {
      const characterImages = scene.characters.map(({ characterId, outfit: outfitId }) => {
        const outfits = selectCharacterOutfits({ novel: { characters } } as RootState, characterId || '');
        const outfit = outfits.find((outfit) => outfit.id === outfitId);
        const neutralEmotion = outfit?.emotions.find((emotion) => emotion.id === 'neutral') || outfit?.emotions[0];
        return neutralEmotion?.sources.png || '';
      });

      const backgroundImage = backgrounds.find((background) => background.id === scene.backgroundId)?.source.jpg || '';

      return {
        ...scene,
        characterImages,
        backgroundImage,
      };
    });
  },
);

export const selectAvailableScenes = createSelector(
  [selectScenes, (state: RootState) => state.settings.user.nsfw, selectCurrentScene],
  (scenes, nsfw, currentScene) => {
    if (scenes.length === 1) return [];
    return scenes.filter((scene) => currentScene?.children.includes(scene.id)).filter((scene) => nsfw >= scene.nsfw);
  },
);

export const selectCurrentSwipeResponses = createSelector(
  [
    (state: RootState) => state.narration.interactions,
    (state: RootState) => state.narration.responses,
    (state: RootState) => state.narration.currentResponseId,
  ],
  (interactions, responses, currentResponseId) => {
    if (responses[currentResponseId]?.parentInteractionId) {
      const interaction = interactions[responses[currentResponseId]?.parentInteractionId || ''];
      return interaction?.responsesId.map((id) => responses[id]);
    } else {
      return Object.values(responses).filter((responses) => responses?.parentInteractionId === null);
    }
  },
);

export const selectAllParentDialogues = createSelector(
  [
    (state: RootState) => state.narration.interactions,
    (state: RootState) => state.narration.responses,
    (state: RootState) => state.narration.currentResponseId,
  ],
  (interactions, responses, currentResponseId) => {
    let responseIdPointer = currentResponseId;
    const dialogues: (
      | { type: 'response'; item: NarrationResponse }
      | { type: 'interaction'; item: NarrationInteraction }
    )[] = [];
    while (responseIdPointer) {
      const response = responses[responseIdPointer];
      if (response) {
        dialogues.push({ type: 'response', item: response });
        if (response?.parentInteractionId) {
          const interaction = interactions[response?.parentInteractionId];
          if (interaction) {
            dialogues.push({ type: 'interaction', item: interaction });
            responseIdPointer = interaction?.parentResponseId || '';
          } else {
            break;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return dialogues;
  },
);

export const selectCurrentCharacterOutfits = createSelector(
  [(state: RootState) => state.novel.characters, selectCurrentScene, selectLastLoadedResponse],
  (characters, scene) => {
    return (
      scene?.characters
        .map(({ characterId, outfit: outfitId }) => {
          const character = characters.find((character) => character.id === characterId);
          const outfits = selectCharacterOutfits({ novel: { characters } } as RootState, characterId);
          const outfit = outfits.find((outfit) => outfit.id === outfitId);
          return {
            id: characterId,
            name: character?.name,
            outfit,
          };
        })
        .filter((char) => char.outfit) || []
    );
  },
);

export const selectChatHistory = createSelector(
  [selectAllParentDialogues, (state: RootState) => state.novel.characters, (state: RootState) => state],
  (
    dialogues,
    characters,
    state,
  ): {
    name: string;
    text: string;
    type: 'response' | 'interaction';
  }[] => {
    return dialogues
      .map(
        (
          dialogue,
        ): {
          name: string;
          text: string;
          type: 'response' | 'interaction';
        }[] => {
          const interaction = state.narration.interactions[dialogue.item.id];
          if (interaction) {
            const character = state.settings.user.name;
            return [
              {
                name: character,
                text: interaction.query,
                type: 'interaction',
              },
            ];
          }

          const response = state.narration.responses[dialogue.item.id];
          if (response) {
            return response.characters.map(
              ({
                characterId,
                text,
              }): {
                name: string;
                text: string;
                type: 'response' | 'interaction';
              } => {
                const char = characters.find((character) => character.id === characterId);
                return {
                  name: char?.name || '',
                  text,
                  type: 'response',
                };
              },
            );
          } else {
            return [];
          }
        },
      )
      .flat();
  },
);

export const selectCharactersInCurrentScene = createSelector(
  [(state: RootState) => state.novel.characters, selectCurrentScene],
  (characters, scene) => {
    return scene?.characters.map(({ characterId, outfit: outfitId }) => {
      const character = characters.find((character) => character.id === characterId);
      const outfits = selectCharacterOutfits({ novel: { characters } } as RootState, characterId);
      const outfit = outfits.find((outfit) => outfit.id === outfitId);
      return {
        ...character,
        outfit,
      };
    });
  },
);

export const selectCurrentNextScene = createSelector(
  [selectAllParentDialogues, selectCurrentScene],
  (dialogues, scene) => {
    if (scene?.id && dialogues.length) {
      const findFirstCurrentSceneIndex =
        dialogues.findIndex((d) => d.type == 'interaction' && d.item.sceneId !== scene.id) - 1;

      const currentDialogues = dialogues.slice(
        0,
        findFirstCurrentSceneIndex < 0 ? dialogues.length : findFirstCurrentSceneIndex,
      );
      const _responseOfSuggestion = currentDialogues.find((d) => d.type === 'response' && d.item.nextScene);
      return _responseOfSuggestion?.type === 'response' ? _responseOfSuggestion.item.nextScene || null : null;
    }
    return null;
  },
);

export const selectCurrentMaps = createSelector(
  [selectCurrentScene, (state: RootState) => state.novel.maps],
  (scene, maps) => {
    const mapIds = scene?.parentMapIds;
    return (
      mapIds
        ?.map((mapId) => maps.find((map) => map.id === mapId) || null)
        .filter((map) => map !== null)
        .map((currentMap) => ({
          ...(currentMap as NovelV3.NovelMap),
          places:
            currentMap?.places.map((place) => ({
              ...place,
              isCurrentPlace: place.sceneId === scene?.id,
            })) || [],
        })) || []
    );
  },
);

export const selectAllParentDialoguesWhereCharactersArePresent = createSelector(
  [
    selectAllParentDialogues,
    (state: RootState) => state.novel.scenes,
    (_state: RootState, characterIds: string[]) => characterIds,
    (state: RootState) => state,
  ],
  (dialogues, scenes, characterIds, state) => {
    const result = [];
    for (let i = 0; i < dialogues.length; i++) {
      const dialogue = dialogues[i];
      const scene =
        dialogue.type === 'interaction'
          ? scenes.find((scene) => scene.id === dialogue.item.sceneId)
          : selectSceneFromResponse(state, dialogue.item);
      if (scene && scene.characters.some((c) => characterIds.includes(c.characterId))) {
        result.push(dialogue);
      }
    }
    return result;
  },
);

export const selectCurrentSceneObjectives = createSelector(
  [
    (state: RootState) => state.objectives,
    selectCurrentScene,
    (state: RootState) => state.novel.scenes,
    (state: RootState) => state.settings.user.nsfw,
  ],
  (objectives, scene, scenes, nsfw) => {
    return objectives.filter((objective) => {
      const sceneIds = objective.stateCondition?.config?.sceneIds || [];
      const scenesFromObjectives = scenes.filter((scene) => sceneIds.includes(scene.id));
      if (nsfw === NovelNSFW.NONE && scenesFromObjectives.some((scene) => scene.nsfw > NovelNSFW.NONE)) {
        return false;
      }
      return objective.stateCondition?.type === 'IN_SCENE' && (sceneIds.includes(scene?.id || '') || !sceneIds.length);
    });
  },
);

export const selectConditionStatus = (state: RootState, condition: NovelV3.StateCondition) => {
  switch (condition.type) {
    case 'IN_SCENE':
      return condition.config.sceneIds.includes(selectCurrentScene(state)?.id || '');
  }
  return false;
};

export const selectCurrentSceneInteractionCount = createSelector(
  [(state: RootState) => state.narration.interactions, selectCurrentScene],
  (interactions, scene) => {
    return Object.values(interactions).filter((interaction) => interaction?.sceneId === scene?.id).length;
  },
);

export const selectMessagesSinceLastSummary = createSelector([selectAllParentDialogues], (dialogues) => {
  const lastSummaryIndex = dialogues.findIndex((d) => d.type === 'response' && d.item.summary?.sentences.length);
  if (lastSummaryIndex === -1) return dialogues.length;
  return Math.max(dialogues.slice(0, lastSummaryIndex + 1).length, 2);
});

export const selectAllSumaries = createSelector(
  [
    selectAllParentDialoguesWhereCharactersArePresent,
    (state: RootState) => state.narration.responses,
    (_state: RootState, characterIds: string[]) => characterIds,
  ],
  (dialogues, responses) => {
    const summaries: {
      responseId: string;
      sentences: NarrationSummarySentence[];
    }[] = [];
    dialogues.forEach((dialogue) => {
      const response = responses[dialogue.item.id];
      if (response?.summary?.sentences.length) {
        summaries.push({
          responseId: dialogue.item.id,
          sentences: response.summary.sentences,
        });
      }
    });
    return summaries;
  },
);

export const selectAvailableSummarySentences = createSelector(
  [selectAllSumaries, (_state: RootState, _characters: string[], maxPromptLength: number) => maxPromptLength],
  (summaries, maxPromptLength: number) => {
    const REST_PROMPT_LENGTH = Math.min(4096, maxPromptLength);
    const OFFSET_TOKENS = 30;
    const maxTokens = maxPromptLength - REST_PROMPT_LENGTH - OFFSET_TOKENS;

    const allSentences: { sentence: string; importance: number; isLast: boolean }[] = [];

    [...summaries].reverse().forEach((summary, index) => {
      const isLast = index === summaries.length - 1;
      summary?.sentences.forEach((s) => allSentences.push({ ...s, isLast }));
    });
    let summariesTokens = tokenizeAndSum(summaries.map((s) => s.sentences.join('\n')).join('\n'));

    if (summariesTokens > maxTokens) {
      const removalOrder = [
        { importance: 1, isLast: false },
        { importance: 2, isLast: false },
        { importance: 3, isLast: false },
        { importance: 4, isLast: false },
        { importance: 1, isLast: true },
        { importance: 5, isLast: false },
        { importance: 2, isLast: true },
        { importance: 3, isLast: true },
        { importance: 4, isLast: true },
        { importance: 5, isLast: true },
      ];

      for (const { importance, isLast } of removalOrder) {
        summariesTokens = tokenizeAndSum(allSentences.map((s) => s.sentence).join('\n'));
        while (summariesTokens > maxTokens) {
          const index = allSentences.findIndex((s) => s.importance === importance && s.isLast === isLast);
          if (index === -1) break;
          allSentences.splice(index, 1);
        }
        summariesTokens = tokenizeAndSum(allSentences.map((s) => s.sentence).join('\n'));
        if (summariesTokens <= maxTokens) break;
      }
    }

    return allSentences.map((s) => s.sentence);
  },
);

export const selectSummaryEnabled = (state: RootState) => {
  return (
    !!state.settings.summaries?.enabled && getExistingModelMetadata(state.settings.model)?.truncation_length > 8000
  );
};

export const selectAllParentScenesIds = createSelector(
  [
    (state: RootState) => state.narration.interactions,
    (state: RootState) => state.narration.responses,
    (state: RootState) => state.narration.currentResponseId,
    (state: RootState) => state.novel.starts,
  ],
  (interactions, responses, currentResponseId, starts) => {
    const parentSceneIds: string[] = [];
    let responseIdPointer = currentResponseId;

    while (responseIdPointer) {
      const response = responses[responseIdPointer];
      if (!response) break;

      let sceneId: string | undefined;

      if (response.parentInteractionId) {
        // If response has a parent interaction, get scene from there
        const interaction = interactions[response.parentInteractionId];
        sceneId = interaction?.sceneId;
      } else {
        // If no parent interaction, check starts (it's an initial response)
        const start = starts.find((start) => start.id === response.id);
        sceneId = start?.sceneId;
      }

      if (sceneId) {
        parentSceneIds.push(sceneId);
      }

      // Move up to parent response
      const interaction = interactions[response.parentInteractionId || ''];
      responseIdPointer = interaction?.parentResponseId || '';
    }

    // Remove adjacent duplicates
    const filteredSceneIds = parentSceneIds.reverse().filter((id, index, arr) => {
      return index === 0 || id !== arr[index - 1];
    });

    return filteredSceneIds;
  },
);

export const selectShouldPlayGlobalStartCutscene = (state: RootState) => {
  const hasNoInteractions = Object.keys(state.narration.interactions).length === 0;
  return (
    !state.narration.hasPlayedGlobalStartCutscene &&
    hasNoInteractions &&
    state.novel.globalStartCutsceneId &&
    !!state.novel.cutscenes?.find((c) => c.id === state.novel.globalStartCutsceneId)
  );
};

export const selectShouldShowStartSelectionModal = createSelector(
  [
    (state: RootState) => Object.keys(state.narration.interactions).length === 0,
    (state: RootState) => state.novel.cutscenes?.find((c) => c.id === state.novel.globalStartCutsceneId),
    (state: RootState) => state.narration.hasShownStartSelectionModal,
    (state: RootState) => state.novel.starts.length > 1,
    (state: RootState) => state.novel.useModalForStartSelection,
    selectShouldPlayGlobalStartCutscene,
  ],
  (
    hasNoInteractions,
    hasGlobalStartCutscene,
    hasShownStartSelectionModal,
    hasMultipleStarts,
    useModalForStartSelection,
    shouldPlayGlobalStartCutscene,
  ) => {
    return (
      !hasShownStartSelectionModal &&
      hasNoInteractions &&
      hasMultipleStarts &&
      useModalForStartSelection &&
      (hasGlobalStartCutscene || !shouldPlayGlobalStartCutscene)
    );
  },
);

export const selectDisplayingCutScene = createSelector(
  [
    selectCurrentScene,
    selectAllParentScenesIds,
    (state: RootState) => state.narration.input.seenCutscene,
    selectShouldPlayGlobalStartCutscene,
    (state: RootState) => state.narration.currentBattle,
    (state: RootState) => state.novel.battles,
  ],
  (scene, parentSceneIds, isCurrentCutsceneSeen, shouldPlayGlobalStartCutscene, currentBattle, battles) => {
    // battle cutscenes: intro, win, loss
    if (currentBattle && currentBattle.isActive) {
      const battleConfig = battles?.find((b) => b.battleId === currentBattle.state.battleId);
      if (currentBattle.state.status === 'intro' && battleConfig?.introCutsceneId) {
        return true;
      }
      if (currentBattle.state.status === 'victory-cutscene' && battleConfig?.winCutsceneId) {
        return true;
      }
      if (currentBattle.state.status === 'defeat-cutscene' && battleConfig?.lossCutsceneId) {
        return true;
      }
    }
    // global start cutscene
    if (shouldPlayGlobalStartCutscene) {
      return true;
    }
    // per-scene cutscene
    const hasCutscene = !!scene?.cutScene;
    const isAlreadyTriggered =
      parentSceneIds.slice(0, parentSceneIds.length - 1).includes(scene?.id || '') && scene?.cutScene?.triggerOnlyOnce;
    return hasCutscene && !isAlreadyTriggered && !isCurrentCutsceneSeen;
  },
);

export const selectCurrentIndicators = createSelector(
  [
    selectCurrentScene,
    (state: RootState) => state.narration.currentResponseId,
    (state: RootState) => state.narration.responses,
  ],
  (scene, currentResponseId, responses) => {
    const indicators = scene?.indicators || [];
    const updatedIndicators = responses[currentResponseId]?.indicators || [];
    return indicators.map((indicator) => {
      const updatedIndicator = updatedIndicators.find((i) => i.id === indicator.id);
      return { ...indicator, currentValue: updatedIndicator?.value || indicator.initialValue };
    });
  },
);

export const selectCurrentInteraction = (state: RootState) => {
  const currentResponse = state.narration.responses[state.narration.currentResponseId];
  return currentResponse?.parentInteractionId
    ? state.narration.interactions[currentResponse.parentInteractionId]
    : null;
};

export const selectCurrentCutscene = (state: RootState) => {
  // battle cutscenes: intro, win, loss
  const currentBattle = state.narration.currentBattle;
  const battles = state.novel.battles;
  if (currentBattle) {
    const battleConfig = battles?.find((b) => b.battleId === currentBattle.state.battleId);
    if (currentBattle.state.status === 'intro' && battleConfig?.introCutsceneId) {
      return state.novel.cutscenes?.find((c) => c.id === battleConfig.introCutsceneId);
    }
    if (currentBattle.state.status === 'victory-cutscene' && battleConfig?.winCutsceneId) {
      return state.novel.cutscenes?.find((c) => c.id === battleConfig.winCutsceneId);
    }
    if (currentBattle.state.status === 'defeat-cutscene' && battleConfig?.lossCutsceneId) {
      return state.novel.cutscenes?.find((c) => c.id === battleConfig.lossCutsceneId);
    }
  }
  // global start cutscene
  const shouldPlayGlobal = selectShouldPlayGlobalStartCutscene(state);
  if (shouldPlayGlobal && state.novel.globalStartCutsceneId) {
    return state.novel.cutscenes?.find((c) => c.id === state.novel.globalStartCutsceneId);
  }
  // per-scene cutscene
  const scene = selectCurrentScene(state);
  const cutsceneId = scene?.cutScene?.id;
  if (cutsceneId) {
    return state.novel.cutscenes?.find((c) => c.id === cutsceneId);
  }
  return undefined;
};

export const selectCurrentCutScenePart = createSelector(
  [(state: RootState) => state.narration.input.cutscenePartIndex || 0, selectCurrentCutscene],
  (currentPartIndex, cutscene) => {
    if (!cutscene || !cutscene.parts) return null;
    return cutscene.parts[currentPartIndex] || null;
  },
);
