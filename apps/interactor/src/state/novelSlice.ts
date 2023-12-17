import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NovelState {
  fetching: boolean
  characters: {
    [id: string]: {
      id: string
      name: string
      profile_pic: string
      outfits: {
        [outfit: string]: {
          id: string
          name: string
          template: string
          emotions: {
            id: string
            source: string[]
            sound?: string
          }[]
        }
      }
      /** Role to outfit mapping */
      roles: {
        [role: string]: string
      }
    }
  }
  scenes: {
    id: string
    prompt: string
    background: string
    music: string
    roles: {
      characterId: string
      role: string
    }[]
    children: string[]
  }[]
}

const initialState: NovelState = {
  fetching: true,
  characters: {},
  scenes: [],
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
