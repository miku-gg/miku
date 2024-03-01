import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  FontSize,
  ModelType,
  SettingsState,
  Speed,
} from '../versioning'

export { ModelType, FontSize, Speed } from '../versioning'

export type { SettingsState } from '../versioning'

export const initialState: SettingsState = {
  model: ModelType.RP,
  user: {
    name: 'Anon',
    isPremium: false,
  },
  prompt: {
    systemPrompt: '',
  },
  text: {
    speed: Speed.Normal,
    fontSize: FontSize.Medium,
    autoContinue: false,
  },
  voice: {
    autoplay: false,
    speed: Speed.Normal,
    readAsteriks: false,
  },
  music: {
    enabled: false,
    volume: 0.2,
  },
  modals: {
    settings: false,
    settingsTab: 'general',
    about: false,
    history: false,
    edit: {
      opened: false,
      id: '',
    },
    deleteNodeConfirmation: {
      opened: false,
      id: '',
    },
  },
}

export const settingSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (_state, action: PayloadAction<SettingsState>) => {
      return action.payload
    },
    setModel: (state, action: PayloadAction<ModelType>) => {
      state.model = action.payload
    },
    setName: (state, action: PayloadAction<string>) => {
      state.user.name = action.payload
    },
    setSettingsTab: (
      state,
      action: PayloadAction<'general' | 'prompt' | 'audio'>
    ) => {
      state.modals.settingsTab = action.payload
    },
    setSystemPrompt: (state, action: PayloadAction<string>) => {
      state.prompt.systemPrompt = action.payload
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
    setVoiceAutoplay: (state, action: PayloadAction<boolean>) => {
      state.voice.autoplay = action.payload
    },
    setVoiceSpeed: (state, action: PayloadAction<Speed>) => {
      state.voice.speed = action.payload
    },
    setReadAsteriks: (state, action: PayloadAction<boolean>) => {
      state.voice.readAsteriks = action.payload
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
    setDeleteNodeConfirmationModal: (
      state,
      action: PayloadAction<{ opened: boolean; id: string }>
    ) => {
      state.modals.deleteNodeConfirmation = action.payload
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
  setSettings,
  setModel,
  setName,
  setSystemPrompt,
  setFontSize,
  setSpeed,
  setAutoContinue,
  setSettingsTab,
  setVoiceAutoplay,
  setVoiceSpeed,
  setMusicEnabled,
  setMusicVolume,
  setSettingsModal,
  setAboutModal,
  setHistoryModal,
  setEditModal,
  setDeleteNodeConfirmationModal,
  setReadAsteriks,
} = settingSlice.actions

export default settingSlice.reducer
