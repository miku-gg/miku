import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Voices } from '../utils/voices'

export enum ModelType {
  Default = 'default',
  Smart = 'smart',
}

export enum FontSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum Speed {
  Slow = 'slow',
  Normal = 'normal',
  Fast = 'fast',
  Presto = 'presto',
}

export interface SettingsState {
  model: ModelType
  user: {
    name: string
    isPremium: boolean
  }
  text: {
    speed: Speed
    fontSize: FontSize
    autoContinue: boolean
  }
  voice: {
    enabled: boolean
    speed: Speed
    voiceId: Voices
  }
  music: {
    enabled: boolean
    volume: number
  }
  modals: {
    settings: boolean
    about: boolean
    history: boolean
  }
}

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
} = settingSlice.actions

export default settingSlice.reducer
