import { CharacterBook, NovelV3 } from "@mikugg/bot-utils";

import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { v4 as randomUUID } from "uuid";

const initialState: NovelV3.NovelState = {
  title: "",
  description: "",
  logoPic: "",
  author: "",
  tags: [],
  characters: [],
  backgrounds: [],
  songs: [],
  maps: [],
  scenes: [],
  starts: [],
  lorebooks: [],
};

const novelFormSlice = createSlice({
  name: "novel",
  initialState,
  reducers: {
    addChildScene: (
      state,
      action: PayloadAction<{ sourceId: string; targetId: string }>
    ) => {
      const { sourceId, targetId } = action.payload;
      const sourceScene = state.scenes.find((scene) => scene.id === sourceId);
      if (sourceScene && !sourceScene.children.includes(targetId)) {
        sourceScene.children.push(targetId);
      }
    },
    deleteChildScene: (
      state,
      action: PayloadAction<{ sourceId: string; targetId: string }>
    ) => {
      const { sourceId, targetId } = action.payload;
      const sourceScene = state.scenes.find((scene) => scene.id === sourceId);
      if (sourceScene) {
        sourceScene.children = sourceScene.children.filter(
          (childId) => childId !== targetId
        );
      }
    },
    addBackground: (state, action: PayloadAction<NovelV3.NovelBackground>) => {
      state.backgrounds.push(action.payload);
    },
    updateBackground: (
      state,
      action: PayloadAction<NovelV3.NovelBackground>
    ) => {
      const index = state.backgrounds.findIndex(
        (background) => background.id === action.payload.id
      );
      if (index === -1) return;
      state.backgrounds[index] = action.payload;
    },
    deleteBackground: (state, action: PayloadAction<string>) => {
      const index = state.backgrounds.findIndex(
        (background) => background.id === action.payload
      );
      if (index === -1) return;
      state.backgrounds.splice(index, 1);
    },
    addSong: (state, action: PayloadAction<NovelV3.NovelSong>) => {
      state.songs.push(action.payload);
    },
    updateSong: (state, action: PayloadAction<NovelV3.NovelSong>) => {
      const index = state.songs.findIndex(
        (song) => song.id === action.payload.id
      );
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
        name: "char1",
        short_description: "",
        profile_pic: "empty_char.png",
        tags: [],
        nsfw: NovelV3.NovelNSFW.NONE,
        card: {
          spec: "chara_card_v2",
          spec_version: "2.0",
          data: {
            name: "char1",
            alternate_greetings: [],
            character_version: "1",
            creator: "",
            creator_notes: "",
            description: "",
            extensions: {
              mikugg_v2: {
                license: "CC BY-NC-SA 4.0",
                language: "en",
                short_description: "",
                profile_pic: "empty_char.png",
                nsfw: NovelV3.NovelNSFW.NONE,
                outfits: [
                  {
                    id: randomUUID(),
                    name: "default",
                    description: "The default outfit",
                    attributes: [],
                    template: "single-emotion",
                    nsfw: NovelV3.NovelNSFW.NONE,
                    emotions: [
                      {
                        id: "neutral",
                        sources: {
                          png: "empty_char_emotion.png",
                        },
                      },
                    ],
                  },
                ],
              },
            },
            first_mes: "",
            mes_example: "",
            personality: "",
            post_history_instructions: "",
            scenario: "",
            system_prompt: "",
            tags: [],
          },
        },
      };
      state.characters.push(character);
    },
    updateCharacter: (state, action: PayloadAction<NovelV3.NovelCharacter>) => {
      const index = state.characters.findIndex(
        (character) => character.id === action.payload.id
      );
      if (index === -1) return;
      state.characters[index] = action.payload;
    },
    deleteCharacter: (state, action: PayloadAction<string>) => {
      const index = state.characters.findIndex(
        (character) => character.id === action.payload
      );
      if (index === -1) return;
      state.characters.splice(index, 1);
    },
    addCharacter(state, action: PayloadAction<NovelV3.NovelCharacter>) {
      state.characters.push(action.payload);
    },
    createSceneWithDefaults: (state) => {
      const newScene: NovelV3.NovelScene = {
        id: randomUUID(),
        actionText: "",
        condition: "",
        musicId: state.songs[0]?.id || "",
        name: "New Scene",
        backgroundId: state.backgrounds[0]?.id || "default_background.jpg",
        characters: [
          {
            characterId: state.characters[0]?.id || "",
            outfit:
              state.characters[0]?.card?.data?.extensions?.mikugg_v2?.outfits[0]
                ?.id || "",
            objective: "",
          },
        ],
        children: [],
        nsfw: NovelV3.NovelNSFW.NONE,
        parentMapIds: null,
        prompt: "",
      };
      state.scenes.push(newScene);
    },
    deleteSceneById: (state, action: PayloadAction<string>) => {
      const index = state.scenes.findIndex(
        (scene) => scene.id === action.payload
      );
      if (index === -1) return;
      state.scenes.forEach((scene) => {
        scene.children = scene.children.filter(
          (childId) => childId !== action.payload
        );
      });
      // check if the scene is the start scene
      state.scenes.splice(index, 1);
    },
    updateScene: (state, action: PayloadAction<NovelV3.NovelScene>) => {
      const index = state.scenes.findIndex(
        (scene) => scene.id === action.payload.id
      );
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
              ?.card.data.extensions.mikugg_v2.outfits.find(
                (outfit) => outfit.id === character.outfit
              );
            return {
              characterId: character.characterId,
              emotion: characterOutfit?.emotions[0]?.id || "neutral",
              pose: "standing",
              text: "Hello!",
            };
          }) || [],
        description: "",
        title: "",
      });
    },
    updateStart: (state, action: PayloadAction<NovelV3.NovelStart>) => {
      const index = state.starts.findIndex(
        (start) => start.id === action.payload.id
      );
      if (index === -1) return;
      state.starts[index] = action.payload;
    },
    deleteStart: (state, action: PayloadAction<string>) => {
      const index = state.starts.findIndex(
        (start) => start.id === action.payload
      );
      if (index === -1) return;
      state.starts.splice(index, 1);
    },
    createLorebook: (state, action: PayloadAction<string>) => {
      const lorebook = {
        id: action.payload,
        isGlobal: true,
        name: "New Lorebook",
        description: "New lorebook description.",
        extensions: {},
        entries: [],
      };
      state.lorebooks
        ? state.lorebooks?.push(lorebook)
        : (state.lorebooks = [lorebook]);
    },
    updateLorebook: (
      state,
      action: PayloadAction<{
        lorebookId: string;
        lorebook: NovelV3.NovelLorebook;
      }>
    ) => {
      const lorebook = state.lorebooks?.find(
        (lorebook) => lorebook.id === action.payload.lorebookId
      );
      if (!lorebook) return;
      state.lorebooks = state.lorebooks?.map((lorebook) =>
        lorebook.id === action.payload.lorebookId
          ? action.payload.lorebook
          : lorebook
      );
    },
    deleteLorebook: (state, action: PayloadAction<{ lorebookId: string }>) => {
      state.lorebooks = state.lorebooks?.filter(
        (lorebook) => lorebook.id !== action.payload.lorebookId
      );
    },
    createEntry: (state, action: PayloadAction<{ lorebookId: string }>) => {
      const lorebook = state.lorebooks?.find(
        (lorebook) => lorebook.id === action.payload.lorebookId
      );
      if (!lorebook) return;
      lorebook?.entries.push({
        keys: [],
        name: `Entry ${lorebook.entries.length + 1}`,
        content: "",
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
        entry: CharacterBook["entries"][0];
      }>
    ) => {
      const lorebook = state.lorebooks?.find(
        (lorebook) => lorebook.id === action.payload.lorebookId
      );

      if (!lorebook) return;

      lorebook.entries[action.payload.entryIndex] = action.payload.entry;
    },
    deleteEntry: (
      state,
      action: PayloadAction<{
        lorebookId: string;
        entryIndex: number;
      }>
    ) => {
      const lorebook = state.lorebooks?.find(
        (lorebook) => lorebook.id === action.payload.lorebookId
      );
      if (!lorebook) return;

      lorebook.entries.splice(action.payload.entryIndex, 1);
    },
    loadCompleteState: (state, action: PayloadAction<NovelV3.NovelState>) => {
      return action.payload;
    },
    updateDetails: (
      state,
      action: PayloadAction<{
        name: "title" | "description" | "author" | "logoPic";
        value: string;
      }>
    ) => {
      state[action.payload.name] = action.payload.value;
    },
    clearNovelState: () => initialState,
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
  loadCompleteState,
  updateDetails,
  clearNovelState,
} = novelFormSlice.actions;

export default novelFormSlice.reducer;
