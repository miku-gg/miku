import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the modal types
export type ModalType =
  | "background"
  | "backgroundSearch"
  | "song"
  | "songSearch"
  | "character"
  | "characterSearch"
  | "scene";

export type PanelType = "assets" | "scenes" | "starts" | "preview";
export const isPanelType = (panel: string): panel is PanelType =>
  ["assets", "scenes", "starts", "preview"].includes(panel);

export interface InputState {
  navigation: {
    page: "homepage" | "edit";
    panel: PanelType;
  };
  modals: {
    [key in ModalType]: {
      opened: boolean;
      editId?: string;
    };
  };
}

const initialState: InputState = {
  navigation: {
    page: "homepage",
    panel: "assets",
  },
  modals: {
    background: {
      opened: false,
    },
    backgroundSearch: {
      opened: false,
    },
    song: {
      opened: false,
    },
    songSearch: {
      opened: false,
    },
    character: {
      opened: false,
    },
    characterSearch: {
      opened: false,
    },
    scene: {
      opened: false,
    },
  },
};

const inputSlice = createSlice({
  name: "input",
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{
        modalType: ModalType;
        editId?: string;
      }>
    ) => {
      const { modalType, editId } = action.payload;
      state.modals[modalType].opened = true;
      if ("editId" in action.payload) {
        state.modals[modalType].editId = editId;
      }
    },
    closeModal: (
      state,
      action: PayloadAction<{
        modalType: ModalType;
      }>
    ) => {
      state.modals[action.payload.modalType].opened = false;
    },
    navigatePanel(state, action: PayloadAction<PanelType>) {
      state.navigation.panel = action.payload;
    },
    navigatePage(state, action: PayloadAction<"homepage" | "edit">) {
      state.navigation.page = action.payload;
    },
  },
});

export const { openModal, closeModal, navigatePage, navigatePanel } =
  inputSlice.actions;

export default inputSlice.reducer;
