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
} = creationSlice.actions

export default creationSlice.reducer
