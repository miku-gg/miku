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
  title: '',
  description: '',
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
  extraReducers: (builder) => {
    builder.addCase('global/replaceState', (_state, action) => {
      // eslint-disable-next-line
      // @ts-ignore
      return action.payload.novel
    })
  },
})

export const { setNovel } = novelSlice.actions

export default novelSlice.reducer
