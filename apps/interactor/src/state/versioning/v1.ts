export interface NarrationInteraction {
  id: string
  parentResponseId: string | null
  query: string
  sceneId: string
  responsesId: string[]
}

export interface NarrationResponse {
  id: string
  selected: boolean
  fetching: boolean
  parentInteractionId: string | null
  suggestedScenes: string[]
  characters: {
    [role: string]:
      | {
          emotion: string
          audio: string
          pose: string
          text: string
        }
      | undefined
  }
  childrenInteractions: {
    interactionId: string
    selected: boolean
  }[]
}

export interface NarrationState {
  id: string
  fetching: boolean
  currentResponseId: string
  input: {
    text: string
    suggestions: string[]
    disabled: boolean
  }
  interactions: {
    [id: string]: NarrationInteraction | undefined
  }
  responses: {
    [id: string]: NarrationResponse | undefined
  }
}

export interface NovelScene {
  id: string
  name: string
  prompt: string
  background: string
  music: string
  roles: {
    characterId: string
    role: string
  }[]
  children: string[]
}

export interface NovelCharacterOutfit {
  id: string
  name: string
  template: string
  emotions: {
    id: string
    source: string[]
    sound?: string
  }[]
}

export interface NovelCharacters {
  [id: string]:
    | {
        id: string
        name: string
        profile_pic: string
        outfits: {
          [outfit: string]: NovelCharacterOutfit | undefined
        }
        /** Role to outfit mapping */
        roles: {
          [role: string]: string | undefined
        }
      }
    | undefined
}
export interface NovelState {
  fetching: boolean
  title: string
  description: string
  characters: NovelCharacters
  scenes: NovelScene[]
  startSceneId: string
}

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

export const VersionId = 'v1'

export interface State {
  version: string
  settings: SettingsState
  narration: NarrationState
  novel: NovelState
}
