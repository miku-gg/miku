import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NovelCharacter, NovelState, NovelNSFW, NovelIndicator } from '../versioning';
import { v4 as randomUUID } from 'uuid';

export type { NovelScene, NovelCharacter, NovelCharacterOutfit, NovelState } from '../versioning';

const initialState: NovelState = {
  title: '',
  description: '',
  characters: [],
  scenes: [],
  starts: [],
  author: '',
  backgrounds: [],
  logoPic: '',
  maps: [],
  cutscenes: [],
  songs: [],
  tags: [],
};

const novelSlice = createSlice({
  name: 'novel',
  initialState,
  reducers: {
    setNovel: (_state, action: PayloadAction<NovelState>) => {
      return action.payload;
    },
    addScene: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        prompt: string;
        background: string;
        newChars?: NovelCharacter[];
        characters: { id: string; outfit: string }[];
        music: string;
        children?: string[];
        indicators?: NovelIndicator[];
      }>,
    ) => {
      if (action.payload.newChars) {
        state.characters = [...state.characters, ...action.payload.newChars];
      }

      const background = state.backgrounds.find((bg) => bg.source.jpg === action.payload.background);
      let backgroundId = background?.id || '';
      if (!background) {
        backgroundId = randomUUID();
        state.backgrounds.push({
          id: backgroundId,
          name: 'background',
          attributes: [],
          description: '',
          source: {
            jpg: action.payload.background,
          },
        });
      }

      const music = state.songs.find(
        (song) => song.source === action.payload.music || song.id === action.payload.music,
      );
      let musicId = music?.id || '';
      if (!music) {
        musicId = randomUUID();
        state.songs.push({
          id: musicId,
          name: 'music',
          source: action.payload.music,
          description: '',
          tags: [],
        });
      }

      state.scenes.push({
        id: action.payload.id,
        name: action.payload.name,
        prompt: action.payload.prompt,
        backgroundId,
        musicId,
        characters: action.payload.characters.map((char) => ({
          characterId: char.id,
          outfit: char.outfit,
          objective: '',
        })),
        children: action.payload.children || [],
        actionText: action.payload.prompt,
        condition: '',
        nsfw: NovelNSFW.NONE,
        parentMapIds: null,
        indicators: action.payload.indicators || [],
      });
    },
    addChildrenScenes: (state, action: PayloadAction<{ parentId: string; childIds: string[] }>) => {
      const parent = state.scenes.find((scene) => scene.id === action.payload.parentId);
      if (parent) {
        action.payload.childIds.forEach((childId) => {
          if (!parent.children.includes(childId)) {
            parent.children.push(childId);
          }
        });
      }
    },
    addIndicatorToScene: (state, action: PayloadAction<{ sceneId: string; indicator: NovelIndicator }>) => {
      const scene = state.scenes.find((scene) => scene.id === action.payload.sceneId);
      if (scene) {
        if (!scene.indicators) {
          scene.indicators = [];
        }
        scene.indicators.push(action.payload.indicator);
      }
    },
    removeIndicatorFromScene: (state, action: PayloadAction<{ sceneId: string; indicatorId: string }>) => {
      const scene = state.scenes.find((scene) => scene.id === action.payload.sceneId);
      if (scene && scene.indicators) {
        scene.indicators = scene.indicators.filter((indicator) => indicator.id !== action.payload.indicatorId);
      }
    },
    updateIndicatorInScene: (state, action: PayloadAction<{ sceneId: string; indicator: NovelIndicator }>) => {
      const scene = state.scenes.find((scene) => scene.id === action.payload.sceneId);
      if (scene && scene.indicators) {
        const index = scene.indicators.findIndex((ind) => ind.id === action.payload.indicator.id);
        if (index !== -1) {
          scene.indicators[index] = action.payload.indicator;
        }
      }
    },
    changeSceneCharacterOutfit: (
      state,
      action: PayloadAction<{ sceneId: string; characterId: string; outfitId: string }>,
    ) => {
      const scene = state.scenes.find((scene) => scene.id === action.payload.sceneId);
      if (scene) {
        const char = scene.characters.find((c) => c.characterId === action.payload.characterId);
        if (char) {
          char.outfit = action.payload.outfitId;
        }
      }
    },
    changeVisibilityOfPlaceInMap: (
      state,
      action: PayloadAction<{ mapId: string; placeId: string; hidden: boolean }>,
    ) => {
      const map = state.maps.find((map) => map.id === action.payload.mapId);
      if (map) {
        const place = map.places.find((place) => place.id === action.payload.placeId);
        if (place) {
          place.hidden = action.payload.hidden;
        }
      }
    },
    addAbilityToCharacter: (state, action: PayloadAction<{ characterId: string; abilityId: string }>) => {
      const hero = state.rpg?.heroes.find((hero) => hero.characterId === action.payload.characterId);
      if (hero) {
        const existingAbility = hero.abilities.find((ability) => ability.abilityId === action.payload.abilityId);
        if (!existingAbility) {
          hero.abilities.push({
            abilityId: action.payload.abilityId,
          });
        }
      }
    },
    addCharacterToParty: (state, action: PayloadAction<{ characterId: string }>) => {
      const hero = state.rpg?.heroes.find((hero) => hero.characterId === action.payload.characterId);
      if (hero) {
        hero.isInParty = true;
      }
    },
    changeCharacterBattleOutfit: (state, action: PayloadAction<{ characterId: string; outfitId: string }>) => {
      const hero = state.rpg?.heroes.find((hero) => hero.characterId === action.payload.characterId);
      if (hero) {
        hero.battleOutfit = action.payload.outfitId;
      }
    },
    changeCutscenePartBackground: (
      state,
      action: PayloadAction<{ cutsceneId: string; partId: string; backgroundId: string }>,
    ) => {
      const cutscene = state.cutscenes?.find((cutscene) => cutscene.id === action.payload.cutsceneId);
      if (cutscene) {
        const part = cutscene.parts.find((part) => part.id === action.payload.partId);
        if (part) {
          part.background = action.payload.backgroundId;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase('global/replaceState', (_state, action) => {
      // eslint-disable-next-line
      // @ts-ignore
      return action.payload.novel;
    });
  },
});

export const {
  setNovel,
  addScene,
  addChildrenScenes,
  addIndicatorToScene,
  removeIndicatorFromScene,
  updateIndicatorInScene,
  changeSceneCharacterOutfit,
  changeVisibilityOfPlaceInMap,
  addAbilityToCharacter,
  addCharacterToParty,
  changeCharacterBattleOutfit,
  changeCutscenePartBackground,
} = novelSlice.actions;

export default novelSlice.reducer;
