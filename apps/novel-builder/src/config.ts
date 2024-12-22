import {
  AssetType,
  dataURLtoFile,
  NovelV3,
  convertToWebP,
  getAssetLink,
  AssetDisplayPrefix,
  uploadAsset,
} from '@mikugg/bot-utils';
import { BackgroundResult, CharacterResult, listSearch, SearchType, SongResult } from './libs/listSearch';
import axios from 'axios';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VITE_ASSETS_UPLOAD_URL = import.meta.env.VITE_ASSETS_UPLOAD_URL || 'http://localhost:8585/asset-upload';

interface BuilderConfig {
  assetsEndpoint: string;
  assetsEndpointOptimized: string;
  uploadAssetEndpoint: string;
  platformAPIEndpoint: string;
  isPremiumUser: () => Promise<boolean>;
  genAssetLink: (asset: string, displayPrefix: AssetDisplayPrefix) => string;
  uploadAsset: (
    file: File | string,
    type: AssetType,
  ) => Promise<{
    success: boolean;
    assetId: string;
  }>;
  previewIframe: string;
  search: {
    characters: (query: { text: string; skip: number; take: number; onlyPrivate: boolean }) => Promise<{
      success: boolean;
      result: {
        public: NovelV3.NovelCharacter[];
        private: NovelV3.NovelCharacter[];
      };
    }>;

    backgrounds: (query: { text: string; skip: number; take: number; onlyPrivate: boolean }) => Promise<{
      success: boolean;
      result: {
        public: NovelV3.NovelBackground[];
        private: NovelV3.NovelBackground[];
      };
    }>;

    songs: (query: { text: string; skip: number; take: number; onlyPrivate: boolean }) => Promise<{
      success: boolean;
      result: {
        public: NovelV3.NovelSong[];
        private: NovelV3.NovelSong[];
      };
    }>;
  };
}

const configs: Map<'development' | 'staging' | 'production', BuilderConfig> = new Map([
  [
    'development',
    {
      assetsEndpoint: 'http://localhost:8585/s3/assets',
      assetsEndpointOptimized: 'http://localhost:8585/s3/assets',
      uploadAssetEndpoint: 'http://localhost:8585/asset-upload',
      platformAPIEndpoint: 'http://localhost:8080',
      isPremiumUser: async (): Promise<boolean> => {
        try {
          const result = await axios.get<{ id: string; tier: 'REGULAR' | 'PREMIUM' }>(`http://localhost:8080/user`, {
            withCredentials: true,
          });
          return !!(result.data.id && result.data.tier === 'PREMIUM');
        } catch (error) {
          console.error('Failed to check premium status:', error);
          return false;
        }
      },
      genAssetLink: (asset: string) => {
        if (asset.startsWith('data')) {
          return asset;
        } else {
          return `http://localhost:8585/s3/assets/${asset}`;
        }
      },
      uploadAsset: async (file: File | string, type) => {
        if (typeof file === 'string') {
          file = await dataURLtoFile(file, 'asset');
        }
        if (file.type.startsWith('image')) {
          file = new File([await convertToWebP(file)], 'asset.webp', { type: 'image/webp' });
        }

        const result = await uploadAsset(VITE_ASSETS_UPLOAD_URL, file, type);

        return {
          success: result.status === 200 || result.status === 201,
          assetId: result.data,
        };
      },
      previewIframe: 'http://localhost:5173',
      search: {
        characters: async (query) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return {
            success: true,
            result: {
              public: [],
              private: [],
            },
          };
        },
        backgrounds: async (query) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return {
            success: true,
            result: {
              public: [
                {
                  id: '1',
                  name: 'Background 1',
                  description: 'A background',
                  attributes: [['tag', 'value']],
                  source: {
                    jpg: 'QmRKvMSTVnQti536ZXqS6EkwwaZMMVRXZJXd3T5vv2BfoL.png',
                  },
                },
              ],
              private: [
                {
                  id: '2',
                  name: 'Background Relaxing, storytelling',
                  description:
                    'A background. relaxing, storytelling, fantasy, adventure, relaxing, storytelling, fantasy, adventure',
                  attributes: [['tag', 'value']],
                  source: {
                    jpg: 'QmRKvMSTVnQti536ZXqS6EkwwaZMMVRXZJXd3T5vv2BfoL.png',
                  },
                },
              ],
            },
          };
        },
        songs: async (query) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return {
            success: true,
            result: {
              public: [
                {
                  id: '3',
                  name: 'Song 3',
                  description: 'relaxing, storytelling, fantasy, adventure, relaxing, storytelling, fantasy, adventure',
                  tags: ['relaxing'],
                  source: 'QmfCftjWFfC9BohLrmYXuQCzWnv91qoAi64SJUPnxYJzes.mpeg',
                },
                {
                  id: '4',
                  name: 'Song 4',
                  description: 'relaxing',
                  tags: ['relaxing'],
                  source: 'QmfCftjWFfC9BohLrmYXuQCzWnv91qoAi64SJUPnxYJzes.mpeg',
                },
              ],
              private: [],
            },
          };
        },
      },
    },
  ],
  [
    'staging',
    {
      assetsEndpoint: 'https://assets.miku.gg',
      assetsEndpointOptimized: 'https://mikugg-assets.nyc3.digitaloceanspaces.com',
      uploadAssetEndpoint: 'https://apidev.miku.gg/asset/upload',
      platformAPIEndpoint: 'https://apidev.miku.gg',
      isPremiumUser: async (): Promise<boolean> => {
        try {
          const result = await axios.get<{ id: string; tier: 'REGULAR' | 'PREMIUM' }>(`https://apidev.miku.gg/user`, {
            withCredentials: true,
          });
          return !!(result.data.id && result.data.tier === 'PREMIUM');
        } catch (error) {
          console.error('Failed to check premium status:', error);
          return false;
        }
      },
      genAssetLink: (asset: string, displayPrefix?: AssetDisplayPrefix) => {
        if (asset.startsWith('data')) {
          return asset;
        } else {
          return getAssetLink(
            {
              optimized: 'https://mikugg-assets.nyc3.digitaloceanspaces.com',
              fallback: 'https://assets.miku.gg',
            },
            asset,
            displayPrefix || AssetDisplayPrefix.NOVEL_AD_VIDEO,
          );
        }
      },
      uploadAsset: async (file: File | string, type: AssetType) => {
        if (typeof file === 'string') {
          file = await dataURLtoFile(file, 'asset');
        }
        if (file.type.startsWith('image')) {
          file = new File([await convertToWebP(file)], 'asset.webp', { type: 'image/webp' });
        }

        const result = await uploadAsset(VITE_ASSETS_UPLOAD_URL, file, type);

        return {
          success: result.status === 200 || result.status === 201,
          assetId: result.data,
        };
      },
      previewIframe: 'https://alpha.miku.gg',
      search: {
        characters: async (query) => {
          const result = await listSearch<CharacterResult>('https://apidev.miku.gg', SearchType.CHARACTER, {
            search: query.text,
            take: query.take,
            skip: query.skip,
          });
          const publicCharacters = result
            .filter((character) => character.visibility === 'PUBLIC')
            .map((character) => JSON.parse(character.card) as NovelV3.NovelCharacter);
          const privateCharacters = result
            .filter((character) => character.visibility === 'PRIVATE')
            .map((character) => JSON.parse(character.card) as NovelV3.NovelCharacter);
          return {
            success: true,
            result: {
              public: publicCharacters,
              private: privateCharacters,
            },
          };
        },
        backgrounds: async (query) => {
          const result = await listSearch<BackgroundResult>('https://apidev.miku.gg', SearchType.BACKGROUND, {
            search: query.text,
            take: query.take,
            skip: query.skip,
          });
          return {
            success: true,
            result: {
              public: result
                .map((bg) => ({
                  id: bg.id,
                  name: bg.description.slice(0, 5) + '...',
                  description: bg.description,
                  attributes: [],
                  source: {
                    jpg: bg.asset,
                  },
                }))
                .filter((bg) => bg.id && bg.source),
              private: [],
            },
          };
        },
        songs: async (query) => {
          const result = await listSearch<SongResult>('https://apidev.miku.gg', SearchType.SONG, {
            search: query.text,
            take: query.take,
            skip: query.skip,
          });
          return {
            success: true,
            result: {
              public: result
                .map((song) => ({
                  id: song.id,
                  name: song.title,
                  description: song.description,
                  tags: song.tags || [],
                  source: song.asset,
                }))
                .filter((song) => song.id && song.source),
              private: [],
            },
          };
        },
      },
    },
  ],
  [
    'production',
    {
      assetsEndpoint: 'https://assets.miku.gg',
      assetsEndpointOptimized: 'https://mikugg-assets.nyc3.digitaloceanspaces.com',
      uploadAssetEndpoint: 'https://api.miku.gg/asset/upload',
      platformAPIEndpoint: 'https://api.miku.gg',
      isPremiumUser: async (): Promise<boolean> => {
        try {
          const result = await axios.get<{ id: string; tier: 'REGULAR' | 'PREMIUM' }>(`https://api.miku.gg/user`, {
            withCredentials: true,
          });
          return !!(result.data.id && result.data.tier === 'PREMIUM');
        } catch (error) {
          console.error('Failed to check premium status:', error);
          return false;
        }
      },
      genAssetLink: (asset: string, displayPrefix?: AssetDisplayPrefix) => {
        if (asset.startsWith('data')) {
          return asset;
        } else {
          return getAssetLink(
            {
              optimized: 'https://mikugg-assets.nyc3.digitaloceanspaces.com',
              fallback: 'https://assets.miku.gg',
            },
            asset,
            displayPrefix || AssetDisplayPrefix.NOVEL_AD_VIDEO,
          );
        }
      },
      uploadAsset: async (file: File | string, type) => {
        if (typeof file === 'string') {
          file = await dataURLtoFile(file, 'asset');
        }
        if (file.type.startsWith('image')) {
          file = new File([await convertToWebP(file)], 'asset.webp', { type: 'image/webp' });
        }

        const result = await uploadAsset(VITE_ASSETS_UPLOAD_URL, file, type);

        return {
          success: result.status === 200 || result.status === 201,
          assetId: result.data,
        };
      },
      previewIframe: 'https://interactor.miku.gg',
      search: {
        characters: async (query) => {
          const result = await listSearch<CharacterResult>('https://api.miku.gg', SearchType.CHARACTER, {
            search: query.text,
            take: query.take,
            skip: query.skip,
          });
          const publicCharacters = result
            .filter((character) => character.visibility === 'PUBLIC')
            .map((character) => JSON.parse(character.card) as NovelV3.NovelCharacter);
          const privateCharacters = result
            .filter((character) => character.visibility === 'PRIVATE')
            .map((character) => JSON.parse(character.card) as NovelV3.NovelCharacter);
          return {
            success: true,
            result: {
              public: publicCharacters,
              private: privateCharacters,
            },
          };
        },
        backgrounds: async (query) => {
          const result = await listSearch<BackgroundResult>('https://api.miku.gg', SearchType.BACKGROUND, {
            search: query.text,
            take: query.take,
            skip: query.skip,
          });
          return {
            success: true,
            result: {
              public: result
                .map((bg) => ({
                  id: bg.id,
                  name: bg.description.slice(0, 5) + '...',
                  description: bg.description,
                  attributes: [],
                  source: {
                    jpg: bg.asset,
                  },
                }))
                .filter((bg) => bg.id && bg.source),
              private: [],
            },
          };
        },
        songs: async (query) => {
          const result = await listSearch<SongResult>('https://api.miku.gg', SearchType.SONG, {
            search: query.text,
            take: query.take,
            skip: query.skip,
          });
          return {
            success: true,
            result: {
              public: result
                .map((song) => ({
                  id: song.id,
                  name: song.title,
                  description: song.description,
                  tags: song.tags || [],
                  source: song.asset,
                }))
                .filter((song) => song.id && song.source),
              private: [],
            },
          };
        },
      },
    },
  ],
]);

export const STAGE: 'development' | 'staging' | 'production' = import.meta.env.VITE_STAGE || 'development';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export default configs.get(STAGE)!;
