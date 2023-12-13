export enum PromptCompleterEndpointType {
  OOBABOOGA,
  KOBOLDAI,
  OPENAI,
  APHRODITE,
  CLAUDE
}

export const PROMPT_COMPLETERS: {
  value: PromptCompleterEndpointType,
  label: string,
}[] = [
  {
    value: PromptCompleterEndpointType.OOBABOOGA,
    label: "oobabooga (text-generation-webui)"
  },
  {
    value: PromptCompleterEndpointType.KOBOLDAI,
    label: "Kobold AI"
  },
  {
    value: PromptCompleterEndpointType.OPENAI,
    label: "Open AI"
  },
  {
    value: PromptCompleterEndpointType.APHRODITE,
    label: "Aphrodite"
  },
];

export type OobaboogaSettings = {
  temp: number;
  maxTokens: number;
  topP: number;
  topK: number;
  typicalP: number;
  repetitionPenalty: number;
  encoderRepitionPenalty: number;
  noRepeatNgramSize: number;
  minLength: number;
  doSample: boolean;
  seed: number;
  penaltyAlpha: number;
  numBeams: number;
  lengthPenalty: number;
  earlyStopping: boolean;
  addBosToken: boolean;
  banEosToken: boolean;
  truncateLength: number;
  stoppingStrings: string;
  skipSpecialTokens: boolean;
};

export type KoboldAIsettings = {
  maxContextLength: number;
  maxTokens: number;
  temp: number;
  topP: number;
  topK: number;
  topA: number;
  tailFreeSampling: number;
  typicalP: number;
  repetitionPenalty: number;
  repetitionPenaltyRange: number;
  repetitionPenaltySlope: number;
  order: number[];
};

export type AphroditeSettings = {
  assetsUrl: string;
  botId: string;
  chatId: string;
  botDirectoryEndpoint?: string;
  model?: string;
};

export const OPENAI_MODELS = [
  'gpt-3.5-turbo',
  'text-davinci-003'
] as const;

export type OpenAISettings = {
  oaiModel: typeof OPENAI_MODELS[number];
  temp: number;
  frequencyPenalty: number;
  presencePenalty: number;
  topP: number;
};

export type PromptCompleterEndpointConfig = 
{
  type: PromptCompleterEndpointType.OOBABOOGA,
  genSettings: OobaboogaSettings;
} |
{
  type: PromptCompleterEndpointType.KOBOLDAI,
  genSettings: KoboldAIsettings;
} |
{
  type: PromptCompleterEndpointType.OPENAI,
  genSettings: OpenAISettings;
} |
{
  type: PromptCompleterEndpointType.APHRODITE,
  genSettings: AphroditeSettings
} |
{
  type: PromptCompleterEndpointType.CLAUDE,
  genSettings: {}
};

export const DEFAULT_APHRODITE_SETTINGS: AphroditeSettings = {
  assetsUrl: '',
  botId: '',
  chatId: '',
};

export const DEFAULT_OOBABOOGA_SETTINGS: OobaboogaSettings = {
  temp: 0.7,
  maxTokens: 100,
  topP: 0.9,
  topK: 0,
  typicalP: 1,
  repetitionPenalty: 1.1,
  encoderRepitionPenalty: 1,
  noRepeatNgramSize: 0,
  minLength: 0,
  doSample: true,
  seed: -1,
  penaltyAlpha: 0,
  numBeams: 1,
  lengthPenalty: 1,
  earlyStopping: false,
  addBosToken: true,
  banEosToken: false,
  truncateLength: 4096,
  stoppingStrings: "\nAnon:",
  skipSpecialTokens: true,
};

export const DEFAULT_KOBOLDAI_SETTINGS: KoboldAIsettings = {
  maxContextLength: 4096,
  maxTokens: 200,
  temp: 0.6,
  topP: 0.9,
  topK: 40,
  topA: 0.9,
  tailFreeSampling: 0.6,
  typicalP: 0.95,
  repetitionPenalty: 1.0,
  repetitionPenaltyRange: 512,
  repetitionPenaltySlope: 3.0,
  order: [0, 1, 2, 3, 4],
};

export const DEFAULT_OPENAI_SETTINGS: OpenAISettings = {
  oaiModel: "gpt-3.5-turbo",
  temp: 0.8,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  topP: 1.0,
};

export enum PromptStrategy {
  WPP = 'wpp',
  SBF = 'sbf',
  RPBT = 'rpbt',
  PYG = 'pyg',
  ALPACA = 'alpaca',
  VICUNA11 = 'vicuna11'
}

export const PROMPT_STRATEGIES: {
  value: PromptStrategy,
  label: string,
}[] = [
  {
    value: PromptStrategy.WPP,
    label: "W++"
  },
  {
    value: PromptStrategy.SBF,
    label: "SBF"
  },
  {
    value: PromptStrategy.PYG,
    label: "Pygmalion style"
  },
  {
    value: PromptStrategy.RPBT,
    label: "RPBT (Roleplay Bot)"
  },
  {
    value: PromptStrategy.ALPACA,
    label: "Alpaca"
  },
  {
    value: PromptStrategy.VICUNA11,
    label: "Vicuna 1.1"
  },
];

export enum VoiceServiceType {
  ELEVENLABS_TTS = 'elevenlabs_tts',
  AZURE_TTS = 'azure_tts',
  NOVELAI_TTS = 'novelai_tts'
}


export const VOICE_SERVICES: {
  value: VoiceServiceType,
  label: string,
}[] = [
  {
    value: VoiceServiceType.ELEVENLABS_TTS,
    label: "Eleven Labs"
  },
  {
    value: VoiceServiceType.AZURE_TTS,
    label: "Azure TTS"
  },
  {
    value: VoiceServiceType.NOVELAI_TTS,
    label: "NovelAI TTS"
  }
];

export enum STTEndpointType {
  WHISPER = 'whisper'
}

export enum EmbeddingsService {
  SBERT = 'sbert',
  OPENAI = 'openai'
}

export interface BotConfigSettings {
  promptCompleterEndpoint: PromptCompleterEndpointConfig
  speechToTextEndpoint: {
    enabled: boolean,
    type: STTEndpointType,
  }
  promptStrategy: PromptStrategy
  embeddingsService: EmbeddingsService
  text: {
    name: string
    speed: number
    fontSize: number
  }
  voice: {
    enabled: boolean
    speed: number
    readNonSpokenText: boolean
    voiceService: {
      type: VoiceServiceType
      voiceId: string
      emotion?: string
    }
  },
}

export const DEFAULT_BOT_SETTINGS: BotConfigSettings = {
  promptCompleterEndpoint: {
    type: PromptCompleterEndpointType.OOBABOOGA,
    genSettings: DEFAULT_OOBABOOGA_SETTINGS
  },
  promptStrategy: PromptStrategy.ALPACA,
  speechToTextEndpoint: {
    enabled: true,
    type: STTEndpointType.WHISPER
  },
  embeddingsService: EmbeddingsService.SBERT,
  text: {
    name: 'Anon',
    speed: 80,
    fontSize: 1
  },
  voice: {
    enabled: false,
    speed: 1,
    readNonSpokenText: false,
    voiceService: {
      type: VoiceServiceType.AZURE_TTS,
      voiceId: 'en-US-SaraNeural',
      emotion: 'whispering'
    }
  }
};