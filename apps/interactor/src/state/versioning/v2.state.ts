import { EmotionTemplateSlug, MikuCard } from '@mikugg/bot-utils'

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
  selectedRole: string | null
  characters: {
    role: string
    emotion: string
    pose: string
    text: string
    voices: {
      gpt_cond_latent: number[][];
      speaker_embedding: number[];
    };
  }[]
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
  template: EmotionTemplateSlug
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
        card: MikuCard
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

export interface SettingsState {
  model: ModelType
  user: {
    name: string
    isPremium: boolean
  }
  prompt: {
    systemPrompt: string
  }
  text: {
    speed: Speed
    fontSize: FontSize
    autoContinue: boolean
  }
  voice: {
    autoplay: boolean
    speed: Speed
  }
  music: {
    enabled: boolean
    volume: number
  }
  modals: {
    settings: boolean
    settingsTab: 'general' | 'prompt' | 'audio'
    about: boolean
    history: boolean
    edit: {
      opened: boolean
      id: string
    }
    deleteNodeConfirmation: {
      opened: boolean
      id: string
    }
  }
}

export const VersionId = 'v2'

export interface State {
  version: string
  settings: SettingsState
  narration: NarrationState
  novel: NovelState
}
