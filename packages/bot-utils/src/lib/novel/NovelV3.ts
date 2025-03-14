import { CharacterBook, EmotionTemplateSlug, MikuCardV2 } from '../MikuCardValidator';

export enum NovelNSFW {
  NONE = 0,
  NUDITY = 1,
  EXPLICIT = 2,
}

export interface NovelStart {
  id: string;
  sceneId: string;
  title?: string;
  description?: string;
  characters: {
    characterId: string;
    emotion: string;
    pose: string;
    text: string;
  }[];
}

export interface NovelScene {
  id: string;
  name: string;
  description?: string;
  prompt: string;
  actionText: string;
  condition: string | null;
  hint?: string;
  backgroundId: string;
  musicId: string;
  preventSceneGenerationSuggestion?: boolean;
  characters: {
    characterId: string;
    outfit: string;
    objective?: string;
  }[];
  children: string[];
  parentMapIds?: string[] | null;
  nsfw: NovelNSFW;
  lorebookIds?: string[];
  cutScene?: {
    id: string;
    triggerOnlyOnce: boolean;
    triggered?: boolean;
  };
  indicators?: NovelIndicator[];
}

export interface NovelCharacterOutfit {
  id: string;
  name: string;
  description: string;
  attributes: string[][];
  template: EmotionTemplateSlug;
  nsfw: NovelNSFW;
  emotions: {
    id: string;
    sources: {
      png: string;
      webm?: string;
      sound?: string;
    };
  }[];
}

export interface CutScenePart {
  id: string;
  text: {
    type: 'dialogue' | 'description';
    content: string;
  }[];
  background: string;
  music?: string;
  characters: { id: string; outfitId: string; emotionId: string }[];
}

export interface CutScene {
  id: string;
  name: string;
  parts: CutScenePart[];
}

export interface NovelCharacter {
  id: string;
  name: string;
  profile_pic: string;
  short_description: string;
  tags: string[];
  card: MikuCardV2;
  nsfw: NovelNSFW;
  lorebookIds?: string[];
}

export interface NovelBackground {
  id: string;
  name: string;
  description: string;
  attributes: string[][];
  source: {
    jpg: string;
    jpgMobile?: string;
    mp4?: string;
    mp4Mobile?: string;
  };
}

export interface NovelSong {
  id: string;
  name: string;
  description: string;
  tags: string[];
  source: string;
}

export interface NovelMap {
  id: string;
  name: string;
  description: string;
  source: {
    png: string;
    mp4?: string;
    music?: string;
  };
  places: {
    id: string;
    sceneId: string;
    name: string;
    description: string;
    previewSource: string;
    maskSource: string;
  }[];
}

export enum NovelActionType {
  // NOT DEFINABLE BY NOVEL
  ACHIEVEMENT_UNLOCK = 'ACHIEVEMENT_UNLOCK',

  // DEFINABLE BY NOVEL
  SUGGEST_ADVANCE_SCENE = 'SUGGEST_ADVANCE_SCENE',
  SUGGEST_CREATE_SCENE = 'SUGGEST_CREATE_SCENE',
  HIDE_ITEM = 'HIDE_ITEM',
  SHOW_ITEM = 'SHOW_ITEM',
  ADD_CHILD_SCENES = 'ADD_CHILD_SCENES',
}

export type NovelAction =
  | {
      type: NovelActionType.SUGGEST_ADVANCE_SCENE;
      params: {
        sceneId: string;
      };
    }
  | {
      type: NovelActionType.SUGGEST_CREATE_SCENE;
    }
  | {
      type: NovelActionType.ACHIEVEMENT_UNLOCK;
      params: {
        achievementId: string;
        reward: InventoryItem | null;
        collectibleImage?: string;
      };
    }
  | {
      type: NovelActionType.SHOW_ITEM;
      params: {
        itemId: string;
      };
    }
  | {
      type: NovelActionType.HIDE_ITEM;
      params: {
        itemId: string;
      };
    }
  | {
      type: NovelActionType.ADD_CHILD_SCENES;
      params: {
        sceneId: string;
        children: string[];
      };
    };

export type StateCondition = {
  type: 'IN_SCENE';
  config: {
    sceneIds: string[];
  };
};

export interface InventoryAction {
  name: string;
  prompt: string;

  // only for novel-specific items
  id?: string;
  usageCondition?: StateCondition;
  usageActions?: NovelAction[];
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPremium?: boolean;
  actions: InventoryAction[];
  isNovelOnly?: boolean;
  hidden?: boolean;
  locked?: StateCondition;
}

export interface NovelObjective {
  id: string;
  name: string;
  description?: string;
  stateCondition: StateCondition;
  condition: string;
  singleUse: boolean;
  actions: NovelAction[];
  hint?: string;
}

export interface NovelLorebook extends CharacterBook {
  id: string;
  isGlobal: boolean;
}

export interface NovelState {
  title: string;
  description: string;
  tags: string[];
  logoPic: string;
  author: string;
  language?: string;
  characters: NovelCharacter[];
  backgrounds: NovelBackground[];
  songs: NovelSong[];
  maps: NovelMap[];
  scenes: NovelScene[];
  cutscenes?: CutScene[];
  starts: NovelStart[];
  objectives?: NovelObjective[];
  lorebooks?: NovelLorebook[];
  inventory?: InventoryItem[];
  globalStartCutsceneId?: string;
  useModalForStartSelection?: boolean;
}

export interface NovelIndicator {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'amount' | 'discrete';
  values?: string[];
  initialValue: string;
  inferred: boolean;
  step?: number;
  min?: number;
  max?: number;
  hidden?: boolean;
  editable?: boolean;
  color?: string;
  persistent?: boolean;
}
