import {
  MikuCard,
  MikuCardV2,
  TavernCardV2,
  hashBase64URI,
} from "@mikugg/bot-utils";
import { NovelFormState } from "../state/NovelFormState";

const randomString = (length = 32) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const replaceStringsInObject = (
  obj: any,
  find: string,
  replace: string
): any => {
  return JSON.parse(
    JSON.stringify(obj).replace(new RegExp(find, "g"), replace)
  );
};

const tavernCardV2ToMikuCard = (json: TavernCardV2): MikuCard => {
  const default_scenario_id = "default_scene";
  return {
    spec: "chara_card_v2",
    spec_version: "2.0",
    data: {
      name: String(json.data.name) || "",
      description: String(json.data.description) || "",
      first_mes: String(json.data.first_mes) || "",
      personality: String(json.data.personality) || "",
      mes_example: String(json.data.mes_example) || "",
      scenario: String(json.data.scenario),
      alternate_greetings: [
        ...(json.data.alternate_greetings || []).map(
          (greeting) => String(greeting) || ""
        ),
      ],
      system_prompt: String(json.data.system_prompt) || "",
      post_history_instructions:
        String(json.data.post_history_instructions) || "",
      creator: String(json.data.creator) || "",
      character_version: String(json.data.character_version) || "",
      tags: [...(json.data.tags || []).map((tag) => String(tag) || "")],
      creator_notes: String(json.data.creator_notes) || "",
      character_book: json.data.character_book
        ? {
            ...json.data.character_book,
            name: String(json.data.character_book.name) || "",
            description: String(json.data.character_book.description) || "",
            scan_depth: Number(json.data.character_book.scan_depth) || 0,
            token_budget: Number(json.data.character_book.token_budget) || 0,
            recursive_scanning:
              Boolean(json.data.character_book.recursive_scanning) || false,
            entries: json.data.character_book.entries.map((entry) => ({
              ...entry,
              keys: entry.keys.map((key) => String(key) || ""),
              content: String(entry.content) || "",
              enabled: Boolean(entry.enabled) || false,
              insertion_order: Number(entry.insertion_order) || 0,
            })),
          }
        : undefined,
      extensions: {
        ...(json.data.extensions || {}),
        mikugg: {
          ...(json.data.extensions?.mikugg || {}),
          license: json.data.extensions?.mikugg?.license || "CC BY",
          language: json.data.extensions?.mikugg?.language || "en",
          profile_pic: json.data.extensions?.mikugg?.profile_pic || "",
          short_description:
            json.data.extensions?.mikugg?.short_description || "",
          start_scenario:
            json.data.extensions?.mikugg?.start_scenario ||
            json.data.extensions?.mikugg?.scenarios?.length
              ? json.data.extensions?.mikugg?.scenarios[0].id
              : default_scenario_id,
          scenarios: json.data.extensions?.mikugg?.scenarios?.length
            ? json.data.extensions?.mikugg?.scenarios?.map(
                // eslint-disable-next-line
                // @ts-ignore
                (scenario) => ({
                  ...scenario,
                  name: String(scenario.name) || "",
                  children_scenarios: scenario.children_scenarios.map(
                    // eslint-disable-next-line
                    // @ts-ignore
                    (child) => String(child) || ""
                  ),
                  context: String(scenario.context) || "",
                  trigger_suggestion_similarity:
                    String(scenario.trigger_suggestion_similarity) || "",
                  trigger_action: String(scenario.trigger_action) || "",
                  background: String(scenario.background) || "",
                  emotion_group: String(scenario.emotion_group) || "",
                  voice: String(scenario.voice) || "",
                })
              )
            : [
                {
                  id: default_scenario_id,
                  name: "scenario-1",
                  children_scenarios: [],
                  context: "",
                  trigger_suggestion_similarity: "",
                  trigger_action: "",
                  background: "",
                  emotion_group: "",
                  voice: "",
                },
              ],
          emotion_groups:
            // eslint-disable-next-line
            // @ts-ignore
            json.data.extensions?.mikugg?.emotion_groups?.map((group) => ({
              ...group,
              emotions:
                // eslint-disable-next-line
                // @ts-ignore
                group.emotions.map((emotion) => ({
                  ...emotion,
                  // eslint-disable-next-line
                  // @ts-ignore
                  source: emotion.source.map((src) => String(src) || ""),
                })) || [],
            })) || [],
          backgrounds:
            // eslint-disable-next-line
            // @ts-ignore
            json.data.extensions?.mikugg?.backgrounds?.map((bg) => ({
              ...bg,
              description: String(bg.description) || "",
              source: String(bg.source) || "",
            })) || [],
          voices: json.data.extensions?.mikugg?.voices
            ? // eslint-disable-next-line
              // @ts-ignore
              json.data.extensions?.mikugg?.voices?.map((voice) => ({
                ...voice,
                id: String(voice.id) || "",
                provider: String(voice.provider) || "",
                provider_voice_id: String(voice.provider_voice_id) || "",
                provider_emotion: voice.provider_emotion
                  ? String(voice.provider_emotion)
                  : undefined,
                training_sample: voice.training_sample
                  ? String(voice.training_sample)
                  : undefined,
              }))
            : [
                {
                  id: "azure_tts.en-GB-SoniaNeural",
                  provider: "azure_tts",
                  provider_voice_id: "en-GB-SoniaNeural",
                  provider_emotion: "sad",
                },
              ],
        },
      },
    },
  };
};
export const mikuCardToMikuCardV2 = (mikuCard: MikuCard): MikuCardV2 => {
  const {
    extensions: { mikugg },
  } = mikuCard.data;

  const outfits: MikuCardV2["data"]["extensions"]["mikugg_v2"]["outfits"] =
    mikugg.emotion_groups.map((group) => ({
      id: group.id,
      template: group.template,
      name: group.name,
      description: group.name,
      attributes: [],
      nsfw: group.template === "lewd-emotions" ? 1 : 0,
      emotions: group.emotions.map((emotion) => ({
        id: emotion.id,
        sources: {
          png: emotion.source[0], // Assuming first source is png
          webm: emotion.source.length > 1 ? emotion.source[1] : undefined, // Assuming second source, if exists, is webm
          sound: emotion.sound,
        },
      })),
    }));

  // Construct the new MikuCardV2 format
  return {
    ...mikuCard, // Copy over existing structure
    data: {
      ...mikuCard.data,
      extensions: {
        mikugg_v2: {
          license: mikugg.license,
          language: mikugg.language,
          short_description: mikugg.short_description,
          profile_pic: mikugg.profile_pic,
          nsfw: 0, // Assuming default as no information provided
          outfits,
        },
      },
    },
  };
};

export const tavernCardToMikuCardV2 = (
  tavernCard: TavernCardV2
): MikuCardV2 => {
  return mikuCardToMikuCardV2(tavernCardV2ToMikuCard(tavernCard));
};

export const tavernCardToNovelState = (card: TavernCardV2): NovelFormState => {
  let oldMikuCard: MikuCard | null = null;
  let cardV2: MikuCardV2 | null = null;
  if (card.data.extensions.mikugg) {
    oldMikuCard = card as MikuCard;
    cardV2 = mikuCardToMikuCardV2(oldMikuCard);
  } else if (card.data.extensions.mikugg_v2) {
    oldMikuCard = null;
    cardV2 = card as MikuCardV2;
  } else {
    oldMikuCard = tavernCardV2ToMikuCard(card);
    cardV2 = mikuCardToMikuCardV2(oldMikuCard);
  }

  const mikugg = oldMikuCard?.data.extensions.mikugg;
  const mikugg_v2 = cardV2?.data.extensions.mikugg_v2;

  const defaultCharacterId = randomString();

  return {
    author: cardV2.data.creator,
    backgrounds: mikugg?.backgrounds.map((bg, index) => ({
      name: `background ${index + 1}`,
      id: bg.id,
      attributes: [],
      description: bg.description,
      source: {
        jpg: bg.source,
      },
    })) || [
      {
        name: "Default Background",
        id: "default-background",
        attributes: [],
        description: "",
        source: {
          jpg: "default_background.jpg",
        },
      },
    ],
    description: mikugg_v2.short_description || "",
    logoPic: mikugg_v2.profile_pic,
    maps: [],
    characters: [
      {
        id: defaultCharacterId,
        name: cardV2.data.name,
        profile_pic: mikugg_v2.profile_pic,
        nsfw: 0,
        short_description: mikugg_v2.short_description,
        tags: cardV2.data.tags,
        card: cardV2,
      },
    ],
    songs: mikugg?.sounds?.map((sound, index) => ({
      id: sound.id,
      name: `sound ${index + 1}`,
      description: sound.name,
      tags: [],
      source: sound.source,
    })) || [
      {
        id: "default-music",
        name: "Default Music",
        description: "",
        tags: [],
        source: "default_music.mp3",
      },
    ],
    title: cardV2.data.name,
    tags: cardV2.data.tags,
    starts: [
      {
        id: randomString(),
        title: "Default Start",
        description: "",
        characters: [
          {
            characterId: defaultCharacterId,
            text: cardV2.data.first_mes,
            pose: "standing",
            emotion: "happy",
          },
        ],
        sceneId: mikugg?.start_scenario || "default-scenario",
      },
    ],
    scenes: mikugg?.scenarios.map((scenario, index) => ({
      id: scenario.id,
      backgroundId: scenario.background,
      actionText: scenario.trigger_action,
      name: scenario.name,
      condition: "",
      nsfw: 0,
      characters: [
        {
          characterId: defaultCharacterId,
          outfit: scenario.emotion_group,
        },
      ],
      children: scenario.children_scenarios,
      musicId: scenario.music || "",
      prompt: scenario.context,
      parentMapId: null,
    })) || [
      {
        id: "default-scenario",
        backgroundId: "default-background",
        actionText: "",
        name: "Default Scenario",
        condition: "",
        nsfw: 0,
        characters: [
          {
            characterId: defaultCharacterId,
            outfit: "default-outfit",
          },
        ],
        children: [],
        musicId: "default-music",
        prompt: "",
        parentMapId: null,
      },
    ],
  };
};

export const migrateNovelV2ToV3 = (novel: NovelFormState): NovelFormState => {
  return novel;
};

export const migrateNovelV1ToV2 = (novel: NovelFormState): NovelFormState => {
  return novel;
};

export const inputToNovelState = (
  input: any
): { version: "v3"; novel: NovelFormState } => {
  if (input?.novel) {
    if (input.version === "v3") {
      return {
        version: "v3",
        novel: input.novel,
      };
    } else if (input.version === "v2") {
      return {
        version: "v3",
        novel: migrateNovelV2ToV3(input.novel),
      };
    } else if (input.version === "v1") {
      return {
        version: "v3",
        novel: migrateNovelV1ToV2(migrateNovelV2ToV3(input.novel)),
      };
    } else {
      throw new Error(`Unknown file: version ${input.version}`);
    }
  } else if (input?.spec === "chara_card_v2") {
    return {
      version: "v3",
      novel: tavernCardToNovelState(input as TavernCardV2),
    };
  } else {
    throw new Error(`Unknown file`);
  }
};

const isDataUri = (string: string): boolean => {
  return /^data:/.test(string);
};

export const extractNovelAssets = async (
  novel: NovelFormState
): Promise<{
  novel: NovelFormState;
  assets: {
    images: Map<string, string>;
    audios: Map<string, string>;
    videos: Map<string, string>;
  };
}> => {
  const images = new Map<string, string>();
  const audios = new Map<string, string>();
  const videos = new Map<string, string>();

  // Process backgrounds
  for (const background of novel.backgrounds) {
    if (background.source.jpg.startsWith("data:")) {
      const bgHashJpg = await hashBase64URI(background.source.jpg);
      images.set(bgHashJpg, background.source.jpg);
      background.source.jpg = bgHashJpg;
    }
    if (background.source.webm?.startsWith("data:")) {
      const bgHashWebm = await hashBase64URI(background.source.webm);
      videos.set(bgHashWebm, background.source.webm);
      background.source.webm = bgHashWebm;
    }
  }

  // Process songs
  for (const song of novel.songs) {
    if (song.source.startsWith("data:")) {
      const songHash = await hashBase64URI(song.source);
      audios.set(songHash, song.source);
      song.source = songHash;
    }
  }

  // Process maps (including places within maps)
  for (const map of novel.maps) {
    if (map.source.png.startsWith("data:")) {
      const mapHashPng = await hashBase64URI(map.source.png);
      images.set(mapHashPng, map.source.png);
      map.source.png = mapHashPng;
    }
    if (map.source.webm?.startsWith("data:")) {
      const mapHashWebm = await hashBase64URI(map.source.webm);
      videos.set(mapHashWebm, map.source.webm);
      map.source.webm = mapHashWebm;
    }
    if (map.source.music?.startsWith("data:")) {
      const mapMusicHash = await hashBase64URI(map.source.music);
      audios.set(mapMusicHash, map.source.music);
      map.source.music = mapMusicHash;
    }

    for (const place of map.places) {
      if (place.previewSource.startsWith("data:")) {
        const placePreviewHash = await hashBase64URI(place.previewSource);
        images.set(placePreviewHash, place.previewSource);
        place.previewSource = placePreviewHash;
      }
      if (place.maskSource.startsWith("data:")) {
        const placeMaskHash = await hashBase64URI(place.maskSource);
        images.set(placeMaskHash, place.maskSource);
        place.maskSource = placeMaskHash;
      }
    }
  }

  // process logoPic
  if (isDataUri(novel.logoPic)) {
    const logoPicHash = await hashBase64URI(novel.logoPic);
    images.set(logoPicHash, novel.logoPic);
    novel.logoPic = logoPicHash;
  }

  // process characters
  for (const character of novel.characters) {
    if (isDataUri(character.profile_pic)) {
      const profilePicHash = await hashBase64URI(character.profile_pic);
      images.set(profilePicHash, character.profile_pic);
      character.profile_pic = profilePicHash;
    }

    if (
      character.card.data.extensions.mikugg_v2.profile_pic.startsWith("data:")
    ) {
      const profilePicHash = await hashBase64URI(
        character.card.data.extensions.mikugg_v2.profile_pic
      );
      images.set(
        profilePicHash,
        character.card.data.extensions.mikugg_v2.profile_pic
      );
      character.card.data.extensions.mikugg_v2.profile_pic = profilePicHash;
    }

    // process character outfits
    for (const outfit of character.card.data.extensions.mikugg_v2.outfits) {
      for (const emotion of outfit.emotions) {
        if (isDataUri(emotion.sources.png)) {
          const emotionPngHash = await hashBase64URI(emotion.sources.png);
          images.set(emotionPngHash, emotion.sources.png);
          emotion.sources.png = emotionPngHash;
        }
        if (emotion.sources.webm && isDataUri(emotion.sources.webm)) {
          const emotionWebmHash = await hashBase64URI(emotion.sources.webm);
          videos.set(emotionWebmHash, emotion.sources.webm);
          emotion.sources.webm = emotionWebmHash;
        }
        if (emotion.sources.sound && isDataUri(emotion.sources.sound)) {
          const emotionSoundHash = await hashBase64URI(emotion.sources.sound);
          audios.set(emotionSoundHash, emotion.sources.sound);
          emotion.sources.sound = emotionSoundHash;
        }
      }
    }
  }

  return {
    novel,
    assets: {
      images,
      audios,
      videos,
    },
  };
};

const ONE_MB = 1024 * 1024;

export enum ErrorImportType {
  ASSET_TOO_LARGE = "ASSET_TOO_LARGE",
  UPLOAD_FAILED = "UPLOAD_FAILED",
}

export const importAndReplaceNovelStateAssets = async (
  novel: NovelFormState,
  options: {
    uploadAsset: (
      dataString: string
    ) => Promise<{ success: boolean; assetId: string }>;
    onUpdate: (value: {
      progress: number;
      total: number;
      bytes: number;
    }) => void;
    onError: (error: ErrorImportType, message?: string) => void;
    uploadBatchSize: number;
  }
): Promise<NovelFormState> => {
  const {
    novel: novelWithReplacedAssets,
    assets: { images, audios, videos },
  } = await extractNovelAssets(novel);
  // CHECK IF SOME AUDIO IS MORE THAN 20MB
  const bigAudio = Array.from(audios.entries()).find(
    ([_, audio]) => audio.length > 20 * ONE_MB
  );

  if (bigAudio) {
    options.onError(
      ErrorImportType.ASSET_TOO_LARGE,
      `Audio ${bigAudio[0]} is too large`
    );
  }

  // check big image
  const bigImage = Array.from(images.entries()).find(
    ([_, image]) => image.length > 20 * ONE_MB
  );

  if (bigImage) {
    options.onError(
      ErrorImportType.ASSET_TOO_LARGE,
      `Image ${bigImage[0]} is too large`
    );
  }

  // check big video

  const bigVideo = Array.from(videos.entries()).find(
    ([_, video]) => video.length > 20 * ONE_MB
  );

  if (bigVideo) {
    options.onError(
      ErrorImportType.ASSET_TOO_LARGE,
      `Video ${bigVideo[0]} is too large`
    );
  }

  const assets = new Map([...images, ...audios, ...videos]);
  const total = assets.size + 1;
  let progress = 0;
  let bytes = 0;

  options.onUpdate({ progress, total, bytes });

  async function uploadAssetBatch(
    batch: string[]
  ): Promise<{ find: string; replace: string }[]> {
    return Promise.all(
      batch.map(async (asset) => {
        try {
          const result = await options.uploadAsset(assets.get(asset)!);
          options.onUpdate({
            progress: ++progress,
            total,
            bytes: (bytes = bytes + assets.get(asset)!.length),
          });
          if (!result.success) {
            options.onError(
              ErrorImportType.UPLOAD_FAILED,
              `Asset ${asset} upload failed.`
            );
          }
          return { find: asset, replace: result.assetId || "" };
        } catch (error) {
          options.onError(
            ErrorImportType.UPLOAD_FAILED,
            `Asset ${asset} upload failed.`
          );
          progress++;
          return { find: asset, replace: "" };
        }
      })
    );
  }

  async function uploadAssetsInBatches() {
    const assetKeys = Array.from(assets.keys());
    const batches: {
      find: string;
      replace: string;
    }[][] = [];

    for (let i = 0; i < assetKeys.length; i += options.uploadBatchSize) {
      const batch = assetKeys.slice(i, i + options.uploadBatchSize);
      batches.push(await uploadAssetBatch(batch));
    }

    return batches.flat();
  }

  const hashes = await uploadAssetsInBatches();
  console.log(hashes);
  let novelResult = novelWithReplacedAssets;
  hashes.forEach(({ find, replace }) => {
    novelResult = replaceStringsInObject(novelResult, find, replace);
  });

  return novelResult;
};
