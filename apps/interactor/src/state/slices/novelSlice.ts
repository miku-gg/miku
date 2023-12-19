import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NovelState } from '../versioning'

export type {
  NovelScene,
  NovelCharacters,
  NovelCharacterOutfit,
  NovelState,
} from '../versioning'

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
