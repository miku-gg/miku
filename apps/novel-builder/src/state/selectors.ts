import { createSelector } from '@reduxjs/toolkit';
import { LLAMA_TOKENIZER } from '../libs/utils';
import { RootState } from './store';

export const selectBackgrounds = (state: RootState) => state.novel.backgrounds;
export const selectEditingBackground = createSelector(
  [(state: RootState) => state.input.modals.background, selectBackgrounds],
  (modal, backgrounds) => {
    if (!modal.opened) return undefined;
    return backgrounds.find((background) => background.id === modal.editId);
  },
);

export const selectObjectives = (state: RootState) => state.novel.objectives;
export const selectEditingObjective = createSelector(
  [(state: RootState) => state.input.modals.objectiveEdit, selectObjectives],
  (modal, objectives) => {
    if (!modal.opened) return undefined;
    return objectives?.find((objective) => objective.id === modal.editId);
  },
);
export const selectInventory = (state: RootState) => state.novel.inventory;
export const selectEditingInventoryItem = createSelector(
  [(state: RootState) => state.input.modals.editInventoryItem, selectInventory],
  (modal, inventory) => {
    if (!modal.opened) return undefined;
    return inventory?.find((item) => item.id === modal.editId);
  },
);
export const selectEditingAction = createSelector(
  [(state: RootState) => state.input.modals.actionEdit, selectInventory],
  (modal, inventory) => {
    if (!modal.opened) return undefined;
    const actions = inventory?.map((item) => item.actions).flat();
    return actions?.find((action) => action.id === modal.editId);
  },
);
export const selectLorebooks = (state: RootState) => {
  return state.novel.lorebooks;
};
export const selectEditingLorebook = createSelector(
  [(state: RootState) => state.input.modals.lorebookEdit, selectLorebooks],
  (modal, lorebooks) => {
    if (!modal.opened) return undefined;
    return lorebooks?.find((lorebook) => lorebook.id === modal.editId);
  },
);
export const selectMaps = (state: RootState) => state.novel.maps;
export const selectEditingMap = createSelector(
  [(state: RootState) => state.input.modals.mapEdit, selectMaps],
  (modal, maps) => {
    if (!modal.opened) return undefined;
    return maps.find((map) => map.id === modal.editId);
  },
);

export const selectEditingPlace = createSelector(
  [(state: RootState) => state.input.modals.placeEdit, (state: RootState) => state.novel.maps],
  (modal, maps) => {
    if (!modal.opened) return undefined;
    return maps
      .map((map) => map.places)
      .flat()
      .find((place) => place.id === modal.editId);
  },
);
export const selectEditingSong = createSelector(
  [(state: RootState) => state.input.modals.song, (state: RootState) => state.novel.songs],
  (modal, songs) => {
    if (!modal.opened) return undefined;
    return songs.find((song) => song.id === modal.editId);
  },
);
export const selectEditingCharacter = createSelector(
  [(state: RootState) => state.input.modals.character, (state: RootState) => state.novel.characters],
  (modal, characters) => {
    if (!modal.opened) return undefined;
    return characters.find((character) => character.id === modal.editId);
  },
);

export const selectScenes = createSelector(
  [
    (state: RootState) => state.novel.scenes,
    (state: RootState) => state.novel.starts,
    (state: RootState) => state.novel.backgrounds,
    (state: RootState) => state.novel.characters,
    (state: RootState) => state.novel.songs,
    (state: RootState) => state.novel.maps,
  ],
  (scenes, starts, backgrounds, characters, songs, maps) => {
    return scenes.map((scene) => {
      const _starts = starts.filter((start) => start.sceneId === scene.id);
      return {
        ...scene,
        _source: scene,
        background: backgrounds.find((bg) => bg.id === scene.backgroundId),
        characters: scene.characters.map((char) => {
          return {
            ...characters.find((c) => c.id === char.characterId),
            outfit: char.outfit,
            objective: char.objective,
          };
        }),
        music: songs.find((song) => song.id === scene.musicId),
        parentMaps: scene.parentMapIds?.map((parentMapId) => maps.find((map) => map.id === parentMapId)) || [],
        starts: _starts,
      };
    });
  },
);

export const selectEditingScene = createSelector(
  [(state: RootState) => state.input.modals.scene, selectScenes],
  (modal, scenes) => {
    if (!modal.opened) return undefined;
    return scenes.find((scene) => scene.id === modal.editId);
  },
);

export const selectTotalTokenCount = createSelector([(state: RootState) => state.novel], (novel) => {
  const { scenes, characters } = novel;
  const memoizedResults: { [key: string]: number } = {};

  const getTotalTokensByCharacter = (char: { characterId: string; outfit: string; objective?: string }) => {
    const characterId = char.characterId;

    if (memoizedResults[characterId] !== undefined) {
      return memoizedResults[characterId];
    }

    const character = characters.find((character) => character.id === characterId);

    const characterOutfit = character?.card.data.extensions.mikugg_v2.outfits.find(
      (outfit) => outfit.id === char.outfit,
    );

    const totalOutfitTokens = characterOutfit ? LLAMA_TOKENIZER.encodeString(characterOutfit.description).length : 0;

    const totalTokens =
      (character
        ? LLAMA_TOKENIZER.encodeString(character.card.data.description).length +
          LLAMA_TOKENIZER.encodeString(character.card.data.mes_example).length +
          LLAMA_TOKENIZER.encodeString(character.card.data.personality).length
        : 0) + totalOutfitTokens;

    memoizedResults[characterId] = totalTokens;

    return totalTokens;
  };

  const scenesTokens: number[] = [];

  scenes.forEach((scene) => {
    const sceneCharactersTokens = scene.characters.map((char) => {
      return getTotalTokensByCharacter(char);
    });

    let totalSceneToken = Math.max(0, ...sceneCharactersTokens);

    const startMessagesTokens = novel.starts
      .filter((start) => start.sceneId === scene.id)
      .map((start) => start.characters.reduce((acc, char) => acc + LLAMA_TOKENIZER.encodeString(char.text).length, 0));

    totalSceneToken += Math.max(0, ...startMessagesTokens) + LLAMA_TOKENIZER.encodeString(scene.prompt).length;

    scenesTokens.push(totalSceneToken);
  });

  return Math.max(0, ...scenesTokens);
});

export const selectCutscenes = (state: RootState) => state.novel.cutscenes;

export const selectEditingCutscenePart = createSelector(
  [(state: RootState) => state.input.modals.cutscenePartEdit, selectCutscenes, selectEditingScene],
  (modal, cutscenes, editingScene) => {
    if (!modal.opened || !editingScene) return undefined;
    return cutscenes
      ?.find((cutscene) => cutscene.id === editingScene.cutScene?.id)
      ?.parts.find((part) => part.id === modal.editId);
  },
);
