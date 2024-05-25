import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NovelCharacter, NovelState, NovelNSFW } from '../versioning'
import { v4 as randomUUID } from 'uuid'

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
        name: string
        prompt: string
        background: string
        newChars?: NovelCharacter[]
        characters: { id: string; outfit: string }[]
        music: string
        children?: string[]
      }>
    ) => {
      if (action.payload.newChars) {
        state.characters = [...state.characters, ...action.payload.newChars]
      }

      const background = state.backgrounds.find(
        (bg) => bg.source.jpg === action.payload.background
      )
      let backgroundId = background?.id || ''
      if (!background) {
        backgroundId = randomUUID()
        state.backgrounds.push({
          id: backgroundId,
          name: 'background',
          attributes: [],
          description: '',
          source: {
            jpg: action.payload.background,
          },
        })
      }

      const music = state.songs.find(
        (song) =>
          song.source === action.payload.music ||
          song.id === action.payload.music
      )
      let musicId = music?.id || ''
      if (!music) {
        musicId = randomUUID()
        state.songs.push({
          id: musicId,
          name: 'music',
          source: action.payload.music,
          description: '',
          tags: [],
        })
      }

      state.scenes.push({
        id: action.payload.id,
        name: action.payload.name,
        prompt: action.payload.prompt,
        backgroundId,
        musicId,
        characters: action.payload.characters.map((char) => ({
          characterId: char.id,
          outfit: char.outfit,
          objective: '',
        })),
        children: action.payload.children || [],
        actionText: action.payload.prompt,
        condition: '',
        nsfw: NovelNSFW.NONE,
        parentMapId: null,
      })
    },
    addChildrenScenes: (
      state,
      action: PayloadAction<{ parentId: string; childIds: string[] }>
    ) => {
      const parent = state.scenes.find(
        (scene) => scene.id === action.payload.parentId
      )
      if (parent) {
        action.payload.childIds.forEach((childId) => {
          if (!parent.children.includes(childId)) {
            parent.children.push(childId)
          }
        })
      }
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

export const { setNovel, addScene, addChildrenScenes } = novelSlice.actions

export default novelSlice.reducer
