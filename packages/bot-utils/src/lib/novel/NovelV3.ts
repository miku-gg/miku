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
  parentMapId: string | null;
  nsfw: NovelNSFW;
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
  lorebook?: CharacterBook;
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
}