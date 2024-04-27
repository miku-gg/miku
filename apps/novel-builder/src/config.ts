import { NovelV3, uploadAsset } from "@mikugg/bot-utils";
import {
  BackgroundResult,
  listSearch,
  SearchType,
  SongResult,
} from "./libs/listSearch";
import { API_ENDPOINT } from "./libs/utils";

async function dataURItoFile(dataURI: string, filename: string): Promise<File> {
  const response = await fetch(dataURI);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

async function fileToDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target) {
        resolve(e.target.result as string);
      } else {
        reject("Failed to read file");
      }
    };
    reader.readAsDataURL(file);
  });
}

interface BuilderConfig {
  genAssetLink: (asset: string, lowres?: boolean) => string;
  uploadAsset: (file: File | string) => Promise<{
    success: boolean;
    assetId: string;
  }>;
  previewIframe: string;
  search: {
    characters: (query: {
      text: string;
      skip: number;
      take: number;
      onlyPrivate: boolean;
    }) => Promise<{
      success: boolean;
      result: {
        public: NovelV3.NovelCharacter[];
        private: NovelV3.NovelCharacter[];
      };
    }>;

    backgrounds: (query: {
      text: string;
      skip: number;
      take: number;
      onlyPrivate: boolean;
    }) => Promise<{
      success: boolean;
      result: {
        public: NovelV3.NovelBackground[];
        private: NovelV3.NovelBackground[];
      };
    }>;

    songs: (query: {
      text: string;
      skip: number;
      take: number;
      onlyPrivate: boolean;
    }) => Promise<{
      success: boolean;
      result: {
        public: NovelV3.NovelSong[];
        private: NovelV3.NovelSong[];
      };
    }>;
  };
}

const configs: Map<"development" | "staging" | "production", BuilderConfig> =
  new Map([
    [
      "development",
      {
        genAssetLink: (asset: string, lowres?: boolean) => {
          if (asset.startsWith("data")) {
            return asset;
          } else {
            return `http://localhost:8585/s3/assets/${
              lowres ? `480p_${asset}` : asset
            }`;
          }
        },
        uploadAsset: async (file: File | string) => {
          if (typeof file === "string") {
            file = await dataURItoFile(file, "asset");
          }

          const result = await uploadAsset(
            "http://localhost:8585/asset-upload",
            file
          );

          return {
            success: !!result.fileName,
            assetId: result.fileName,
          };
        },
        previewIframe: "http://localhost:5173",
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
                    id: "1",
                    name: "Background 1",
                    description: "A background",
                    attributes: [["tag", "value"]],
                    source: {
                      jpg: "QmRKvMSTVnQti536ZXqS6EkwwaZMMVRXZJXd3T5vv2BfoL.png",
                    },
                  },
                ],
                private: [
                  {
                    id: "2",
                    name: "Background Relaxing, storytelling",
                    description:
                      "A background. relaxing, storytelling, fantasy, adventure, relaxing, storytelling, fantasy, adventure",
                    attributes: [["tag", "value"]],
                    source: {
                      jpg: "QmRKvMSTVnQti536ZXqS6EkwwaZMMVRXZJXd3T5vv2BfoL.png",
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
                    id: "3",
                    name: "Song 3",
                    description:
                      "relaxing, storytelling, fantasy, adventure, relaxing, storytelling, fantasy, adventure",
                    tags: ["relaxing"],
                    source:
                      "QmfCftjWFfC9BohLrmYXuQCzWnv91qoAi64SJUPnxYJzes.mpeg",
                  },
                  {
                    id: "4",
                    name: "Song 4",
                    description: "relaxing",
                    tags: ["relaxing"],
                    source:
                      "QmfCftjWFfC9BohLrmYXuQCzWnv91qoAi64SJUPnxYJzes.mpeg",
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
      "staging",
      {
        genAssetLink: (asset: string, lowres?: boolean) => {
          if (asset.startsWith("data")) {
            return asset;
          } else {
            return `https://assets.miku.gg/${lowres ? `480p_${asset}` : asset}`;
          }
        },
        uploadAsset: async (file: File | string) => {
          if (typeof file === "string") {
            file = await dataURItoFile(file, "asset");
          }

          const result = await uploadAsset(
            import.meta.env.VITE_ASSETS_UPLOAD_URL || "",
            file
          );

          return {
            success: !!result.fileName,
            assetId: result.fileName,
          };
        },
        previewIframe: "https://alpha.miku.gg",
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
            const result = await listSearch<BackgroundResult>(
              "https://apidev.miku.gg",
              SearchType.BACKGROUND,
              {
                search: query.text,
                take: query.take,
                skip: query.skip,
              }
            );
            return {
              success: true,
              result: {
                public: result
                  .map((bg) => ({
                    id: bg.id,
                    name: bg.description.slice(0, 5) + "...",
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
            const result = await listSearch<SongResult>(
              "https://apidev.miku.gg",
              SearchType.SONG,
              {
                search: query.text,
                take: query.take,
                skip: query.skip,
              }
            );
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
      "production",
      {
        genAssetLink: (asset: string, lowres?: boolean) => {
          if (asset.startsWith("data")) {
            return asset;
          } else {
            return `https://assets.miku.gg/${lowres ? `480p_${asset}` : asset}`;
          }
        },
        uploadAsset: async (file: File | string) => {
          if (typeof file === "string") {
            file = await dataURItoFile(file, "asset");
          }

          const result = await uploadAsset(
            import.meta.env.VITE_ASSETS_UPLOAD_URL || "",
            file
          );

          return {
            success: !!result.fileName,
            assetId: result.fileName,
          };
        },
        previewIframe: "https://interactor.miku.gg",
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
            const result = await listSearch<BackgroundResult>(
              "https://api.miku.gg",
              SearchType.BACKGROUND,
              {
                search: query.text,
                take: query.take,
                skip: query.skip,
              }
            );
            return {
              success: true,
              result: {
                public: result
                  .map((bg) => ({
                    id: bg.id,
                    name: bg.description.slice(0, 5) + "...",
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
            const result = await listSearch<SongResult>(
              "https://api.miku.gg",
              SearchType.SONG,
              {
                search: query.text,
                take: query.take,
                skip: query.skip,
              }
            );
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

export const STAGE: "development" | "staging" | "production" =
  import.meta.env.VITE_STAGE || "development";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export default configs.get(STAGE)!;
