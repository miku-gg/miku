import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InputState {
  modals: {
    background: {
      opened: boolean;
      editId?: string;
    };
    backgroundSearch: {
      opened: boolean;
    };
  };
}

const initialState: InputState = {
  modals: {
    background: {
      opened: false,
    },
    backgroundSearch: {
      opened: false,
    },
  },
};

const inputSlice = createSlice({
  name: "input",
  initialState,
  reducers: {
    openBackgroundModal: (state, action: PayloadAction<string>) => {
      state.modals.background.opened = true;
      state.modals.background.editId = action.payload;
    },
    closeBackgroundModal: (state) => {
      state.modals.background.opened = false;
      state.modals.background.editId = undefined;
    },
    openBackgroundSearchModal: (state) => {
      state.modals.backgroundSearch.opened = true;
    },
    closeBackgroundSearchModal: (state) => {
      state.modals.backgroundSearch.opened = false;
    },
  },
});

export const {
  openBackgroundModal,
  closeBackgroundModal,
  openBackgroundSearchModal,
  closeBackgroundSearchModal,
} = inputSlice.actions;

export default inputSlice.reducer;
