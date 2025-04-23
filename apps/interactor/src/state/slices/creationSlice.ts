import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NovelCharacter, NovelBackground, NovelIndicator } from '../versioning';

export const getEmptyIndicator = (): NovelIndicator => {
  return {
    id: '',
    name: '',
    description: '',
    type: 'percentage',
    color: '#4caf50',
    initialValue: '1',
    inferred: false,
    editable: true,
    hidden: false,
    persistent: false,
    min: 0,
    max: 100,
    step: 1,
  };
};

interface CreationState {
  importedBackgrounds: NovelBackground[];
  importedCharacters: NovelCharacter[];
  scene: {
    slidePanelOpened: boolean;
    sceneOpened: boolean;
    title: string;
    submitting: boolean;
    background: {
      opened: boolean;
      selected: string;
      search: {
        opened: boolean;
      };
      gen: {
        opened: boolean;
      };
    };
    characters: {
      openedIndex: number;
      selected: {
        id: string;
        outfit: string;
      }[];
      search: {
        opened: boolean;
      };
    };
    prompt: {
      loading: boolean;
      value: string;
    };
    music: {
      opened: boolean;
      selected: string;
      source: string;
    };
    sceneSugestions: {
      opened: boolean;
      inferencing: boolean;
    };
    scenePreview: {
      opened: boolean;
      sceneId: string;
    };
    indicator: {
      opened: boolean;
      item?: NovelIndicator | null;
    };
  };
  inference: {
    fetching: boolean;
    backgrounds: {
      id: string;
      inferenceId?: string;
      prompt: string;
      queuePosition: number;
    }[];
  };
}

export const initialState: CreationState = {
  importedBackgrounds: [],
  importedCharacters: [],
  scene: {
    slidePanelOpened: false,
    sceneOpened: false,
    title: '',
    submitting: false,
    background: {
      opened: false,
      selected: '',
      search: {
        opened: false,
      },
      gen: {
        opened: false,
      },
    },
    characters: {
      openedIndex: -1,
      selected: [
        {
          id: '',
          outfit: '',
        },
        {
          id: '',
          outfit: '',
        },
      ],
      search: {
        opened: false,
      },
    },
    prompt: {
      loading: false,
      value: '',
    },
    music: {
      opened: false,
      selected: '',
      source: '',
    },
    sceneSugestions: {
      opened: false,
      inferencing: false,
    },
    scenePreview: {
      opened: false,
      sceneId: '',
    },
    indicator: {
      opened: false,
      item: null,
    },
  },
  inference: {
    fetching: false,
    backgrounds: [],
  },
};

export const creationSlice = createSlice({
  name: 'creation',
  initialState,
  reducers: {
    setModalOpened: (
      state,
      action: PayloadAction<{
        id:
          | 'slidepanel'
          | 'scene'
          | 'background'
          | 'music'
          | 'background-search'
          | 'characters-search'
          | 'background-gen'
          | 'scene-suggestions'
          | 'scene-preview'
          | 'indicator';
        opened: boolean;
        itemId?: string;
        item?: NovelIndicator;
      }>,
    ) => {
      if (action.payload.id === 'scene') {
        state.scene.sceneOpened = action.payload.opened;
      } else if (action.payload.id === 'slidepanel') {
        state.scene.slidePanelOpened = action.payload.opened;
      } else if (action.payload.id === 'background-search') {
        state.scene.background.search.opened = action.payload.opened;
      } else if (action.payload.id === 'characters-search') {
        state.scene.characters.search.opened = action.payload.opened;
      } else if (action.payload.id === 'background-gen') {
        state.scene.background.gen.opened = action.payload.opened;
      } else if (action.payload.id === 'scene-suggestions') {
        state.scene.sceneSugestions.opened = action.payload.opened;
      } else if (action.payload.id === 'scene-preview') {
        state.scene.scenePreview.opened = action.payload.opened;
        state.scene.scenePreview.sceneId = action.payload.itemId || state.scene.scenePreview.sceneId;
      } else if (action.payload.id === 'indicator') {
        state.scene.indicator.opened = action.payload.opened;
        state.scene.indicator.item = action.payload.opened ? action.payload.item : getEmptyIndicator();
      } else {
        state.scene[action.payload.id].opened = action.payload.opened;
      }
    },
    setBackground: (state, action: PayloadAction<string>) => {
      state.scene.background.selected = action.payload;
    },
    setMusic: (
      state,
      action: PayloadAction<{
        name: string;
        source: string;
      }>,
    ) => {
      state.scene.music.selected = action.payload.name;
      state.scene.music.source = action.payload.source;
    },
    setCharacterModalOpened: (state, action: PayloadAction<number>) => {
      state.scene.characters.openedIndex = action.payload;
    },
    selectCharacter: (
      state,
      action: PayloadAction<{
        index: number;
        id: string;
        outfit: string;
      }>,
    ) => {
      if (state.scene.characters.selected[action.payload.index]) {
        state.scene.characters.selected[action.payload.index].id = action.payload.id;
        state.scene.characters.selected[action.payload.index].outfit = action.payload.outfit;
      }
    },
    setPromptValue: (state, action: PayloadAction<string>) => {
      state.scene.prompt.value = action.payload;
    },
    setTitleValue: (state, action: PayloadAction<string>) => {
      state.scene.title = action.payload;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.scene.submitting = action.payload;
    },
    addImportedBackground: (state, action: PayloadAction<string>) => {
      state.importedBackgrounds.push({
        id: action.payload,
        name: 'background',
        attributes: [],
        description: '',
        source: {
          jpg: action.payload,
        },
      });
    },
    removeImportedBackground: (state, action: PayloadAction<string>) => {
      state.importedBackgrounds = state.importedBackgrounds.filter((background) => background.id !== action.payload);
    },
    addImportedCharacter: (state, action: PayloadAction<NovelCharacter>) => {
      state.importedCharacters.push(action.payload);
    },
    clearImportedCharacters: (state) => {
      state.importedCharacters = [];
    },
    backgroundInferenceStart: (
      state,
      action: PayloadAction<{
        id: string;
        prompt: string;
        apiEndpoint: string;
        servicesEndpoint: string;
      }>,
    ) => {
      state.inference.backgrounds.push({
        id: action.payload.id,
        prompt: action.payload.prompt,
        queuePosition: 0,
      });
      state.inference.fetching = true;
    },
    backgroundInferenceUpdate: (
      state,
      action: PayloadAction<{
        id: string;
        inferenceId?: string;
        queuePosition?: number;
      }>,
    ) => {
      state.inference.backgrounds = state.inference.backgrounds.map((background) => {
        if (background.id === action.payload.id) {
          return {
            ...background,
            queuePosition:
              action.payload.queuePosition !== undefined ? action.payload.queuePosition : background.queuePosition,
            inferenceId: action.payload.inferenceId !== undefined ? action.payload.inferenceId : background.inferenceId,
          };
        }
        return background;
      });
    },
    backgroundInferenceEnd: (
      state,
      action: PayloadAction<{
        id: string;
        result: string;
        servicesEndpoint: string;
        apiEndpoint: string;
      }>,
    ) => {
      const background = state.inference.backgrounds.find((background) => background.id === action.payload.id);
      if (!background) {
        return;
      }
      state.importedBackgrounds.push({
        id: background.id,
        name: 'background',
        attributes: [],
        description: background.prompt,
        source: {
          jpg: action.payload.result,
        },
      });
      state.inference.backgrounds = state.inference.backgrounds.filter(
        (background) => background.id !== action.payload.id,
      );
      state.inference.fetching = false;
    },
    backgroundInferenceFailure: (state, action: PayloadAction<string>) => {
      state.inference.backgrounds = state.inference.backgrounds.filter(
        (background) => background.id !== action.payload,
      );
    },
    startInferencingScene: (state) => {
      state.scene.sceneSugestions.inferencing = true;
    },
    endInferencingScene: (state) => {
      state.scene.sceneSugestions.inferencing = false;
    },
    updateIndicator: (state, action: PayloadAction<NovelIndicator>) => {
      state.scene.indicator.item = action.payload;
    },
  },
});

export const {
  setModalOpened,
  setBackground,
  setMusic,
  setCharacterModalOpened,
  selectCharacter,
  setPromptValue,
  setTitleValue,
  setSubmitting,
  addImportedBackground,
  removeImportedBackground,
  addImportedCharacter,
  clearImportedCharacters,
  backgroundInferenceStart,
  backgroundInferenceUpdate,
  backgroundInferenceEnd,
  backgroundInferenceFailure,
  startInferencingScene,
  endInferencingScene,
  updateIndicator,
} = creationSlice.actions;

export default creationSlice.reducer;
