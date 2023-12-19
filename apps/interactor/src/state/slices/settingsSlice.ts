import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  Voices,
  ModelType,
  FontSize,
  Speed,
  SettingsState,
} from '../versioning'

export type {
  Voices,
  ModelType,
  FontSize,
  Speed,
  SettingsState,
} from '../versioning'

const initialState: SettingsState = {
  model: ModelType.Default,
  user: {
    name: 'Anon',
    isPremium: false,
  },
  text: {
    speed: Speed.Normal,
    fontSize: FontSize.Small,
    autoContinue: false,
  },
  voice: {
    enabled: false,
    speed: Speed.Normal,
    voiceId: Voices.SaraWhispering,
  },
  music: {
    enabled: false,
    volume: 1,
  },
  modals: {
    settings: false,
    about: false,
    history: false,
    edit: {
      opened: false,
      id: '',
    },
  },
}

export const settingSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setModel: (state, action: PayloadAction<ModelType>) => {
      state.model = action.payload
    },
    setName: (state, action: PayloadAction<string>) => {
      state.user.name = action.payload
    },
    setFontSize: (state, action: PayloadAction<FontSize>) => {
      state.text.fontSize = action.payload
    },
    setSpeed: (state, action: PayloadAction<Speed>) => {
      state.text.speed = action.payload
    },
    setAutoContinue: (state, action: PayloadAction<boolean>) => {
      state.text.autoContinue = action.payload
    },
    setVoiceEnabled: (state, action: PayloadAction<boolean>) => {
      state.voice.enabled = action.payload
    },
    setVoiceSpeed: (state, action: PayloadAction<Speed>) => {
      state.voice.speed = action.payload
    },
    setVoiceId: (state, action: PayloadAction<Voices>) => {
      state.voice.voiceId = action.payload
    },
    setMusicEnabled: (state, action: PayloadAction<boolean>) => {
      state.music.enabled = action.payload
    },
    setMusicVolume: (state, action: PayloadAction<number>) => {
      state.music.volume = action.payload
    },
    setSettingsModal: (state, action: PayloadAction<boolean>) => {
      state.modals.settings = action.payload
    },
    setAboutModal: (state, action: PayloadAction<boolean>) => {
      state.modals.about = action.payload
    },
    setHistoryModal: (state, action: PayloadAction<boolean>) => {
      state.modals.history = action.payload
    },
    setEditModal: (
      state,
      action: PayloadAction<{ opened: boolean; id: string }>
    ) => {
      state.modals.edit = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase('global/replaceState', (_state, action) => {
      // eslint-disable-next-line
      // @ts-ignore
      return action.payload.settings
    })
  },
})

export const {
  setModel,
  setName,
  setFontSize,
  setSpeed,
  setAutoContinue,
  setVoiceEnabled,
  setVoiceSpeed,
  setVoiceId,
  setMusicEnabled,
  setMusicVolume,
  setSettingsModal,
  setAboutModal,
  setHistoryModal,
  setEditModal,
} = settingSlice.actions

export default settingSlice.reducer
