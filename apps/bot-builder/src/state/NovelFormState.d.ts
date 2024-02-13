import {
  CharacterBook,
  EmotionTemplateSlug,
  TavernCardV2,
} from "@mikugg/bot-utils";

export interface NovelStart {
  id: string;
  sceneId: string;
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
  backgroundId: string;
  musicId: string;
  characters: {
    characterId: string;
    outfit: string;
  }[];
  children: string[];
  parentMapId: string;
}

export interface NovelCharacterOutfit {
  id: string;
  name: string;
  description: string;
  attributes: string[][];
  template: EmotionTemplateSlug;
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
  card: TavernCardV2;
  outfits: NovelCharacterOutfit[];
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

export interface NovelFormState {
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
