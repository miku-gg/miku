import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the modal types
export type ModalType =
  | "background"
  | "backgroundSearch"
  | "song"
  | "songSearch"
  | "character"
  | "characterGeneration"
  | "lorebooks"
  | "characterSearch"
  | "loading"
  | "errors"
  | "scene";

export type PanelType = "details" | "assets" | "scenes" | "starts" | "preview";
export const isPanelType = (panel: string): panel is PanelType =>
  ["details", "assets", "scenes", "starts", "preview"].includes(panel);

export interface InputState {
  navigation: {
    page: "homepage" | "edit";
    panel: PanelType;
  };
  modals: {
    [key in ModalType]: {
      opened: boolean;
      editId?: string;
      text?: string;
    };
  };
}

const initialState: InputState = {
  navigation: {
    page: "homepage",
    panel: "details",
  },
  modals: {
    loading: {
      opened: false,
    },
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
    characterGeneration: {
      opened: false,
    },
    lorebooks: {
      opened: false,
    },
    characterSearch: {
      opened: false,
    },
    scene: {
      opened: false,
    },
    errors: {
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
        text?: string;
      }>
    ) => {
      const { modalType, editId } = action.payload;
      state.modals[modalType].opened = true;
      if ("editId" in action.payload) {
        state.modals[modalType].editId = editId;
      }
      if ("text" in action.payload) {
        state.modals[modalType].text = action.payload.text;
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
