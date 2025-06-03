import { NovelV3 } from '@mikugg/bot-utils';

export interface NarrationInteraction {
  id: string;
  parentResponseId: string | null;
  query: string;
  sceneId: string;
  responsesId: string[];
  afterBattle?: {
    battleId: string;
    isWin: boolean;
  };
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

export interface NarrationSummarySentence {
  sentence: string;
  importance: number;
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
    reasoning?: string;
  }[];
  childrenInteractions: {
    interactionId: string;
    selected: boolean;
  }[];
  summary?: {
    sentences: NarrationSummarySentence[];
  };
  indicators?: {
    id: string;
    value: string;
  }[];
  battleStartId?: string;
  objectiveCompletedIds?: string[];
}

export interface NarrationState {
  id: string;
  fetching: boolean;
  currentResponseId: string;
  input: {
    text: string;
    suggestions: string[];
    disabled: boolean;
    seenCutscene?: boolean;
    cutscenePartIndex: number;
    cutsceneTextIndex: number;
    prefillIndicators?: {
      id: string;
      value: string | number;
    }[];
  };
  interactions: {
    [id: string]: NarrationInteraction | undefined;
  };
  responses: {
    [id: string]: NarrationResponse | undefined;
  };
  seenHints?: string[];
  createdIndicatorIds?: string[];
  hasPlayedGlobalStartCutscene?: boolean;
  hasShownStartSelectionModal?: boolean;
  currentBattle?: {
    state: BattleState;
    isActive: boolean;
  } | null;
}

export interface NovelScene extends NovelV3.NovelScene {}
export interface NovelCharacterOutfit extends NovelV3.NovelCharacterOutfit {}
export interface NovelState extends NovelV3.NovelState {}
export interface NovelCharacter extends NovelV3.NovelCharacter {}
export interface NovelBackground extends NovelV3.NovelBackground {}
export interface NovelMap extends NovelV3.NovelMap {}
export interface NovelSong extends NovelV3.NovelSong {}
export interface NovelStart extends NovelV3.NovelStart {}
export interface NovelIndicator extends NovelV3.NovelIndicator {}
export interface NovelBattle extends NovelV3.NovelBattle {}
export interface NovelRPG extends NovelV3.NovelRPG {}
export interface BattleState extends NovelV3.BattleState {}
export type WearableSlot = NovelV3.WearableSlot;

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
  EN_Heart = 'af_heart',
  EN_Alloy = 'af_alloy',
  EN_Aoede = 'af_aoede',
  EN_Bella = 'af_bella',
  EN_Jessica = 'af_jessica',
  EN_KORE = 'af_kore',
  EN_Irulan = 'af_v0irulan',
  EN_Nicole = 'af_nicole',
  EN_Nova = 'af_nova',
  EN_River = 'af_river',
  EN_Sarah = 'af_sarah',
  EN_Sky = 'af_sky',
  EN_SkyBella = 'af_sky+af_bella',

  EN_Alice = 'bf_alice',
  EN_Emma = 'bf_emma',
  EN_Isabella = 'bf_isabella',
  EN_Lily = 'bf_lily',

  EN_Adam = 'am_adam',
  EN_Echo = 'am_echo',
  EN_Eric = 'am_eric',
  EN_Fenrir = 'am_fenrir',
  EN_Gurney = 'am_v0gurney',
  EN_Liam = 'am_liam',
  EN_Michael = 'am_michael',
  EN_Onyx = 'am_onyx',
  EN_Puck = 'am_puck',
  EN_Santa = 'am_santa',

  EN_Daniel = 'bm_daniel',
  EN_Fable = 'bm_fable',
  EN_George = 'bm_george',
  EN_Lewis = 'bm_lewis',

  ES_Dora = 'ef_dora',
  ES_Alex = 'em_alex',
  ES_Santa = 'em_santa',

  FR_Siwis = 'ff_siwis',

  IT_Sara = 'if_sara',
  IT_Nicola = 'im_nicola',

  JA_Alpha = 'jf_alpha',
  JA_Gongitsune = 'jf_gongitsune',
  JA_Nezumi = 'jf_nezumi',
  JA_Tebukuro = 'jf_tebukuro',
  JA_Kumo = 'jm_kumo',

  PT_Dora = 'pf_dora',
  PT_Alex = 'pm_alex',
  PT_Santa = 'pm_santa',
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
    reasoningEnabled: boolean;
  };
  chatBox: {
    isDraggable: boolean;
  };
  text: {
    speed: Speed;
    fontSize: FontSize;
    autoContinue: boolean;
    responseFormat: string;
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
    deviceExport: boolean;
    memoryCapacity: boolean;
    regenerateEmotion: {
      opened: boolean;
      selectedCharacterIndex: number;
    };
    edit: {
      opened: boolean;
      id: string;
    };
  };
  summaries?: {
    enabled: boolean;
  };
  displayingLastSentence: boolean;
}

export const VersionId = 'v3';

export interface State {
  version: string;
  settings: SettingsState;
  narration: NarrationState;
  novel: NovelState;
}
