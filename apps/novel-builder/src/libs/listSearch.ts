import axios from 'axios';

export type Language = 'EN' | 'DE' | 'ES' | 'FR' | 'IT' | 'JP' | 'KO' | 'PL' | 'PT' | 'RU' | 'ZH' | 'CN';
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
  language: Language;
  nsfw: boolean;
  completelyNSFW?: boolean;
  author: {
    id: string;
    username: string;
    profilePic: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED' | 'REVIEW';
  unlistedMessage?: string;
  tags: string[];
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
  BACKGROUND_VECTORS = '/backgrounds/vector-search',
  SONG = '/songs',
  SONG_VECTOR = '/songs/vector-search',
}

export const listSearch = async <T extends BackgroundResult | CharacterResult | SongResult>(
  apiEndpont: string,
  searchType: T extends BackgroundResult
    ? SearchType.BACKGROUND | SearchType.BACKGROUND_VECTORS
    : T extends CharacterResult
    ? SearchType.CHARACTER
    : SearchType.SONG | SearchType.SONG_VECTOR,
  params: {
    search: string;
    take: number;
    skip: number;
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
