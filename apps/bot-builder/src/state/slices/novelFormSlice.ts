import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  NovelBackground,
  NovelFormState,
  NovelSong,
  NovelCharacter,
} from "../NovelFormState";
import { v4 as randomUUID } from "uuid";

const SCENE_DEFAULT = {
  id: "",
  backgroundId: "bg-1",
  characters: [
    {
      characterId: "char-1",
      outfit: "default",
    },
  ],
  children: [],
  musicId: "1",
  name: "New Scene",
  parentMapId: null,
  prompt: "*xd*",
};

/*
const initialState: NovelFormState = {
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
};
*/
const initialState: NovelFormState = {
  title: "",
  description: "",
  logoPic: "",
  author: "",
  tags: [],
  startSceneId: "scene-1",
  characters: [
    {
      id: "char-1",
      name: "char1",
      short_description: "",
      profile_pic: "empty_char.png",
      tags: [],
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
              outfits: [
                {
                  id: randomUUID(),
                  name: "default",
                  description: "The default outfit",
                  attributes: [],
                  template: "single-emotion",
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
    },
  ],
  backgrounds: [
    {
      id: "bg-1",
      attributes: [],
      description: "A beautiful forest",
      name: "Forest",
      source: {
        jpg: "QmUdzioMR7UBC7qGAaFvsN1FyLujeHSqcsc4LAj3paYpFC.png",
      },
    },
  ],
  songs: [
    {
      id: "1",
      name: "Song 1",
      description: "A song",
      tags: ["hopeful"],
      source: "QmQqLXpsB2D5LL3o2aAVGobM7hxPfxfGQ45FzENaMw23cb.mpeg",
    },
  ],
  maps: [],
  scenes: [
    {
      id: "scene-1",
      backgroundId: "bg-1",
      characters: [
        {
          characterId: "char-1",
          outfit: "default",
        },
      ],
      children: [],
      musicId: "1",
      name: "Scene 1",
      parentMapId: null,
      prompt: "*xd*",
    },
    {
      id: "scene-2",
      backgroundId: "bg-1",
      characters: [
        {
          characterId: "char-1",
          outfit: "default",
        },
      ],
      children: [],
      musicId: "1",
      name: "Scene 2",
      parentMapId: null,
      prompt: "*xd*",
    },
  ],
  starts: [],
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
    addBackground: (state, action: PayloadAction<NovelBackground>) => {
      state.backgrounds.push(action.payload);
    },
    updateBackground: (state, action: PayloadAction<NovelBackground>) => {
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
    addSong: (state, action: PayloadAction<NovelSong>) => {
      state.songs.push(action.payload);
    },
    updateSong: (state, action: PayloadAction<NovelSong>) => {
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
      const character: NovelCharacter = {
        id,
        name: "char1",
        short_description: "",
        profile_pic: "empty_char.png",
        tags: [],
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
                outfits: [
                  {
                    id: randomUUID(),
                    name: "default",
                    description: "The default outfit",
                    attributes: [],
                    template: "single-emotion",
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
    updateCharacter: (state, action: PayloadAction<NovelCharacter>) => {
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
    setStartScene: (state, action: PayloadAction<string>) => {
      state.startSceneId = action.payload;
    },
    createSceneWithDefaults: (state) => {
      const newScene = { ...SCENE_DEFAULT, id: randomUUID() };
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
      if (state.startSceneId === action.payload) {
        if (state.scenes.length) {
          state.startSceneId = state.scenes[0].id;
        } else {
          state.startSceneId = "";
        }
      }
    },
  },
});

export const {
  addChildScene,
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
  setStartScene,
  createSceneWithDefaults,
  deleteSceneById,
} = novelFormSlice.actions;

export default novelFormSlice.reducer;
