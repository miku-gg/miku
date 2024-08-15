import { EmotionTemplateSlug, MikuCard } from '../MikuCardValidator';

export interface NovelScene {
  id: string;
  name: string;
  prompt: string;
  background: string;
  music: string;
  roles: {
    characterId: string;
    role: string;
  }[];
  children: string[];
}

export interface NovelCharacterOutfit {
  id: string;
  name: string;
  template: EmotionTemplateSlug;
  emotions: {
    id: string;
    source: string[];
    sound?: string;
  }[];
}

export interface NovelCharacters {
  [id: string]:
    | {
        id: string;
        name: string;
        profile_pic: string;
        card: MikuCard;
        outfits: {
          [outfit: string]: NovelCharacterOutfit | undefined;
        };
        /** Role to outfit mapping */
        roles: {
          [role: string]: string | undefined;
        };
      }
    | undefined;
}
export interface NovelState {
  fetching: boolean;
  title: string;
  description: string;
  characters: NovelCharacters;
  scenes: NovelScene[];
  startSceneId: string;
}
