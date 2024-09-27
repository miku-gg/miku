import { NovelV3 } from '@mikugg/bot-utils';

export interface NarrationInteraction {
  id: string;
  parentResponseId: string | null;
  query: string;
  sceneId: string;
  responsesId: string[];
}

export interface NarrationSceneSuggestion {
  actionText: string;
  textPrompt: string;
  sdPrompt: string;
  characters: {
    characterId: string;
    outfitPrompt: string;
  }[];
  sceneId: string;
  music?: string;
}

export interface NarrationResponse {
  id: string;
  selected: boolean;
  fetching: boolean;
  parentInteractionId: string | null;
  fetchingSuggestions?: boolean;
  nextScene?: string;
  shouldSuggestScenes?: boolean;
  suggestedScenes: NarrationSceneSuggestion[];
  selectedCharacterId: string | null;
  characters: {
    characterId: string;
    emotion: string;
    pose: string;
    text: string;
  }[];
  childrenInteractions: {
    interactionId: string;
    selected: boolean;
  }[];
}

export interface NarrationState {
  id: string;
  fetching: boolean;
  currentResponseId: string;
  input: {
    text: string;
    suggestions: string[];
    disabled: boolean;
  };
  interactions: {
    [id: string]: NarrationInteraction | undefined;
  };
  responses: {
    [id: string]: NarrationResponse | undefined;
  };
  seenHints?: string[];
}

export interface NovelScene extends NovelV3.NovelScene {}
export interface NovelCharacterOutfit extends NovelV3.NovelCharacterOutfit {}
export interface NovelState extends NovelV3.NovelState {}
export interface NovelCharacter extends NovelV3.NovelCharacter {}
export interface NovelBackground extends NovelV3.NovelBackground {}
export interface NovelMap extends NovelV3.NovelMap {}
export interface NovelSong extends NovelV3.NovelSong {}
export interface NovelStart extends NovelV3.NovelStart {}

export enum NovelNSFW {
  NONE = NovelV3.NovelNSFW.NONE,
  NUDITY = NovelV3.NovelNSFW.NUDITY,
  EXPLICIT = NovelV3.NovelNSFW.EXPLICIT,
}

export enum ModelType {
  RP = 'RP',
  RP_SMART = 'RP_SMART',
}

export enum FontSize {
  Small = 0,
  Medium = 1,
  Large = 2,
}

export enum Speed {
  Slow = 0,
  Normal = 1,
  Fast = 2,
  Presto = 3,
}
export enum Voices {
  Sara = 'azure_tts.en-US-SaraNeural',
  SaraWhispering = 'azure_tts.en-US-SaraNeural.whispering',
  Sonia = 'azure_tts.en-GB-SoniaNeural.sad',
  Jane = 'azure_tts.en-US-JaneNeural.angry',
  Maisie = 'azure_tts.en-GB-MaisieNeural',
  Davis = 'azure_tts.en-US-DavisNeural',
  Tony = 'azure_tts.en-US-TonyNeural',
}

export interface SettingsState {
  model: ModelType;
  user: {
    name: string;
    isTester?: boolean;
    isPremium: boolean;
    nsfw: NovelNSFW;
    credits: number;
    loading: boolean;
    sceneSuggestionsLeft: number;
  };
  prompt: {
    systemPrompt: string;
  };
  chatBox: {
    isDraggable: boolean;
    scrollable: boolean;
  };
  text: {
    speed: Speed;
    fontSize: FontSize;
    autoContinue: boolean;
  };
  voice: {
    autoplay: boolean;
    speed: Speed;
    voiceId: Voices;
  };
  music: {
    enabled: boolean;
    volume: number;
  };
  modals: {
    settings: boolean;
    settingsTab: 'general' | 'prompt' | 'audio';
    about: boolean;
    history: boolean;
    map: boolean;
    debug: boolean;
    testing: boolean;
    modelSelector: boolean;
    memoryCapacity: boolean;
    edit: {
      opened: boolean;
      id: string;
    };
  };
}

export const VersionId = 'v3';

export interface State {
  version: string;
  settings: SettingsState;
  narration: NarrationState;
  novel: NovelState;
}
