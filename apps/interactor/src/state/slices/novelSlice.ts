import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NovelCharacter, NovelState, NovelNSFW } from '../versioning'

export type {
  NovelScene,
  NovelCharacter,
  NovelCharacterOutfit,
  NovelState,
} from '../versioning'

const initialState: NovelState = {
  title: '',
  description: '',
  characters: [],
  scenes: [],
  starts: [],
  author: '',
  backgrounds: [],
  logoPic: '',
  maps: [],
  songs: [],
  tags: [],
}

const novelSlice = createSlice({
  name: 'novel',
  initialState,
  reducers: {
    setNovel: (_state, action: PayloadAction<NovelState>) => {
      return action.payload
    },
    addScene: (
      state,
      action: PayloadAction<{
        id: string
        prompt: string
        background: string
        newChars?: NovelCharacter[]
        characters: { id: string; outfit: string }[]
        music: string
      }>
    ) => {
      if (action.payload.newChars) {
        state.characters = [...state.characters, ...action.payload.newChars]
      }
      state.scenes.push({
        id: action.payload.id,
        name: action.payload.prompt,
        prompt: action.payload.prompt,
        backgroundId: action.payload.background,
        musicId: action.payload.music,
        characters: action.payload.characters.map((char) => ({
          characterId: char.id,
          outfit: char.outfit,
          objective: '',
        })),
        children: [],
        actionText: action.payload.prompt,
        condition: '',
        nsfw: NovelNSFW.NONE,
        parentMapId: null,
      })
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

export const { setNovel, addScene } = novelSlice.actions

export default novelSlice.reducer
