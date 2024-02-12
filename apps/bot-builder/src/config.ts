import { NovelBackground, NovelCharacter } from "./state/NovelFormState";

interface BuilderConfig {
  genAssetLink: (asset: string, lowres?: boolean) => string;
  uploadAsset: (file: File) => Promise<{
    success: boolean;
    assetId: string;
  }>;
  search: {
    characters: (query: {
      text: string;
      skip: number;
      take: number;
      onlyPrivate: boolean;
    }) => Promise<{
      success: boolean;
      result: {
        public: NovelCharacter[];
        private: NovelCharacter[];
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
        public: NovelBackground[];
        private: NovelBackground[];
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
        public: string[];
        private: string[];
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
          `https://assets.miku.gg/${lowres ? `480p_${asset}` : asset}`,
        uploadAsset: async (file: File) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return {
            success: true,
            assetId: "QmRKvMSTVnQti536ZXqS6EkwwaZMMVRXZJXd3T5vv2BfoL.png",
          };
        },
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
                public: [],
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
