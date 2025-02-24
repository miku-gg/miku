import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the modal types
export type ModalType =
  | 'background'
  | 'backgroundSearch'
  | 'song'
  | 'songSearch'
  | 'character'
  | 'characterGeneration'
  | 'characterSearch'
  | 'loading'
  | 'lorebookEdit'
  | 'mapEdit'
  | 'placeEdit'
  | 'objectiveEdit'
  | 'editInventoryItem'
  | 'actionEdit'
  | 'errors'
  | 'cutscenes'
  | 'cutscenePartEdit'
  | 'scene';

export type PanelType = 'details' | 'assets' | 'maps' | 'scenes' | 'starts' | 'preview';
export const isPanelType = (panel: string): panel is PanelType =>
  ['details', 'assets', 'maps', 'scenes', 'starts', 'preview'].includes(panel);

export interface InputState {
  navigation: {
    page: 'homepage' | 'edit';
    panel: PanelType;
  };
  modals: {
    [key in ModalType]: {
      opened: boolean;
      editId?: string;
      text?: string;
    };
  };
  spendApprovalModal: {
    open: boolean;
    id?: string;
    amount: number;
    reason: string;
  };
}

const initialState: InputState = {
  navigation: {
    page: 'homepage',
    panel: 'details',
  },
  modals: {
    loading: {
      opened: false,
    },
    objectiveEdit: {
      opened: false,
    },
    editInventoryItem: {
      opened: false,
    },
    actionEdit: {
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
    cutscenes: {
      opened: false,
    },
    cutscenePartEdit: {
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
    errors: {
      opened: false,
    },
  },
  spendApprovalModal: {
    open: false,
    id: undefined,
    amount: 0,
    reason: '',
  },
};

const inputSlice = createSlice({
  name: 'input',
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{
        modalType: ModalType;
        editId?: string;
        text?: string;
      }>,
    ) => {
      const { modalType, editId } = action.payload;
      state.modals[modalType].opened = true;
      if ('editId' in action.payload) {
        state.modals[modalType].editId = editId;
      }
      if ('text' in action.payload) {
        state.modals[modalType].text = action.payload.text;
      }
    },
    closeModal: (
      state,
      action: PayloadAction<{
        modalType: ModalType;
      }>,
    ) => {
      state.modals[action.payload.modalType].opened = false;
    },
    navigatePanel(state, action: PayloadAction<PanelType>) {
      state.navigation.panel = action.payload;
    },
    navigatePage(state, action: PayloadAction<'homepage' | 'edit'>) {
      state.navigation.page = action.payload;
    },
    openSpendApprovalModal: (state, action: PayloadAction<{ id: string; amount: number; reason: string }>) => {
      state.spendApprovalModal = {
        open: true,
        id: action.payload.id,
        amount: action.payload.amount,
        reason: action.payload.reason,
      };
    },
    closeSpendApprovalModal: (state) => {
      state.spendApprovalModal = {
        open: false,
        id: undefined,
        amount: 0,
        reason: '',
      };
    },
  },
});

export const { openModal, closeModal, navigatePage, navigatePanel, openSpendApprovalModal, closeSpendApprovalModal } =
  inputSlice.actions;

export default inputSlice.reducer;
