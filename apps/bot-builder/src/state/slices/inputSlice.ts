import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InputState {
  modals: {
    background: {
      opened: boolean;
      editId?: string;
    };
  };
}

const initialState: InputState = {
  modals: {
    background: {
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
  },
});

export const { openBackgroundModal, closeBackgroundModal } = inputSlice.actions;

export default inputSlice.reducer;
