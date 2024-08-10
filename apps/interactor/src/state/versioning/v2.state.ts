import { DeprecatedNovelV2 as NovelV2 } from '@mikugg/bot-utils';

export interface NarrationInteraction {
  id: string;
  parentResponseId: string | null;
  query: string;
  sceneId: string;
  responsesId: string[];
}

export interface NarrationResponse {
  id: string;
  selected: boolean;
  fetching: boolean;
  parentInteractionId: string | null;
  suggestedScenes: string[];
  selectedRole: string | null;
  characters: {
    role: string;
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
}

export interface NovelScene extends NovelV2.NovelScene {}
export interface NovelCharacterOutfit extends NovelV2.NovelCharacterOutfit {}
export interface NovelCharacters extends NovelV2.NovelCharacters {}
export interface NovelState extends NovelV2.NovelState {}

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
    isPremium: boolean;
  };
  prompt: {
    systemPrompt: string;
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
    edit: {
      opened: boolean;
      id: string;
    };
  };
}

export const VersionId = 'v2';

export interface State {
  version: string;
  settings: SettingsState;
  narration: NarrationState;
  novel: NovelState;
}
