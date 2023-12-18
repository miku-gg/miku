import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NovelScene {
  id: string
  name: string
  prompt: string
  background: string
  music: string
  roles: {
    characterId: string
    role: string
  }[]
  children: string[]
}

export interface NovelCharacterOutfit {
  id: string
  name: string
  template: string
  emotions: {
    id: string
    source: string[]
    sound?: string
  }[]
}

export interface NovelCharacters {
  [id: string]:
    | {
        id: string
        name: string
        profile_pic: string
        outfits: {
          [outfit: string]: NovelCharacterOutfit | undefined
        }
        /** Role to outfit mapping */
        roles: {
          [role: string]: string | undefined
        }
      }
    | undefined
}
export interface NovelState {
  fetching: boolean
  characters: NovelCharacters
  scenes: NovelScene[]
  startSceneId: string
}

const initialState: NovelState = {
  fetching: true,
  characters: {},
  scenes: [],
  startSceneId: '',
}

const novelSlice = createSlice({
  name: 'novel',
  initialState,
  reducers: {
    setNovel: (_state, action: PayloadAction<NovelState>) => {
      return action.payload
    },
  },
})

export const { setNovel } = novelSlice.actions

export default novelSlice.reducer
