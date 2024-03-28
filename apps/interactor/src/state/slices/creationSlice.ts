import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NovelCharacter, NovelBackground } from '../versioning'

interface CreationState {
  importedBackgrounds: NovelBackground[]
  importedCharacters: NovelCharacter[]
  scene: {
    slidePanelOpened: boolean
    sceneOpened: boolean
    title: string
    submitting: boolean
    background: {
      opened: boolean
      selected: string
      search: {
        opened: boolean
      }
      gen: {
        opened: boolean
      }
    }
    characters: {
      openedIndex: number
      selected: {
        id: string
        outfit: string
      }[]
      search: {
        opened: boolean
      }
    }
    prompt: {
      loading: boolean
      value: string
    }
    music: {
      opened: boolean
      selected: string
      source: string
    }
  }
  inference: {
    backgrounds: {
      id: string
      inferenceId?: string
      prompt: string
      queuePosition: number
    }[]
  }
  sceneSugestions: {
    opened: boolean
    loading: boolean
    suggestions: {
      actionText: string
      probability: string
      prompt: string
      sdPrompt: string
    }[]
  }
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
  },
  inference: {
    backgrounds: [],
  },
  sceneSugestions: {
    opened: false,
    loading: false,
    suggestions: [],
  },
}

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
        opened: boolean
      }>
    ) => {
      if (action.payload.id === 'scene') {
        state.scene.sceneOpened = action.payload.opened
      } else if (action.payload.id === 'slidepanel') {
        state.scene.slidePanelOpened = action.payload.opened
      } else if (action.payload.id === 'background-search') {
        state.scene.background.search.opened = action.payload.opened
      } else if (action.payload.id === 'characters-search') {
        state.scene.characters.search.opened = action.payload.opened
      } else if (action.payload.id === 'background-gen') {
        state.scene.background.gen.opened = action.payload.opened
      } else if (action.payload.id === 'scene-suggestions') {
        state.sceneSugestions.opened = action.payload.opened
      } else {
        state.scene[action.payload.id].opened = action.payload.opened
      }
    },
    setBackground: (state, action: PayloadAction<string>) => {
      state.scene.background.selected = action.payload
    },
    setMusic: (
      state,
      action: PayloadAction<{
        name: string
        source: string
      }>
    ) => {
      state.scene.music.selected = action.payload.name
      state.scene.music.source = action.payload.source
    },
    setCharacterModalOpened: (state, action: PayloadAction<number>) => {
      state.scene.characters.openedIndex = action.payload
    },
    selectCharacter: (
      state,
      action: PayloadAction<{
        index: number
        id: string
        outfit: string
      }>
    ) => {
      if (state.scene.characters.selected[action.payload.index]) {
        state.scene.characters.selected[action.payload.index].id =
          action.payload.id
        state.scene.characters.selected[action.payload.index].outfit =
          action.payload.outfit
      }
    },
    setPromptValue: (state, action: PayloadAction<string>) => {
      state.scene.prompt.value = action.payload
    },
    setTitleValue: (state, action: PayloadAction<string>) => {
      state.scene.title = action.payload
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.scene.submitting = action.payload
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
      })
    },
    removeImportedBackground: (state, action: PayloadAction<string>) => {
      state.importedBackgrounds = state.importedBackgrounds.filter(
        (background) => background.id !== action.payload
      )
    },
    addImportedCharacter: (state, action: PayloadAction<NovelCharacter>) => {
      state.importedCharacters.push(action.payload)
    },
    clearImportedCharacters: (state) => {
      state.importedCharacters = []
    },
    backgroundInferenceStart: (
      state,
      action: PayloadAction<{
        id: string
        prompt: string
        APIEndpoint: string
      }>
    ) => {
      state.inference.backgrounds.push({
        id: action.payload.id,
        prompt: action.payload.prompt,
        queuePosition: 0,
      })
    },
    backgroundInferenceUpdate: (
      state,
      action: PayloadAction<{
        id: string
        inferenceId: string
        queuePosition: number
      }>
    ) => {
      state.inference.backgrounds = state.inference.backgrounds.map(
        (background) => {
          if (background.id === action.payload.id) {
            return {
              ...background,
              queuePosition: action.payload.queuePosition,
              inferenceId: action.payload.inferenceId,
            }
          }
          return background
        }
      )
    },
    backgroundInferenceEnd: (
      state,
      action: PayloadAction<{
        id: string
        result: string
      }>
    ) => {
      const background = state.inference.backgrounds.find(
        (background) => background.id === action.payload.id
      )
      if (!background) {
        return
      }
      state.importedBackgrounds.push({
        id: action.payload.result,
        name: 'background',
        attributes: [],
        description: background.prompt,
        source: {
          jpg: action.payload.result,
        },
      })
      state.inference.backgrounds = state.inference.backgrounds.filter(
        (background) => background.id !== action.payload.id
      )
    },
    backgroundInferenceFailure: (state, action: PayloadAction<string>) => {
      state.inference.backgrounds = state.inference.backgrounds.filter(
        (background) => background.id !== action.payload
      )
    },
    sceneSuggestionsStart: (state) => {
      state.sceneSugestions.opened = true
      state.sceneSugestions.loading = true
    },
    sceneSuggestionsEnd: (
      state,
      action: PayloadAction<{
        suggestions: {
          actionText: string
          probability: string
          prompt: string
          sdPrompt: string
        }[]
      }>
    ) => {
      state.sceneSugestions.loading = false
      state.sceneSugestions.suggestions = action.payload.suggestions
    },
  },
})

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
  sceneSuggestionsStart,
  sceneSuggestionsEnd,
} = creationSlice.actions

export default creationSlice.reducer
