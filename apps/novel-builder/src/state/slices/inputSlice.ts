import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the modal types
export type ModalType =
  | "background"
  | "backgroundSearch"
  | "song"
  | "songSearch"
  | "character"
  | "characterGeneration"
  | "characterSearch"
  | "loading"
  | "lorebookEdit"
  | "mapEdit"
  | "placeEdit"
  | "errors"
  | "sceneSelector"
  | "scene";

export type PanelType =
  | "details"
  | "assets"
  | "maps"
  | "scenes"
  | "starts"
  | "preview";
export const isPanelType = (panel: string): panel is PanelType =>
  ["details", "assets", "maps", "scenes", "starts", "preview"].includes(panel);

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
    lorebookEdit: {
      opened: false,
    },
    mapEdit: {
      opened: false,
    },
    placeEdit: {
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
    characterSearch: {
      opened: false,
    },
    scene: {
      opened: false,
    },
    sceneSelector: {
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
        text?: string;
      }>
    ) => {
      state.modals[action.payload.modalType].opened = false;
      if ("text" in action.payload) {
        state.modals[action.payload.modalType].text = action.payload.text;
      }
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
