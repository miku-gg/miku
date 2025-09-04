import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FontSize, ModelType, NovelNSFW, SettingsState, Speed, Voices } from '../versioning';

export { FontSize, ModelType, Speed, Voices } from '../versioning';

export type { SettingsState } from '../versioning';

// Add the new ResponseFormat enum
export enum ResponseFormat {
  FullText = 'FullText',
  VNStyle = 'VNStyle',
}

export const getVoiceItems = (_language: string): { name: string; value: Voices }[] => {
  const language = _language.toLowerCase();
  if (language.startsWith('es')) {
    return [
      { name: 'Dora', value: Voices.ES_Dora },
      { name: 'Alex', value: Voices.ES_Alex },
      { name: 'Santa', value: Voices.ES_Santa },
    ];
  }
  if (language.startsWith('fr')) {
    return [{ name: 'Siwis', value: Voices.FR_Siwis }];
  }
  if (language.startsWith('it')) {
    return [
      { name: 'Sara', value: Voices.IT_Sara },
      { name: 'Nicola', value: Voices.IT_Nicola },
    ];
  }
  if (language.startsWith('jp')) {
    return [
      { name: 'Alpha', value: Voices.JA_Alpha },
      { name: 'Gongitsune', value: Voices.JA_Gongitsune },
      { name: 'Nezumi', value: Voices.JA_Nezumi },
      { name: 'Tebukuro', value: Voices.JA_Tebukuro },
      { name: 'Kumo', value: Voices.JA_Kumo },
    ];
  }
  if (language.startsWith('pt')) {
    return [
      { name: 'Dora', value: Voices.PT_Dora },
      { name: 'Alex', value: Voices.PT_Alex },
      { name: 'Santa', value: Voices.PT_Santa },
    ];
  }
  return [
    // Female voices
    { name: 'SkyBella', value: Voices.EN_SkyBella },
    { name: 'Heart', value: Voices.EN_Heart },
    { name: 'Alloy', value: Voices.EN_Alloy },
    { name: 'Aoede', value: Voices.EN_Aoede },
    { name: 'Bella', value: Voices.EN_Bella },
    { name: 'Jessica', value: Voices.EN_Jessica },
    { name: 'KORE', value: Voices.EN_KORE },
    { name: 'Irulan', value: Voices.EN_Irulan },
    { name: 'Nicole', value: Voices.EN_Nicole },
    { name: 'Nova', value: Voices.EN_Nova },
    { name: 'River', value: Voices.EN_River },
    { name: 'Sarah', value: Voices.EN_Sarah },
    { name: 'Sky', value: Voices.EN_Sky },
    { name: 'Alice', value: Voices.EN_Alice },
    { name: 'Emma', value: Voices.EN_Emma },
    { name: 'Isabella', value: Voices.EN_Isabella },
    { name: 'Lily', value: Voices.EN_Lily },
    // Male voices
    { name: 'Adam', value: Voices.EN_Adam },
    { name: 'Echo', value: Voices.EN_Echo },
    { name: 'Eric', value: Voices.EN_Eric },
    { name: 'Fenrir', value: Voices.EN_Fenrir },
    { name: 'Gurney', value: Voices.EN_Gurney },
    { name: 'Liam', value: Voices.EN_Liam },
    { name: 'Michael', value: Voices.EN_Michael },
    { name: 'Onyx', value: Voices.EN_Onyx },
    { name: 'Puck', value: Voices.EN_Puck },
    { name: 'Santa', value: Voices.EN_Santa },
    { name: 'Daniel', value: Voices.EN_Daniel },
    { name: 'Fable', value: Voices.EN_Fable },
    { name: 'George', value: Voices.EN_George },
    { name: 'Lewis', value: Voices.EN_Lewis },
  ];
};

export const initialState: SettingsState = {
  model: ModelType.RP,
  user: {
    name: 'Anon',
    isTester: false,
    isPremium: false,
    nsfw: NovelNSFW.EXPLICIT,
    credits: 0,
    loading: false,
    sceneSuggestionsLeft: 0,
  },
  chatBox: {
    isDraggable: false,
  },
  prompt: {
    systemPrompt: '',
    reasoningEnabled: false,
  },
  text: {
    speed: Speed.Normal,
    fontSize: FontSize.Medium,
    autoContinue: false,
    responseFormat: ResponseFormat.FullText,
  },
  voice: {
    autoplay: false,
    speed: Speed.Normal,
    voiceId: Voices.EN_SkyBella,
  },
  music: {
    enabled: true,
    volume: 0.2,
  },
  modals: {
    settings: false,
    settingsTab: 'general',
    about: false,
    history: false,
    map: false,
    debug: false,
    testing: false,
    modelSelector: false,
    memoryCapacity: false,
    deviceExport: false,
    regenerateEmotion: {
      opened: false,
      selectedCharacterIndex: 0,
    },
    edit: {
      opened: false,
      id: '',
    },
  },
  summaries: {
    enabled: false,
  },
  displayingLastSentence: false,
};

export const settingSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (_state, action: PayloadAction<SettingsState>) => {
      return action.payload;
    },
    setMemoryCapacityModal: (state, action: PayloadAction<boolean>) => {
      state.modals.memoryCapacity = action.payload;
    },
    setModel: (state, action: PayloadAction<ModelType>) => {
      state.model = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.user.name = action.payload;
    },
    setSettingsTab: (state, action: PayloadAction<'general' | 'prompt' | 'audio'>) => {
      state.modals.settingsTab = action.payload;
    },
    setSystemPrompt: (state, action: PayloadAction<string>) => {
      state.prompt.systemPrompt = action.payload;
    },
    setIsDraggable: (state, action: PayloadAction<boolean>) => {
      state.chatBox.isDraggable = action.payload;
    },
    setFontSize: (state, action: PayloadAction<FontSize>) => {
      state.text.fontSize = action.payload;
    },
    setSpeed: (state, action: PayloadAction<Speed>) => {
      state.text.speed = action.payload;
    },
    setAutoContinue: (state, action: PayloadAction<boolean>) => {
      state.text.autoContinue = action.payload;
    },
    setVoiceAutoplay: (state, action: PayloadAction<boolean>) => {
      state.voice.autoplay = action.payload;
    },
    setVoiceSpeed: (state, action: PayloadAction<Speed>) => {
      state.voice.speed = action.payload;
    },
    setVoiceId: (state, action: PayloadAction<Voices>) => {
      state.voice.voiceId = action.payload;
    },
    setMusicEnabled: (state, action: PayloadAction<boolean>) => {
      state.music.enabled = action.payload;
    },
    setMusicVolume: (state, action: PayloadAction<number>) => {
      state.music.volume = action.payload;
    },
    setSettingsModal: (state, action: PayloadAction<boolean>) => {
      state.modals.settings = action.payload;
    },
    setAboutModal: (state, action: PayloadAction<boolean>) => {
      state.modals.about = action.payload;
    },
    setHistoryModal: (state, action: PayloadAction<boolean>) => {
      state.modals.history = action.payload;
    },
    setMapModal: (state, action: PayloadAction<boolean>) => {
      state.modals.map = action.payload;
    },
    setEditModal: (state, action: PayloadAction<{ opened: boolean; id: string }>) => {
      state.modals.edit = action.payload;
    },
    setDebugModal: (state, action: PayloadAction<boolean>) => {
      state.modals.debug = action.payload;
    },
    setModelSelectorModal: (state, action: PayloadAction<boolean>) => {
      state.modals.modelSelector = action.payload;
    },
    setTestingModal: (state, action: PayloadAction<boolean>) => {
      state.modals.testing = action.payload;
    },
    setDeviceExportModal: (state, action: PayloadAction<boolean>) => {
      state.modals.deviceExport = action.payload;
    },
    setSummariesEnabled: (state, action: PayloadAction<boolean>) => {
      state.summaries = {
        enabled: action.payload,
      };
    },
    userDataFetchStart: (
      state,
      // eslint-disable-next-line
      _action: PayloadAction<{ apiEndpoint: string }>,
    ) => {
      state.user.loading = true;
    },
    userDataFetchEnd: (
      state,
      action: PayloadAction<{
        isPremium: boolean;
        credits: number;
        sceneSuggestionsLeft: number;
        isTester: boolean;
      }>,
    ) => {
      state.user.loading = false;
      state.user.isPremium = action.payload.isPremium;
      state.user.credits = action.payload.credits;
      state.user.sceneSuggestionsLeft = action.payload.sceneSuggestionsLeft;
      state.user.isTester = action.payload.isTester;
    },
    setResponseFormat: (state, action: PayloadAction<ResponseFormat>) => {
      state.text.responseFormat = action.payload;
    },
    setDisplayingLastSentence: (state, action: PayloadAction<boolean>) => {
      state.displayingLastSentence = action.payload;
    },
    setRegenerateEmotionModal: (state, action: PayloadAction<{ opened: boolean; selectedCharacterIndex?: number }>) => {
      if (!state.modals.regenerateEmotion) {
        state.modals.regenerateEmotion = {
          opened: false,
          selectedCharacterIndex: 0,
        };
      }
      state.modals.regenerateEmotion.opened = action.payload.opened;
      if (action.payload.selectedCharacterIndex !== undefined) {
        state.modals.regenerateEmotion.selectedCharacterIndex = action.payload.selectedCharacterIndex;
      } else if (action.payload.opened) {
        // Reset to 0 when opening if no index is provided
        state.modals.regenerateEmotion.selectedCharacterIndex = 0;
      }
    },
    setReasoningEnabled: (state, action: PayloadAction<boolean>) => {
      state.prompt.reasoningEnabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('global/replaceState', (_state, action) => {
      // eslint-disable-next-line
      // @ts-ignore
      return action.payload.settings;
    });
  },
});

export const {
  setSettings,
  setMemoryCapacityModal,
  setModel,
  setName,
  setIsDraggable,
  setSystemPrompt,
  setFontSize,
  setSpeed,
  setAutoContinue,
  setSettingsTab,
  setVoiceAutoplay,
  setVoiceSpeed,
  setVoiceId,
  setMusicEnabled,
  setModelSelectorModal,
  setMusicVolume,
  setSettingsModal,
  setAboutModal,
  setHistoryModal,
  setMapModal,
  setDeviceExportModal,
  setEditModal,
  setDebugModal,
  setTestingModal,
  setSummariesEnabled,
  userDataFetchStart,
  userDataFetchEnd,
  setResponseFormat,
  setDisplayingLastSentence,
  setRegenerateEmotionModal,
  setReasoningEnabled,
} = settingSlice.actions;

export default settingSlice.reducer;
