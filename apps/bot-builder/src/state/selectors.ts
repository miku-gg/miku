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
