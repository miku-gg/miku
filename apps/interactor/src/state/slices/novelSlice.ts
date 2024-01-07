import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NovelCharacters, NovelState } from '../versioning'

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
    addScene: (
      state,
      action: PayloadAction<{
        id: string
        prompt: string
        background: string
        newChars?: NovelCharacters
        characters: { id: string; outfit: string; role: string }[]
        music: string
      }>
    ) => {
      const roles = action.payload.characters.map(({ id, outfit, role }) => {
        const character =
          state.characters[id] ||
          (action.payload.newChars && action.payload.newChars[id])
        if (!character) {
          return null
        }
        character.roles = {
          ...character.roles,
          [role]: outfit,
        }
        return {
          characterId: id,
          role,
        }
      })
      if (action.payload.newChars) {
        state.characters = {
          ...state.characters,
          ...action.payload.newChars,
        }
      }
      state.scenes.push({
        id: action.payload.id,
        name: action.payload.prompt,
        prompt: action.payload.prompt,
        background: action.payload.background,
        music: action.payload.music,
        roles: roles.filter((role) => role !== null) as {
          characterId: string
          role: string
        }[],
        children: [],
      })
      state.scenes
        .find((scene) => scene.id === state.startSceneId)
        ?.children.push(action.payload.id)
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
