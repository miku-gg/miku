import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CreationState {
  scene: {
    slidePanelOpened: boolean
    sceneOpened: boolean
    background: {
      opened: boolean
      selected: string
    }
    characters: {
      openedIndex: number
      selected: {
        id: string
        outfit: string
      }[]
    }
    prompt: {
      loading: boolean
      value: string
    }
    music: {
      opened: boolean
      selected: string
    }
  }
}

export const initialState: CreationState = {
  scene: {
    slidePanelOpened: false,
    sceneOpened: false,
    background: {
      opened: false,
      selected: '',
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
    },
    prompt: {
      loading: false,
      value: '',
    },
    music: {
      opened: false,
      selected: '',
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
        id: 'slidepanel' | 'scene' | 'background' | 'music'
        opened: boolean
      }>
    ) => {
      if (action.payload.id === 'scene') {
        state.scene.sceneOpened = action.payload.opened
      } else if (action.payload.id === 'slidepanel') {
        state.scene.slidePanelOpened = action.payload.opened
      } else {
        state.scene[action.payload.id].opened = action.payload.opened
      }
    },
    setModalSelected: (
      state,
      action: PayloadAction<{
        id: 'background' | 'music'
        selected: string
      }>
    ) => {
      state.scene[action.payload.id].selected = action.payload.selected
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
  },
})

export const {
  setModalOpened,
  setModalSelected,
  setCharacterModalOpened,
  selectCharacter,
  setPromptValue,
} = creationSlice.actions

export default creationSlice.reducer
