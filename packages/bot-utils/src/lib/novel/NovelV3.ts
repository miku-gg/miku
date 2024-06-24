import {
  CharacterBook,
  EmotionTemplateSlug,
  MikuCardV2,
} from "../MikuCardValidator";

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
  prompt: string;
  actionText: string;
  condition: string | null;
  backgroundId: string;
  musicId: string;
  characters: {
    characterId: string;
    outfit: string;
    objective?: string;
  }[];
  children: string[];
  parentMapIds?: string[] | null;
  nsfw: NovelNSFW;
  lorebookIds?: string[];
  sceneConditions?: SceneCondition[];
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
    webm?: string;
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
    webm?: string;
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
export interface SceneCondition {
  id: string;
  name: string;
  description: string;
  sceneId: string;
  conditionPrompt: string;
  mutationTrigger: StateMutation;
}

export type StateMutation =
  | {
      type: "ADD_CHILDREN";
      config: {
        sceneId: string;
        children: string[];
      };
    }
  | {
      type: "REMOVE_ITEM";
      config: {
        itemId: string;
      };
    }
  | {
      type: "SUGGEST_ADVANCE_SCENE";
      config: {
        sceneId: string;
      };
    }
  | {
      type: "ADD_ITEM";
      config: {
        item: InventoryItem;
      };
    };

export type StateCondition = {
  type: "IN_SCENE";
  config: {
    sceneIds: string[];
  };
};

export interface InventoryAction {
  name: string;
  prompt: string;

  // only for novel-specific items
  usageCondition?: StateCondition;
  usageMutations?: StateMutation[];
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPremium?: boolean;
  actions: InventoryAction[];
}

export enum NovelObjectiveActionType {
  SUGGEST_ADVANCE_SCENE = "SUGGEST_ADVANCE_SCENE",
  SUGGEST_CREATE_SCENE = "SUGGEST_CREATE_SCENE",
  ACHIEVEMENT_UNLOCK = "ACHIEVEMENT_UNLOCK",
  ITEM_RECEIVE = "ITEM_RECEIVE",
}

export type NovelObjectiveAction =
  | {
      type: NovelObjectiveActionType.SUGGEST_ADVANCE_SCENE;
      params: {
        sceneId: string;
      };
    }
  | {
      type: NovelObjectiveActionType.SUGGEST_CREATE_SCENE;
    }
  | {
      type: NovelObjectiveActionType.ACHIEVEMENT_UNLOCK;
      params: {
        achievementId: string;
        reward: InventoryItem | null;
      };
    }
  | {
      type: NovelObjectiveActionType.ITEM_RECEIVE;
      params: {
        item: InventoryItem;
      };
    };

export interface NovelObjective {
  id: string;
  name: string;
  description?: string;
  sceneIds: string[];
  condition: string;
  action: NovelObjectiveAction;
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
  characters: NovelCharacter[];
  backgrounds: NovelBackground[];
  songs: NovelSong[];
  maps: NovelMap[];
  scenes: NovelScene[];
  starts: NovelStart[];
  objectives?: NovelObjective[];
  lorebooks?: NovelLorebook[];
}
