import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { LLAMA_TOKENIZER } from "../libs/utils";

export const selectBackgrounds = (state: RootState) => state.novel.backgrounds;
export const selectEditingBackground = createSelector(
  [(state: RootState) => state.input.modals.background, selectBackgrounds],
  (modal, backgrounds) => {
    if (!modal.opened) return undefined;
    return backgrounds.find((background) => background.id === modal.editId);
  }
);
export const selectLorebooks = (state: RootState) => {
  return state.novel.lorebooks;
};
export const selectEditingLorebook = createSelector(
  [(state: RootState) => state.input.modals.lorebookEdit, selectLorebooks],
  (modal, lorebooks) => {
    if (!modal.opened) return undefined;
    return lorebooks?.find((lorebook) => lorebook.id === modal.editId);
  }
);
export const selectEditingSong = createSelector(
  [
    (state: RootState) => state.input.modals.song,
    (state: RootState) => state.novel.songs
  ],
  (modal, songs) => {
    if (!modal.opened) return undefined;
    return songs.find((song) => song.id === modal.editId);
  }
);
export const selectEditingCharacter = createSelector(
  [
    (state: RootState) => state.input.modals.character,
    (state: RootState) => state.novel.characters
  ],
  (modal, characters) => {
    if (!modal.opened) return undefined;
    return characters.find((character) => character.id === modal.editId);
  }
);

export const selectScenes = createSelector(
  [
    (state: RootState) => state.novel.scenes,
    (state: RootState) => state.novel.starts,
    (state: RootState) => state.novel.backgrounds,
    (state: RootState) => state.novel.characters,
    (state: RootState) => state.novel.songs,
    (state: RootState) => state.novel.maps
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
            objective: char.objective
          };
        }),
        music: songs.find((song) => song.id === scene.musicId),
        parentMaps:
          scene.parentMapIds?.map((parentMapId) =>
            maps.find((map) => map.id === parentMapId)
          ) || [],
        starts: _starts
      };
    });
  }
);

export const selectEditingScene = createSelector(
  [(state: RootState) => state.input.modals.scene, selectScenes],
  (modal, scenes) => {
    if (!modal.opened) return undefined;
    return scenes.find((scene) => scene.id === modal.editId);
  }
);

export const selectTotalTokenCount = createSelector(
  [(state: RootState) => state.novel],
  (novel) => {
    const { scenes, characters } = novel;
    const memoizedResults: { [key: string]: number } = {};

    const getTotalTokensByCharacterId = (characterId: string) => {
      if (memoizedResults[characterId] !== undefined) {
        return memoizedResults[characterId];
      }

      const character = characters.find(
        (character) => character.id === characterId
      );

      // TODO: Fix this
      if (!character) return 0;

      const totalTokens =
        LLAMA_TOKENIZER.encodeString(character.card.data.description).length +
        LLAMA_TOKENIZER.encodeString(character.card.data.mes_example).length +
        LLAMA_TOKENIZER.encodeString(character.card.data.personality).length;

      memoizedResults[characterId] = totalTokens;

      return totalTokens;
    };

    const scenesTokens: number[] = [];

    scenes.forEach((scene) => {
      let totalSceneToken = 0;

      scene.characters.forEach((char) => {
        totalSceneToken += getTotalTokensByCharacterId(char.characterId);
      });

      const startMessagesTokens = novel.starts
        .filter((start) => start.sceneId === scene.id)
        .map((start) =>
          start.characters.reduce(
            (acc, char) => acc + LLAMA_TOKENIZER.encodeString(char.text).length,
            0
          )
        );

      totalSceneToken +=
        Math.max(...startMessagesTokens) +
        LLAMA_TOKENIZER.encodeString(scene.prompt).length;

      scenesTokens.push(totalSceneToken);
    });

    return Math.max(...scenesTokens);
  }
);
