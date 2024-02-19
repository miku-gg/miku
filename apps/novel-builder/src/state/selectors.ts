import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";

export const selectBackgrounds = (state: RootState) => state.novel.backgrounds;
export const selectEditingBackground = createSelector(
  [(state: RootState) => state.input.modals.background, selectBackgrounds],
  (modal, backgrounds) => {
    if (!modal.opened) return undefined;
    return backgrounds.find((background) => background.id === modal.editId);
  }
);
export const selectEditingSong = createSelector(
  [
    (state: RootState) => state.input.modals.song,
    (state: RootState) => state.novel.songs,
  ],
  (modal, songs) => {
    if (!modal.opened) return undefined;
    return songs.find((song) => song.id === modal.editId);
  }
);
export const selectEditingCharacter = createSelector(
  [
    (state: RootState) => state.input.modals.character,
    (state: RootState) => state.novel.characters,
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
          };
        }),
        music: songs.find((song) => song.id === scene.musicId),
        parentMap: maps.find((map) => map.id === scene.parentMapId),
        starts: _starts,
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
