import { MikuCard, MikuCardV2, TavernCardV2 } from "../MikuCardValidator";
import {
  hashBase64URI,
  mikuCardToMikuCardV2,
  tavernCardV2ToMikuCard,
} from "../MikuCardUtils";
import * as NovelV3 from "./NovelV3";
import * as NovelV2 from "./_deprecated.NovelV2";

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

export const tavernCardToMikuCardV2 = (
  tavernCard: TavernCardV2
): MikuCardV2 => {
  return mikuCardToMikuCardV2(tavernCardV2ToMikuCard(tavernCard));
};

export const tavernCardToNovelState = (
  card: TavernCardV2
): NovelV3.NovelState => {
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
        sceneId: mikugg?.start_scenario || "",
      },
    ],
    scenes: mikugg?.scenarios.map((scenario, index) => ({
      id: scenario.id || "",
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

export const migrateNovelV2ToV3 = (
  novel: NovelV2.NovelState
): NovelV3.NovelState => {
  const _characters = Object.values(novel.characters);
  const firstCharacter = _characters[0] || null;
  const novelV3: NovelV3.NovelState = {
    title: novel.title,
    description: novel.description,
    tags: [],
    logoPic: firstCharacter?.profile_pic || "",
    author: firstCharacter?.card.data.creator || "",
    characters: _characters
      .map((character) => {
        if (!character) return undefined;
        return {
          id: character.id,
          name: character.name,
          profile_pic: character.profile_pic,
          short_description:
            character.card.data.extensions.mikugg.short_description,
          tags: character.card.data.tags,
          card: mikuCardToMikuCardV2(character.card),
          nsfw: NovelV3.NovelNSFW.NONE,
        };
      })
      .filter(Boolean) as NovelV3.NovelCharacter[],
    backgrounds: novel.scenes.map((scene) => ({
      id: scene.background,
      name: "",
      description: "",
      attributes: [],
      source: {
        jpg: scene.background,
      },
    })),
    songs: [],
    maps: [],
    scenes: novel.scenes.map((scene) => ({
      id: scene.id,
      actionText: "",
      condition: "",
      children: scene.children,
      name: scene.name,
      parentMapId: null,
      prompt: scene.prompt,
      characters: scene.roles.map(({ role, characterId }) => ({
        characterId: characterId,
        outfit:
          _characters.find((c) => c?.roles[role] === characterId)?.roles[
            role
          ] || "",
      })),
      backgroundId: scene.background,
      musicId: "",
      nsfw: NovelV3.NovelNSFW.NONE,
    })),
    starts: [],
  };
  return novelV3;
};

export const migrateNovelV1ToV2 = (
  novel: NovelV3.NovelState
): NovelV3.NovelState => {
  return novel;
};

export const inputToNovelState = (
  input: any
): { version: "v3"; novel: NovelV3.NovelState } => {
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
  novel: NovelV3.NovelState
): Promise<{
  novel: NovelV3.NovelState;
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
    } else {
      images.set(background.source.jpg, background.source.jpg);
    }
    if (background.source.webm?.startsWith("data:")) {
      const bgHashWebm = await hashBase64URI(background.source.webm);
      videos.set(bgHashWebm, background.source.webm);
      background.source.webm = bgHashWebm;
    } else if (background.source.webm) {
      videos.set(background.source.webm, background.source.webm);
    }
  }

  // Process songs
  for (const song of novel.songs) {
    if (song.source.startsWith("data:")) {
      const songHash = await hashBase64URI(song.source);
      audios.set(songHash, song.source);
      song.source = songHash;
    } else {
      audios.set(song.source, song.source);
    }
  }

  // Process maps (including places within maps)
  for (const map of novel.maps) {
    if (map.source.png.startsWith("data:")) {
      const mapHashPng = await hashBase64URI(map.source.png);
      images.set(mapHashPng, map.source.png);
      map.source.png = mapHashPng;
    } else {
      images.set(map.source.png, map.source.png);
    }
    if (map.source.webm?.startsWith("data:")) {
      const mapHashWebm = await hashBase64URI(map.source.webm);
      videos.set(mapHashWebm, map.source.webm);
      map.source.webm = mapHashWebm;
    } else if (map.source.webm) {
      videos.set(map.source.webm, map.source.webm);
    }
    if (map.source.music?.startsWith("data:")) {
      const mapMusicHash = await hashBase64URI(map.source.music);
      audios.set(mapMusicHash, map.source.music);
      map.source.music = mapMusicHash;
    } else if (map.source.music) {
      audios.set(map.source.music, map.source.music);
    }

    for (const place of map.places) {
      if (place.previewSource.startsWith("data:")) {
        const placePreviewHash = await hashBase64URI(place.previewSource);
        images.set(placePreviewHash, place.previewSource);
        place.previewSource = placePreviewHash;
      } else {
        images.set(place.previewSource, place.previewSource);
      }
      if (place.maskSource.startsWith("data:")) {
        const placeMaskHash = await hashBase64URI(place.maskSource);
        images.set(placeMaskHash, place.maskSource);
        place.maskSource = placeMaskHash;
      } else if (place.maskSource) {
        images.set(place.maskSource, place.maskSource);
      }
    }
  }

  // process logoPic
  if (isDataUri(novel.logoPic)) {
    const logoPicHash = await hashBase64URI(novel.logoPic);
    images.set(logoPicHash, novel.logoPic);
    novel.logoPic = logoPicHash;
  } else {
    images.set(novel.logoPic, novel.logoPic);
  }

  // process characters
  for (const character of novel.characters) {
    if (isDataUri(character.profile_pic)) {
      const profilePicHash = await hashBase64URI(character.profile_pic);
      images.set(profilePicHash, character.profile_pic);
      character.profile_pic = profilePicHash;
    } else {
      images.set(character.profile_pic, character.profile_pic);
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
    } else {
      images.set(
        character.card.data.extensions.mikugg_v2.profile_pic,
        character.card.data.extensions.mikugg_v2.profile_pic
      );
    }

    // process character outfits
    for (const outfit of character.card.data.extensions.mikugg_v2.outfits) {
      for (const emotion of outfit.emotions) {
        if (isDataUri(emotion.sources.png)) {
          const emotionPngHash = await hashBase64URI(emotion.sources.png);
          images.set(emotionPngHash, emotion.sources.png);
          emotion.sources.png = emotionPngHash;
        } else {
          images.set(emotion.sources.png, emotion.sources.png);
        }
        if (emotion.sources.webm && isDataUri(emotion.sources.webm)) {
          const emotionWebmHash = await hashBase64URI(emotion.sources.webm);
          videos.set(emotionWebmHash, emotion.sources.webm);
          emotion.sources.webm = emotionWebmHash;
        } else if (emotion.sources.webm) {
          videos.set(emotion.sources.webm, emotion.sources.webm);
        }
        if (emotion.sources.sound && isDataUri(emotion.sources.sound)) {
          const emotionSoundHash = await hashBase64URI(emotion.sources.sound);
          audios.set(emotionSoundHash, emotion.sources.sound);
          emotion.sources.sound = emotionSoundHash;
        } else if (emotion.sources.sound) {
          audios.set(emotion.sources.sound, emotion.sources.sound);
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
  novel: NovelV3.NovelState,
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
): Promise<NovelV3.NovelState> => {
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
  let novelResult = novelWithReplacedAssets;
  hashes.forEach(({ find, replace }) => {
    novelResult = replaceStringsInObject(novelResult, find, replace);
  });

  return novelResult;
};

export enum NovelValidationTargetType {
  SCENE,
  CHARACTER,
  OUTFIT,
  SONG,
  BACKGROUND,
  START,
  MAP,
}
export interface NovelValidation {
  targetType: NovelValidationTargetType;
  targetId: string;
  severity: "error" | "warning";
  message: string;
}

export function validateNovelState(
  novel: NovelV3.NovelState
): NovelValidation[] {
  const errors: NovelValidation[] = [];

  // Validate scene IDs in starts
  novel.starts.forEach((start) => {
    const startScene = novel.scenes.find((scene) => scene.id === start.sceneId);
    if (!startScene) {
      errors.push({
        targetType: NovelValidationTargetType.START,
        severity: "error",
        targetId: start.id,
        message: `Scene ${start.sceneId} not found`,
      });
    } else {
      // check if characters are in the scene
      start.characters.forEach((character) => {
        if (
          !startScene.characters.some(
            (sceneCharacter) =>
              sceneCharacter.characterId === character.characterId
          )
        ) {
          errors.push({
            targetType: NovelValidationTargetType.START,
            severity: "error",
            targetId: start.id,
            message: `Character ${character.characterId} not found in scene ${start.sceneId}`,
          });
        }
      });
    }

    // Validate character IDs in starts
    start.characters.forEach((character) => {
      if (!novel.characters.some((c) => c.id === character.characterId)) {
        errors.push({
          targetType: NovelValidationTargetType.START,
          severity: "error",
          targetId: start.id,
          message: `Character ${character.characterId} not found`,
        });
      }
    });
  });

  novel.scenes.forEach((scene) => {
    // validate background ids
    if (!novel.backgrounds.some((bg) => bg.id === scene.backgroundId)) {
      errors.push({
        targetType: NovelValidationTargetType.SCENE,
        targetId: scene.id,
        severity: "error",
        message: `Background ${scene.backgroundId} not found`,
      });
    }
    // validate music ids
    if (!novel.songs.some((song) => song.id === scene.musicId)) {
      errors.push({
        targetType: NovelValidationTargetType.SCENE,
        targetId: scene.id,
        severity: "error",
        message: `Music ${scene.musicId} not found`,
      });
    }

    // validate character ids
    scene.characters.forEach((character) => {
      if (!novel.characters.some((c) => c.id === character.characterId)) {
        errors.push({
          targetType: NovelValidationTargetType.SCENE,
          targetId: scene.id,
          severity: "error",
          message: `Character ${character.characterId} not found`,
        });
      }
    });

    // validate character outfits
    scene.characters.forEach((character) => {
      const characterObject = novel.characters.find(
        (c) => c.id === character.characterId
      );
      if (!characterObject) return;
      if (
        !characterObject.card.data.extensions.mikugg_v2.outfits.some(
          (outfit) => outfit.id === character.outfit
        )
      ) {
        errors.push({
          targetType: NovelValidationTargetType.SCENE,
          targetId: scene.id,
          severity: "error",
          message: `Outfit ${character.outfit} not found for character ${character.characterId}`,
        });
      }
    });

    // validate children
    scene.children.forEach((childId) => {
      if (!novel.scenes.some((s) => s.id === childId)) {
        errors.push({
          targetType: NovelValidationTargetType.SCENE,
          targetId: scene.id,
          severity: "error",
          message: `Child scene ${childId} not found`,
        });
      }
    });

    // validate parentMapId
    if (
      scene.parentMapId &&
      !novel.maps.some((map) => map.id === scene.parentMapId)
    ) {
      errors.push({
        targetType: NovelValidationTargetType.SCENE,
        targetId: scene.id,
        severity: "error",
        message: `Parent map ${scene.parentMapId} not found`,
      });
    }
  });

  // validate backgrounds
  novel.backgrounds.forEach((bg) => {
    if (!bg.source.jpg) {
      errors.push({
        targetType: NovelValidationTargetType.BACKGROUND,
        targetId: bg.id,
        severity: "error",
        message: `Background ${bg.name} has no jpg source`,
      });
    }
  });

  // validate songs
  novel.songs.forEach((song) => {
    if (!song.source) {
      errors.push({
        targetType: NovelValidationTargetType.SONG,
        targetId: song.id,
        severity: "error",
        message: `Song ${song.name} has no source`,
      });
    }
  });

  // validate characters
  novel.characters.forEach((character) => {
    if (!character.profile_pic) {
      errors.push({
        targetType: NovelValidationTargetType.CHARACTER,
        targetId: character.id,
        severity: "error",
        message: `Character ${character.name} has no profile pic`,
      });
    }
    character.card.data.extensions.mikugg_v2.outfits.forEach((outfit) => {
      outfit.emotions.forEach((emotion) => {
        if (!emotion.sources.png) {
          errors.push({
            targetType: NovelValidationTargetType.OUTFIT,
            targetId: outfit.id,
            severity: "error",
            message: `Outfit ${outfit.name} has no png source for emotion "${emotion.id}"`,
          });
        }
      });
    });
  });

  // validate non-empty
  if (!novel.characters.length) {
    errors.push({
      targetType: NovelValidationTargetType.CHARACTER,
      targetId: "characters",
      severity: "warning",
      message: `Novel has no characters`,
    });
  }

  if (!novel.scenes.length) {
    errors.push({
      targetType: NovelValidationTargetType.SCENE,
      targetId: "scenes",
      severity: "warning",
      message: `Novel has no scenes`,
    });
  }

  if (!novel.backgrounds.length) {
    errors.push({
      targetType: NovelValidationTargetType.BACKGROUND,
      targetId: "backgrounds",
      severity: "warning",
      message: `Novel has no backgrounds`,
    });
  }

  if (!novel.songs.length) {
    errors.push({
      targetType: NovelValidationTargetType.SONG,
      targetId: "songs",
      severity: "warning",
      message: `Novel has no songs`,
    });
  }

  if (!novel.starts.length) {
    errors.push({
      targetType: NovelValidationTargetType.START,
      targetId: "starts",
      severity: "warning",
      message: `Novel has no starts`,
    });
  }

  return errors;
}
