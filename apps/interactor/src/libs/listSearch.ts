import axios from 'axios';

export interface BackgroundResult {
  id: string;
  description: string;
  asset: string;
  sdPrompt: string | null;
  sdModel: string | null;
  sdParams: string | null;
  author: {
    id: string;
    username: string;
    profilePic: string | null;
  };
  createdAt: Date;
  tags: string[];
}

export interface CharacterResult {
  id: string;
  name: string;
  description: string;
  card: string;
  profilePic: string;
  language: string;
  nsfw: boolean;
  author: {
    id: string;
    username: string;
    profilePic: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface PersonaResult {
  id: string;
  name: string;
  description: string | null;
  profilePic: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
  };
}

export interface SongResult {
  id: string;
  description: string;
  title: string;
  asset: string;
  tags: string[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum SearchType {
  CHARACTER = '/characters',
  BACKGROUND = '/backgrounds',
  BACKGROUND_VECTOR = '/backgrounds/vector-search',
  SONG = '/songs',
  SONG_VECTOR = '/songs/vector-search',
}

export const listSearch = async <T extends BackgroundResult | CharacterResult | SongResult>(
  apiEndpont: string,
  searchType: T extends BackgroundResult
    ? SearchType.BACKGROUND | SearchType.BACKGROUND_VECTOR
    : T extends CharacterResult
    ? SearchType.CHARACTER
    : SearchType.SONG | SearchType.SONG_VECTOR,
  params: {
    search: string;
    take: number;
    skip: number;
    languages?: string[];
    isApprovedForMobile?: boolean;
  },
): Promise<T[]> => {
  const response = await axios.get<T[]>(apiEndpont + searchType, {
    params,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
    },
  });
  // read as json
  return response.data;
};
