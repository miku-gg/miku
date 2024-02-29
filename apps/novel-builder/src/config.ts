import { NovelV3, uploadAsset } from "@mikugg/bot-utils";

async function dataURItoFile(dataURI: string, filename: string): Promise<File> {
  const response = await fetch(dataURI);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
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

const configs: Map<"development" | "stating" | "production", BuilderConfig> =
  new Map([
    [
      "development",
      {
        genAssetLink: (asset: string, lowres?: boolean) =>
          `http://localhost:8585/s3/assets/${lowres ? `480p_${asset}` : asset}`,
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
                    name: "Background 2",
                    description: "A background",
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
                    description: "relaxing",
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
  ]);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export default configs.get("development")!;
