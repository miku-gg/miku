import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  FontSize,
  ModelType,
  NovelNSFW,
  SettingsState,
  Speed,
  Voices,
} from '../versioning'

export { FontSize, ModelType, Speed, Voices } from '../versioning'

export type { SettingsState } from '../versioning'

export const initialState: SettingsState = {
  model: ModelType.RP,
  user: {
    name: 'Anon',
    isPremium: false,
    nsfw: NovelNSFW.EXPLICIT,
    credits: 0,
    loading: false,
    sceneSuggestionsLeft: 0,
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
    voiceId: Voices.SaraWhispering,
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
    userDataFetchStart: (
      state,
      // eslint-disable-next-line
      _action: PayloadAction<{ apiEndpoint: string }>
    ) => {
      state.user.loading = true
    },
    userDataFetchEnd: (
      state,
      action: PayloadAction<{
        isPremium: boolean
        credits: number
        sceneSuggestionsLeft: number
      }>
    ) => {
      state.user.loading = false
      state.user.isPremium = action.payload.isPremium
      state.user.credits = action.payload.credits
      state.user.sceneSuggestionsLeft = action.payload.sceneSuggestionsLeft
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
  setVoiceId,
  setMusicEnabled,
  setMusicVolume,
  setSettingsModal,
  setAboutModal,
  setHistoryModal,
  setEditModal,
  userDataFetchStart,
  userDataFetchEnd,
} = settingSlice.actions

export default settingSlice.reducer
