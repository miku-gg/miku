import { CharacterBook, NovelV3 } from '@mikugg/bot-utils';

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { v4 as randomUUID } from 'uuid';
import { toast } from 'react-toastify';
import apiClient from '../../libs/imageInferenceAPI';

// 1. Extend the state to track pending inferences
export interface PendingInference {
  inferenceId: string;
  status: 'pending' | 'done' | 'error';
  createdAt: number;
  resultImage?: string;

  inferenceType: 'character' | 'emotion' | 'background' | 'item';
  prompt: string; // store the description/prompt
  headPrompt?: string;
  modelToUse: number;
  seed: string;
  poseImage?: string;
  referenceImage?: string;

  characterId?: string; // used by character/emotion types
  outfitId?: string; // used by character/emotion types
  emotionId?: string; // used by the emotion type
  backgroundId?: string; // used by background type
  itemId?: string; // used by item type (if needed)
}

const initialState: NovelV3.NovelState & { pendingInferences?: PendingInference[] } = {
  title: '',
  description: '',
  logoPic: '',
  author: '',
  tags: [],
  characters: [],
  backgrounds: [],
  songs: [],
  maps: [],
  scenes: [],
  starts: [],
  lorebooks: [],
  inventory: [],
  cutscenes: [],
  language: 'en',
  pendingInferences: [],
};

const novelFormSlice = createSlice({
  name: 'novel',
  initialState,
  reducers: {
    addChildScene: (state, action: PayloadAction<{ sourceId: string; targetId: string }>) => {
      const { sourceId, targetId } = action.payload;
      const sourceScene = state.scenes.find((scene) => scene.id === sourceId);
      if (sourceScene && !sourceScene.children.includes(targetId)) {
        sourceScene.children.push(targetId);
      }
    },
    deleteChildScene: (state, action: PayloadAction<{ sourceId: string; targetId: string }>) => {
      const { sourceId, targetId } = action.payload;
      const sourceScene = state.scenes.find((scene) => scene.id === sourceId);
      if (sourceScene) {
        sourceScene.children = sourceScene.children.filter((childId) => childId !== targetId);
      }
    },
    addBackground: (state, action: PayloadAction<NovelV3.NovelBackground>) => {
      state.backgrounds.push(action.payload);
    },
    updateBackground: (state, action: PayloadAction<NovelV3.NovelBackground>) => {
      const index = state.backgrounds.findIndex((background) => background.id === action.payload.id);
      if (index === -1) return;
      state.backgrounds[index] = action.payload;
    },
    deleteBackground: (state, action: PayloadAction<string>) => {
      const index = state.backgrounds.findIndex((background) => background.id === action.payload);
      if (index === -1) return;
      state.backgrounds.splice(index, 1);
    },
    addSong: (state, action: PayloadAction<NovelV3.NovelSong>) => {
      state.songs.push(action.payload);
    },
    updateSong: (state, action: PayloadAction<NovelV3.NovelSong>) => {
      const index = state.songs.findIndex((song) => song.id === action.payload.id);
      if (index === -1) return;
      state.songs[index] = action.payload;
    },
    deleteSong: (state, action: PayloadAction<string>) => {
      const index = state.songs.findIndex((song) => song.id === action.payload);
      if (index === -1) return;
      state.songs.splice(index, 1);
    },
    createCharacter: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const character: NovelV3.NovelCharacter = {
        id,
        name: 'char1',
        short_description: '',
        profile_pic: 'empty_char.png',
        tags: [],
        nsfw: NovelV3.NovelNSFW.NONE,
        card: {
          spec: 'chara_card_v2',
          spec_version: '2.0',
          data: {
            name: 'char1',
            alternate_greetings: [],
            character_version: '1',
            creator: '',
            creator_notes: '',
            description: '',
            extensions: {
              mikugg_v2: {
                license: 'CC BY-NC-SA 4.0',
                language: 'en',
                short_description: '',
                profile_pic: 'empty_char.png',
                nsfw: NovelV3.NovelNSFW.NONE,
                outfits: [
                  {
                    id: randomUUID(),
                    name: 'default',
                    description: 'The default outfit',
                    attributes: [],
                    template: 'single-emotion',
                    nsfw: NovelV3.NovelNSFW.NONE,
                    emotions: [
                      {
                        id: 'neutral',
                        sources: {
                          png: 'empty_char_emotion.png',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            first_mes: '',
            mes_example: '',
            personality: '',
            post_history_instructions: '',
            scenario: '',
            system_prompt: '',
            tags: [],
          },
        },
      };
      state.characters.push(character);
    },
    updateCharacter: (state, action: PayloadAction<NovelV3.NovelCharacter>) => {
      const index = state.characters.findIndex((character) => character.id === action.payload.id);
      if (index === -1) return;
      state.characters[index] = action.payload;
    },
    deleteCharacter: (state, action: PayloadAction<string>) => {
      const index = state.characters.findIndex((character) => character.id === action.payload);
      if (index === -1) return;
      state.characters.splice(index, 1);
    },
    addCharacter(state, action: PayloadAction<NovelV3.NovelCharacter>) {
      state.characters.push(action.payload);
    },
    createSceneWithDefaults: (state) => {
      const newScene: NovelV3.NovelScene = {
        id: randomUUID(),
        actionText: '',
        condition: '',
        musicId: state.songs[0]?.id || '',
        name: 'New Scene',
        backgroundId: state.backgrounds[0]?.id || 'default_background.jpg',
        characters: [
          {
            characterId: state.characters[0]?.id || '',
            outfit: state.characters[0]?.card?.data?.extensions?.mikugg_v2?.outfits[0]?.id || '',
            objective: '',
          },
        ],
        children: [],
        nsfw: NovelV3.NovelNSFW.NONE,
        parentMapIds: null,
        prompt: '',
      };
      state.scenes.push(newScene);
    },
    deleteSceneById: (state, action: PayloadAction<string>) => {
      const index = state.scenes.findIndex((scene) => scene.id === action.payload);
      if (index === -1) return;
      state.scenes.forEach((scene) => {
        scene.children = scene.children.filter((childId) => childId !== action.payload);
      });
      // check if the scene is the start scene
      state.scenes.splice(index, 1);
    },
    updateScene: (state, action: PayloadAction<NovelV3.NovelScene>) => {
      const index = state.scenes.findIndex((scene) => scene.id === action.payload.id);
      if (index === -1) return;
      state.scenes[index] = action.payload;
    },
    createStart: (state, action: PayloadAction<string>) => {
      const sceneId = action.payload;
      const scene = state.scenes.find((scene) => scene.id === sceneId);
      state.starts.push({
        id: randomUUID(),
        sceneId,
        characters:
          scene?.characters.map((character) => {
            const characterOutfit = state.characters
              .find((char) => char.id === character.characterId)
              ?.card.data.extensions.mikugg_v2.outfits.find((outfit) => outfit.id === character.outfit);
            return {
              characterId: character.characterId,
              emotion: characterOutfit?.emotions[0]?.id || 'neutral',
              pose: 'standing',
              text: 'Hello!',
            };
          }) || [],
        description: '',
        title: '',
      });
    },
    updateStart: (state, action: PayloadAction<NovelV3.NovelStart>) => {
      const index = state.starts.findIndex((start) => start.id === action.payload.id);
      if (index === -1) return;
      state.starts[index] = action.payload;
    },
    deleteStart: (state, action: PayloadAction<string>) => {
      const index = state.starts.findIndex((start) => start.id === action.payload);
      if (index === -1) return;
      state.starts.splice(index, 1);
    },
    createLorebook: (state, action: PayloadAction<string>) => {
      const lorebook = {
        id: action.payload,
        isGlobal: false,
        name: 'New Lorebook',
        description: '',
        extensions: {},
        entries: [],
      };
      state.lorebooks ? state.lorebooks?.push(lorebook) : (state.lorebooks = [lorebook]);
    },
    updateLorebook: (
      state,
      action: PayloadAction<{
        lorebookId: string;
        lorebook: NovelV3.NovelLorebook;
      }>,
    ) => {
      const lorebook = state.lorebooks?.find((lorebook) => lorebook.id === action.payload.lorebookId);
      if (!lorebook) return;
      state.lorebooks = state.lorebooks?.map((lorebook) =>
        lorebook.id === action.payload.lorebookId ? action.payload.lorebook : lorebook,
      );
    },
    deleteLorebook: (state, action: PayloadAction<{ lorebookId: string }>) => {
      state.lorebooks = state.lorebooks?.filter((lorebook) => lorebook.id !== action.payload.lorebookId);
    },
    createEntry: (state, action: PayloadAction<{ lorebookId: string }>) => {
      const lorebook = state.lorebooks?.find((lorebook) => lorebook.id === action.payload.lorebookId);
      if (!lorebook) return;
      lorebook?.entries.push({
        keys: [],
        name: `Entry ${lorebook.entries.length + 1}`,
        content: '',
        extensions: {},
        enabled: false,
        insertion_order: 0,
      });
    },
    updateEntry: (
      state,
      action: PayloadAction<{
        lorebookId: string;
        entryIndex: number;
        entry: CharacterBook['entries'][0];
      }>,
    ) => {
      const lorebook = state.lorebooks?.find((lorebook) => lorebook.id === action.payload.lorebookId);

      if (!lorebook) return;

      lorebook.entries[action.payload.entryIndex] = action.payload.entry;
    },
    deleteEntry: (
      state,
      action: PayloadAction<{
        lorebookId: string;
        entryIndex: number;
      }>,
    ) => {
      const lorebook = state.lorebooks?.find((lorebook) => lorebook.id === action.payload.lorebookId);
      if (!lorebook) return;

      lorebook.entries.splice(action.payload.entryIndex, 1);
    },
    createMap(state, action: PayloadAction<{ id: string }>) {
      state.maps.push({
        id: action.payload.id,
        name: 'New Map',
        description: '',
        places: [],
        source: { png: '' },
      });
    },
    updateMap(state, action: PayloadAction<NovelV3.NovelMap>) {
      const index = state.maps.findIndex((map) => map.id === action.payload.id);
      if (index === -1) return;
      state.maps[index] = action.payload;
    },
    updateMapImage(state, action: PayloadAction<{ mapId: string; source: { png: string } }>) {
      const map = state.maps.find((map) => map.id === action.payload.mapId);
      if (!map) return;
      map.source = action.payload.source;
    },
    deleteMap(state, action: PayloadAction<string>) {
      const index = state.maps.findIndex((map) => map.id === action.payload);
      if (index === -1) return;
      state.maps.splice(index, 1);
    },
    createPlace(state, action: PayloadAction<{ mapId: string }>) {
      const map = state.maps.find((map) => map.id === action.payload.mapId);
      if (!map) return;
      map.places.push({
        id: randomUUID(),
        sceneId: '',
        name: 'New Place',
        description: '',
        previewSource: '',
        maskSource: '',
      });
    },
    updatePlace(
      state,
      action: PayloadAction<{
        mapId: string;
        place: {
          id: string;
          sceneId?: string;
          name?: string;
          description?: string;
          previewSource?: string;
          maskSource?: string;
        };
      }>,
    ) {
      const map = state.maps.find((map) => map.id === action.payload.mapId);
      if (!map) return;
      const index = map.places.findIndex((place) => place.id === action.payload.place.id);
      if (index === -1) return;
      map.places[index] = {
        ...map.places[index],
        ...action.payload.place,
      };
    },
    deletePlace(state, action: PayloadAction<{ mapId: string; placeId: string }>) {
      const map = state.maps.find((map) => map.id === action.payload.mapId);
      if (!map) return;
      map.places = map.places.filter((place) => place.id !== action.payload.placeId);
    },

    createNewInventoryItem: (
      state,
      action: PayloadAction<{
        itemId: string;
        name?: string;
        description?: string;
      }>,
    ) => {
      if (!state.inventory) state.inventory = [];
      state.inventory.push({
        id: action.payload.itemId,
        name: action.payload.name || 'New Item',
        description: action.payload.description || '',
        actions: [
          {
            name: 'New action',
            prompt: '',
            id: randomUUID(),
            usageActions: [],
          },
        ],
        icon: '',
        isPremium: false,
        isNovelOnly: true,
        hidden: false,
      });
    },
    updateInventoryItem: (state, action: PayloadAction<NovelV3.InventoryItem>) => {
      if (!state.inventory) return;
      const index = state.inventory.findIndex((item) => item.id === action.payload.id);
      if (index === -1) return;
      state.inventory[index] = action.payload;
    },
    deleteInventoryItem: (state, action: PayloadAction<{ itemId: string }>) => {
      if (!state.inventory) return;
      const index = state.inventory.findIndex((item) => item.id === action.payload.itemId);
      if (index === -1) return;
      state.inventory.splice(index, 1);
    },
    createObjective: (state, action: PayloadAction<{ id: string }>) => {
      state.objectives = state.objectives || [];
      state.objectives.push({
        id: action.payload.id,
        name: 'New Objective',
        description: 'Objective description',
        singleUse: true,
        stateCondition: {
          type: 'IN_SCENE',
          config: {
            sceneIds: [],
          },
        },
        condition: '',
        actions: [],
      });
    },

    updateObjective: (state, action: PayloadAction<{ id: string; objective: NovelV3.NovelObjective }>) => {
      if (!state.objectives) return;
      const index = state.objectives?.findIndex((objective) => objective.id === action.payload.id);
      if (index === -1) return;
      state.objectives[index] = action.payload.objective;
    },
    deleteObjective: (state, action: PayloadAction<{ id: string }>) => {
      if (!state.objectives) return;
      state.objectives = state.objectives.filter((objective) => objective.id !== action.payload.id);
    },
    updateTriggerOnlyOnce: (state, action: PayloadAction<{ sceneId: string; triggerOnlyOnce: boolean }>) => {
      const scene = state.scenes.find((scene) => scene.id === action.payload.sceneId);
      if (scene && scene.cutScene) {
        scene.cutScene.triggerOnlyOnce = action.payload.triggerOnlyOnce;
      }
    },
    createCutscene: (state, action: PayloadAction<{ cutsceneId: string; sceneId: string | null }>) => {
      const newCutscene: NovelV3.CutScene = {
        id: action.payload.cutsceneId,
        name: 'New Cutscene',
        parts: [],
      };
      const scene = state.scenes.find((scene) => scene.id === action.payload.sceneId);
      if (scene && action.payload.sceneId) {
        scene.cutScene = {
          id: action.payload.cutsceneId,
          triggerOnlyOnce: false,
        };
      }
      state.cutscenes ? state.cutscenes.push(newCutscene) : (state.cutscenes = [newCutscene]);
    },
    updateCutscene: (state, action: PayloadAction<NovelV3.CutScene>) => {
      if (!state.cutscenes) return;
      const index = state.cutscenes.findIndex((cutscene) => cutscene.id === action.payload.id);
      if (index !== -1) {
        state.cutscenes[index] = action.payload;
      }
    },
    deleteCutscene: (state, action: PayloadAction<{ cutsceneId: string; sceneId: string }>) => {
      if (!state.cutscenes) return;
      state.cutscenes = state.cutscenes.filter((cutscene) => cutscene.id !== action.payload.cutsceneId);
      const scene = state.scenes.find((scene) => scene.id === action.payload.sceneId);
      if (scene) {
        scene.cutScene = undefined;
      }
    },

    loadCompleteState: (state, action: PayloadAction<NovelV3.NovelState>) => {
      return action.payload;
    },
    updateDetails: (
      state,
      action: PayloadAction<{
        name: 'title' | 'description' | 'author' | 'logoPic' | 'language';
        // name: 'title' | 'description' | 'author' | 'logoPic';

        value: string;
      }>,
    ) => {
      state[action.payload.name] = action.payload.value;
    },
    clearNovelState: () => initialState,

    createCutscenePart: (state, action: PayloadAction<{ cutsceneId: string; partId: string }>) => {
      const cutscene = state.cutscenes?.find((cutscene) => cutscene.id === action.payload.cutsceneId);

      if (!cutscene) return;
      const newPart: NovelV3.CutScenePart = {
        id: action.payload.partId,
        text: [
          {
            content: '',
            type: 'dialogue',
          },
        ],
        background: state.backgrounds[0]?.id || '',
        characters: [],
      };
      cutscene.parts.push(newPart);
    },

    updateCutscenePart: (state, action: PayloadAction<{ cutsceneId: string; part: NovelV3.CutScenePart }>) => {
      const cutscene = state.cutscenes?.find((cutscene) => cutscene.id === action.payload.cutsceneId);
      if (!cutscene) return;
      const index = cutscene.parts.findIndex((part) => part.id === action.payload.part.id);
      if (index !== -1) {
        cutscene.parts[index] = action.payload.part;
      }
    },

    deleteCutscenePart: (state, action: PayloadAction<{ cutsceneId: string; partId: string }>) => {
      const cutscene = state.cutscenes?.find((cutscene) => cutscene.id === action.payload.cutsceneId);
      if (!cutscene) return;
      cutscene.parts = cutscene.parts.filter((part) => part.id !== action.payload.partId);
    },
    reorderStart: (state, action: PayloadAction<{ startId: string; direction: 'up' | 'down' }>) => {
      const { startId, direction } = action.payload;
      const currentIndex = state.starts.findIndex((start) => start.id === startId);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= state.starts.length) return;

      // Swap elements
      [state.starts[currentIndex], state.starts[newIndex]] = [state.starts[newIndex], state.starts[currentIndex]];
    },
    addIndicatorToScene: (state, action: PayloadAction<{ sceneId: string; indicator: NovelV3.NovelIndicator }>) => {
      const scene = state.scenes.find((scene) => scene.id === action.payload.sceneId);
      if (scene) {
        if (!scene.indicators) {
          scene.indicators = [];
        }
        scene.indicators.push(action.payload.indicator);
      }
    },
    updateIndicatorInScene: (
      state,
      action: PayloadAction<{ sceneId: string; indicatorId: string; indicator: NovelV3.NovelIndicator }>,
    ) => {
      const scene = state.scenes.find((scene) => scene.id === action.payload.sceneId);
      if (scene && scene.indicators) {
        const index = scene.indicators.findIndex((indicator) => indicator.id === action.payload.indicatorId);
        if (index !== -1) {
          scene.indicators[index] = action.payload.indicator;
        }
      }
    },
    deleteIndicatorFromScene: (state, action: PayloadAction<{ sceneId: string; indicatorId: string }>) => {
      const scene = state.scenes.find((scene) => scene.id === action.payload.sceneId);
      if (scene && scene.indicators) {
        scene.indicators = scene.indicators.filter((indicator) => indicator.id !== action.payload.indicatorId);
      }
    },
    updateGlobalCutscene: (state, action: PayloadAction<string | null>) => {
      const cutsceneId = action.payload;
      const existingCutscene = state.cutscenes?.find((cs) => cs.id === cutsceneId);
      if (!cutsceneId || !existingCutscene?.id) {
        // Clear any existing global cutscene
        state.globalStartCutsceneId = undefined;
        return;
      }
      // Try to locate existing cutscene
      // If not found, create a basic new cutscene
      state.globalStartCutsceneId = existingCutscene.id;
    },
    updateUseModalStartSelection: (state, action: PayloadAction<boolean>) => {
      state.useModalForStartSelection = action.payload;
    },
    addPendingInference: (
      state,
      action: PayloadAction<Omit<PendingInference, 'status' | 'resultImage' | 'createdAt'>>,
    ) => {
      if (!state.pendingInferences) {
        state.pendingInferences = [];
      }
      state.pendingInferences.push({
        ...action.payload,
        status: 'pending',
        createdAt: Date.now(),
      });
    },
    updateInferenceStatus: (
      state,
      action: PayloadAction<{ inferenceId: string; status: 'done' | 'error'; resultImage?: string }>,
    ) => {
      const pending = state.pendingInferences?.find((p) => p.inferenceId === action.payload.inferenceId);
      if (!pending) return;

      pending.status = action.payload.status;
      pending.resultImage = action.payload.resultImage;

      if (pending.status === 'done' && pending.resultImage) {
        const { inferenceType, resultImage } = pending;
        switch (inferenceType) {
          case 'character': {
            const charIndex = state.characters.findIndex((c) => c.id === pending.characterId);
            if (charIndex < 0) break;
            const char = state.characters[charIndex];
            const outfits = char.card.data.extensions.mikugg_v2?.outfits;
            if (!outfits) break;
            const outfitIndex = outfits.findIndex((o) => o.id === pending.outfitId);
            if (outfitIndex < 0) break;
            const outfit = outfits[outfitIndex];
            const neutralEmotion = outfit.emotions.find((e) => e.id === 'neutral');

            if (neutralEmotion) {
              neutralEmotion.sources.png = resultImage;
              toast.success(`Character outfit image updated for "${outfit.name}"!`, {
                position: 'bottom-left',
              });
            }

            // Inject query data into generationData
            outfit.generationData = {
              ...outfit.generationData,
              headPrompt: pending.headPrompt ?? outfit.generationData?.headPrompt ?? '',
              prompt: pending.prompt ?? outfit.generationData?.prompt,
              referenceImage: resultImage,
              modelToUse: pending.modelToUse ?? outfit.generationData?.modelToUse ?? 1,
              seed: pending.seed ?? outfit.generationData?.seed ?? 0,
              poseImage: pending.poseImage || outfit.generationData?.poseImage,
            };

            outfits[outfitIndex] = { ...outfit };
            char.card.data.extensions.mikugg_v2.outfits = outfits;
            state.characters[charIndex] = { ...char };
            break;
          }
          case 'emotion': {
            const charIndex = state.characters.findIndex((c) => c.id === pending.characterId);
            if (charIndex < 0) break;
            const char = state.characters[charIndex];
            const outfits = char.card.data.extensions.mikugg_v2?.outfits;
            if (!outfits) break;
            const outfitIndex = outfits.findIndex((o) => o.id === pending.outfitId);
            if (outfitIndex < 0) break;
            const outfit = outfits[outfitIndex];
            const emotionToReplace = outfit.emotions.find((e) => e.id === pending.emotionId);
            if (emotionToReplace) {
              emotionToReplace.sources.png = resultImage;
              toast.success(`Character emotion "${pending.emotionId}" updated for outfit: ${outfit.name}!`);
            } else {
              outfit.emotions = [
                ...outfit.emotions,
                {
                  id: pending.emotionId || '',
                  sources: {
                    png: resultImage,
                  },
                },
              ];
            }
            state.characters[charIndex] = { ...char };
            break;
          }
          case 'background': {
            const bgId = pending.backgroundId;
            if (!bgId) break;
            let bg = state.backgrounds.find((b) => b.id === bgId);
            if (!bg) {
              // Create a new background if none found
              bg = {
                id: bgId,
                name: pending.prompt ?? 'AI Background',
                description: pending.prompt ?? '',
                attributes: [],
                source: { jpg: resultImage },
              };
              state.backgrounds.push(bg);
              toast.success(`Background "${bg.name}" created!`);
            } else {
              bg.source.jpg = resultImage;
              toast.success(`Background "${bg.name}" updated!`);
            }
            break;
          }
          case 'item': {
            const itemIndex = state.inventory?.findIndex((item) => item.id === pending.itemId);
            if (itemIndex !== undefined && itemIndex >= 0 && state.inventory) {
              state.inventory[itemIndex].icon = resultImage;
            }
            toast.success(`Item "${pending.prompt}" updated!`);
            break;
          }
        }
        // Finally, remove the completed inference
        if (state.pendingInferences) {
          state.pendingInferences = state.pendingInferences.filter((inf) => inf.inferenceId !== pending.inferenceId);
        }
      }
    },
    removePendingInference: (state, action: PayloadAction<{ inferenceId: string }>) => {
      if (!state.pendingInferences) return;
      state.pendingInferences = state.pendingInferences.filter((p) => p.inferenceId !== action.payload.inferenceId);
    },
  },
});

export const {
  addChildScene,
  addCharacter,
  deleteChildScene,
  addBackground,
  updateBackground,
  deleteBackground,
  addSong,
  updateSong,
  deleteSong,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  createSceneWithDefaults,
  deleteSceneById,
  updateScene,
  createStart,
  updateStart,
  deleteStart,
  createLorebook,
  updateLorebook,
  deleteLorebook,
  createEntry,
  updateEntry,
  deleteEntry,
  createMap,
  updateMap,
  updateMapImage,
  deleteMap,
  createPlace,
  updatePlace,
  deletePlace,
  createNewInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createObjective,
  updateObjective,
  deleteObjective,
  updateTriggerOnlyOnce,
  createCutscene,
  updateCutscene,
  deleteCutscene,
  loadCompleteState,
  updateDetails,
  clearNovelState,
  createCutscenePart,
  updateCutscenePart,
  deleteCutscenePart,
  reorderStart,
  addIndicatorToScene,
  updateIndicatorInScene,
  deleteIndicatorFromScene,
  updateGlobalCutscene,
  updateUseModalStartSelection,
  addPendingInference,
  updateInferenceStatus,
  removePendingInference,
} = novelFormSlice.actions;

export default novelFormSlice.reducer;

export const pollInferences = (): any => async (dispatch: any, getState: any) => {
  const novelState = getState().novel as NovelV3.NovelState & { pendingInferences?: PendingInference[] };
  const pendingInferences = (novelState.pendingInferences || []).filter(
    (p) => p.status === 'pending' || p.status === 'error',
  );
  if (!pendingInferences.length) return;

  const inferenceIds = pendingInferences.map((p) => p.inferenceId);
  try {
    const response = await apiClient.retrieveMultipleInferences(inferenceIds);

    for (const inf of response.data) {
      const { status } = inf.status; // 'pending' | 'done' | 'error'
      if (status === 'done') {
        const resultImage = inf.status.result?.[0] || '';
        const p = novelState.pendingInferences?.find((x) => x.inferenceId === inf.inferenceId);
        if (!p) continue;

        try {
          const uploadRes = await apiClient.migrateInferenceToAssets(inf.inferenceId);
          if (uploadRes.status !== 200 && uploadRes.status !== 201) {
            console.error('Failed uploading generated asset:', uploadRes);
            dispatch(
              updateInferenceStatus({
                inferenceId: inf.inferenceId,
                status: 'error',
              }),
            );
            continue;
          }
        } catch (err) {
          console.error('Asset upload error:', err);
          dispatch(
            updateInferenceStatus({
              inferenceId: inf.inferenceId,
              status: 'error',
            }),
          );
          continue;
        }

        dispatch(
          updateInferenceStatus({
            inferenceId: inf.inferenceId,
            status: 'done',
            resultImage: resultImage,
          }),
        );
      } else if (status === 'error') {
        dispatch(
          updateInferenceStatus({
            inferenceId: inf.inferenceId,
            status: 'error',
          }),
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
};
