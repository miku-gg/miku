import { hashBase64URI, mikuCardToMikuCardV2, tavernCardV2ToMikuCard } from '../MikuCardUtils';
import { EMOTION_GROUP_TEMPLATES, MikuCard, MikuCardV2, TavernCardV2 } from '../MikuCardValidator';
import { replaceStringsInObject } from '../utils';
import * as NovelV3 from './NovelV3';
import * as NovelV2 from './_deprecated.NovelV2';

const randomString = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const tavernCardToMikuCardV2 = (tavernCard: TavernCardV2): MikuCardV2 => {
  return mikuCardToMikuCardV2(tavernCardV2ToMikuCard(tavernCard));
};

export const tavernCardToNovelState = (
  card: TavernCardV2,
  defaultCharacterId: string = randomString(),
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

  const lorebooks = card.data.character_book
    ? [
        {
          ...card.data.character_book,
          id: randomString(),
          isGlobal: true,
        },
      ]
    : [];

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
        name: 'Default Background',
        id: 'default-background',
        attributes: [],
        description: '',
        source: {
          jpg: 'default_background.jpg',
        },
      },
    ],
    description: mikugg_v2.short_description || '',
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
        lorebookIds: lorebooks.map((l) => l.id),
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
        id: 'default-music',
        name: 'Default Music',
        description: '',
        tags: [],
        source: 'default_music.mp3',
      },
    ],
    title: cardV2.data.name,
    tags: cardV2.data.tags,
    starts: [
      {
        id: randomString(),
        title: 'Default Start',
        description: '',
        characters: [
          {
            characterId: defaultCharacterId,
            text: cardV2.data.first_mes,
            pose: 'standing',
            emotion: 'happy',
          },
        ],
        sceneId: mikugg?.start_scenario || 'default-scenario',
      },
    ],
    scenes: mikugg?.scenarios.map((scenario, index) => ({
      id: scenario.id || 'default-scenario',
      backgroundId: scenario.background,
      actionText: scenario.trigger_action,
      name: scenario.name,
      condition: '',
      nsfw: mikugg_v2.outfits.find((o) => o.id == scenario.emotion_group)?.nsfw || 0,
      characters: [
        {
          characterId: defaultCharacterId,
          outfit: scenario.emotion_group,
        },
      ],
      children: scenario.children_scenarios?.length
        ? scenario.children_scenarios.map((child) => child || 'default-scenario')
        : mikugg.scenarios.map((s) => s.id).filter((_) => _),
      musicId: scenario.music || '',
      prompt: scenario.context,
      parentMapIds: null,
    })) || [
      {
        id: 'default-scenario',
        backgroundId: 'default-background',
        actionText: '',
        name: 'Default Scenario',
        condition: '',
        nsfw: 0,
        characters: [
          {
            characterId: defaultCharacterId,
            outfit: 'default-outfit',
          },
        ],
        children: [],
        musicId: 'default-music',
        prompt: '',
        parentMapIds: null,
      },
    ],
    lorebooks,
  };
};

export const migrateNovelV2ToV3 = (novel: NovelV2.NovelState): NovelV3.NovelState => {
  const _characters = Object.values(novel.characters);
  const firstCharacter = _characters[0] || null;
  const novelV3: NovelV3.NovelState = {
    title: novel.title,
    description: novel.description,
    tags: [],
    logoPic: firstCharacter?.profile_pic || '',
    author: firstCharacter?.card.data.creator || '',
    characters: _characters
      .map((character) => {
        if (!character) return undefined;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        character.card.data.extensions.mikugg.emotion_groups = Object.values(character.outfits) || [];
        return {
          id: character.id,
          name: character.name,
          profile_pic: character.profile_pic,
          short_description: character.card.data.extensions.mikugg.short_description,
          tags: character.card.data.tags,
          card: mikuCardToMikuCardV2(character.card),
          nsfw: NovelV3.NovelNSFW.NONE,
        };
      })
      .filter(Boolean) as NovelV3.NovelCharacter[],
    backgrounds: novel.scenes.map((scene) => ({
      id: scene.background,
      name: '',
      description: '',
      attributes: [],
      source: {
        jpg: scene.background,
      },
    })),
    songs: [],
    maps: [],
    scenes: novel.scenes.map((scene) => {
      const hasNSFWCharacterOutfit = scene.roles.some(({ characterId, role }) => {
        const char = novel.characters[characterId];
        if (char?.roles[role]) {
          return char?.outfits[char?.roles[role] || '']?.template === 'lewd-emotions';
        }
        return false;
      });
      return {
        id: scene.id,
        actionText: '',
        condition: '',
        children: scene.children.length ? scene.children : novel.scenes.map((s) => s.id).filter((_) => _),
        name: scene.name,
        parentMapIds: null,
        prompt: scene.prompt,
        characters: scene.roles.map(({ role, characterId }) => ({
          characterId: characterId,
          outfit: novel.characters[characterId]?.roles[role] || '',
        })),
        backgroundId: scene.background,
        musicId: '',
        nsfw: hasNSFWCharacterOutfit ? NovelV3.NovelNSFW.NUDITY : NovelV3.NovelNSFW.NONE,
      };
    }),
    starts: [],
  };
  return novelV3;
};

export const migrateNovelV1ToV2 = (novel: NovelV3.NovelState): NovelV3.NovelState => {
  return novel;
};

export const inputToNovelState = (input: any): { version: 'v3'; novel: NovelV3.NovelState } => {
  if (input?.novel) {
    if (input.version === 'v3') {
      return {
        version: 'v3',
        novel: input.novel,
      };
    } else if (input.version === 'v2') {
      return {
        version: 'v3',
        novel: migrateNovelV2ToV3(input.novel),
      };
    } else if (input.version === 'v1') {
      return {
        version: 'v3',
        novel: migrateNovelV1ToV2(migrateNovelV2ToV3(input.novel)),
      };
    } else {
      throw new Error(`Unknown file: version ${input.version}`);
    }
  } else if (input?.spec === 'chara_card_v2') {
    return {
      version: 'v3',
      novel: tavernCardToNovelState(input as TavernCardV2),
    };
  } else {
    throw new Error(`Unknown file`);
  }
};

const isDataUri = (str: string): boolean => {
  return str.startsWith('data:');
};

export const extractNovelAssets = async (
  novel: NovelV3.NovelState,
): Promise<{
  novel: NovelV3.NovelState;
  assets: {
    images: Map<string, { source: string; type: AssetType }>;
    audios: Map<string, { source: string; type: AssetType }>;
    videos: Map<string, { source: string; type: AssetType }>;
  };
}> => {
  const images = new Map<string, { source: string; type: AssetType }>();
  const audios = new Map<string, { source: string; type: AssetType }>();
  const videos = new Map<string, { source: string; type: AssetType }>();

  // Process backgrounds
  for (const background of novel.backgrounds) {
    if (background.source.jpg.startsWith('data:')) {
      const bgHashJpg = await hashBase64URI(background.source.jpg);
      images.set(bgHashJpg, { source: background.source.jpg, type: AssetType.BACKGROUND_IMAGE });
      background.source.jpg = bgHashJpg;
    } else {
      images.set(background.source.jpg, { source: background.source.jpg, type: AssetType.BACKGROUND_IMAGE });
    }

    if (background.source.jpgMobile?.startsWith('data:')) {
      const bgHashJpgMobile = await hashBase64URI(background.source.jpgMobile);
      images.set(bgHashJpgMobile, { source: background.source.jpgMobile, type: AssetType.BACKGROUND_IMAGE });
      background.source.jpgMobile = bgHashJpgMobile;
    } else if (background.source.jpgMobile) {
      images.set(background.source.jpgMobile, {
        source: background.source.jpgMobile,
        type: AssetType.BACKGROUND_IMAGE,
      });
    }

    if (background.source.mp4?.startsWith('data:')) {
      const bgHashWebm = await hashBase64URI(background.source.mp4);
      videos.set(bgHashWebm, { source: background.source.mp4, type: AssetType.BACKGROUND_VIDEO });
      background.source.mp4 = bgHashWebm;
    } else if (background.source.mp4) {
      videos.set(background.source.mp4, { source: background.source.mp4, type: AssetType.BACKGROUND_VIDEO });
    }

    if (background.source.mp4Mobile?.startsWith('data:')) {
      const bgHashWebmMobile = await hashBase64URI(background.source.mp4Mobile);
      videos.set(bgHashWebmMobile, { source: background.source.mp4Mobile, type: AssetType.BACKGROUND_VIDEO });
      background.source.mp4Mobile = bgHashWebmMobile;
    } else if (background.source.mp4Mobile) {
      videos.set(background.source.mp4Mobile, {
        source: background.source.mp4Mobile,
        type: AssetType.BACKGROUND_VIDEO,
      });
    }
  }

  // Process songs
  for (const song of novel.songs) {
    if (song.source.startsWith('data:')) {
      const songHash = await hashBase64URI(song.source);
      audios.set(songHash, { source: song.source, type: AssetType.MUSIC });
      song.source = songHash;
    } else {
      audios.set(song.source, { source: song.source, type: AssetType.MUSIC });
    }
  }

  // Process maps (including places within maps)
  for (const map of novel.maps) {
    if (map.source.png.startsWith('data:')) {
      const mapHashPng = await hashBase64URI(map.source.png);
      images.set(mapHashPng, { source: map.source.png, type: AssetType.MAP_IMAGE });
      map.source.png = mapHashPng;
    } else {
      images.set(map.source.png, { source: map.source.png, type: AssetType.MAP_IMAGE });
    }
    if (map.source.mp4?.startsWith('data:')) {
      const mapHashMp4 = await hashBase64URI(map.source.mp4);
      videos.set(mapHashMp4, { source: map.source.mp4, type: AssetType.MAP_VIDEO });
      map.source.mp4 = mapHashMp4;
    } else if (map.source.mp4) {
      videos.set(map.source.mp4, { source: map.source.mp4, type: AssetType.MAP_VIDEO });
    }

    if (map.source.music?.startsWith('data:')) {
      const mapMusicHash = await hashBase64URI(map.source.music);
      audios.set(mapMusicHash, { source: map.source.music, type: AssetType.MUSIC });
      map.source.music = mapMusicHash;
    } else if (map.source.music) {
      audios.set(map.source.music, { source: map.source.music, type: AssetType.MUSIC });
    }

    for (const place of map.places) {
      if (place.previewSource.startsWith('data:')) {
        const placePreviewHash = await hashBase64URI(place.previewSource);
        images.set(placePreviewHash, { source: place.previewSource, type: AssetType.MAP_IMAGE_PREVIEW });
        place.previewSource = placePreviewHash;
      } else if (place.previewSource) {
        images.set(place.previewSource, { source: place.previewSource, type: AssetType.MAP_IMAGE_PREVIEW });
      }
      if (place.maskSource.startsWith('data:')) {
        const placeMaskHash = await hashBase64URI(place.maskSource);
        images.set(placeMaskHash, { source: place.maskSource, type: AssetType.MAP_MASK });
        place.maskSource = placeMaskHash;
      } else if (place.maskSource) {
        images.set(place.maskSource, { source: place.maskSource, type: AssetType.MAP_MASK });
      }
    }
  }

  // process logoPic
  if (isDataUri(novel.logoPic)) {
    const logoPicHash = await hashBase64URI(novel.logoPic);
    images.set(logoPicHash, { source: novel.logoPic, type: AssetType.NOVEL_PIC });
    novel.logoPic = logoPicHash;
  } else {
    images.set(novel.logoPic, { source: novel.logoPic, type: AssetType.NOVEL_PIC });
  }

  // process characters
  for (const character of novel.characters) {
    if (isDataUri(character.profile_pic)) {
      const profilePicHash = await hashBase64URI(character.profile_pic);
      images.set(profilePicHash, { source: character.profile_pic, type: AssetType.CHARACTER_PIC });
      character.profile_pic = profilePicHash;
    } else {
      images.set(character.profile_pic, { source: character.profile_pic, type: AssetType.CHARACTER_PIC });
    }

    if (character.card.data.extensions.mikugg_v2.profile_pic.startsWith('data:')) {
      const profilePicHash = await hashBase64URI(character.card.data.extensions.mikugg_v2.profile_pic);
      images.set(profilePicHash, {
        source: character.card.data.extensions.mikugg_v2.profile_pic,
        type: AssetType.CHARACTER_PIC,
      });
      character.card.data.extensions.mikugg_v2.profile_pic = profilePicHash;
    } else {
      images.set(character.card.data.extensions.mikugg_v2.profile_pic, {
        source: character.card.data.extensions.mikugg_v2.profile_pic,
        type: AssetType.CHARACTER_PIC,
      });
    }

    // process character outfits
    for (const outfit of character.card.data.extensions.mikugg_v2.outfits) {
      for (const emotion of outfit.emotions) {
        if (isDataUri(emotion.sources.png)) {
          const emotionPngHash = await hashBase64URI(emotion.sources.png);
          images.set(emotionPngHash, { source: emotion.sources.png, type: AssetType.EMOTION_IMAGE });
          emotion.sources.png = emotionPngHash;
        } else {
          images.set(emotion.sources.png, { source: emotion.sources.png, type: AssetType.EMOTION_IMAGE });
        }
        if (emotion.sources.webm && isDataUri(emotion.sources.webm)) {
          const emotionWebmHash = await hashBase64URI(emotion.sources.webm);
          videos.set(emotionWebmHash, { source: emotion.sources.webm, type: AssetType.EMOTION_ANIMATED });
          emotion.sources.webm = emotionWebmHash;
        } else if (emotion.sources.webm) {
          videos.set(emotion.sources.webm, { source: emotion.sources.webm, type: AssetType.EMOTION_ANIMATED });
        }
        if (emotion.sources.sound && isDataUri(emotion.sources.sound)) {
          const emotionSoundHash = await hashBase64URI(emotion.sources.sound);
          audios.set(emotionSoundHash, { source: emotion.sources.sound, type: AssetType.EMOTION_SOUND });
          emotion.sources.sound = emotionSoundHash;
        } else if (emotion.sources.sound) {
          audios.set(emotion.sources.sound, { source: emotion.sources.sound, type: AssetType.EMOTION_SOUND });
        }
      }
    }

    // process items
    if (novel.inventory?.length) {
      for (const item of novel.inventory) {
        if (isDataUri(item.icon)) {
          const itemIconHash = await hashBase64URI(item.icon);
          images.set(itemIconHash, { source: item.icon, type: AssetType.ITEM_IMAGE });
          item.icon = itemIconHash;
        } else {
          images.set(item.icon, { source: item.icon, type: AssetType.ITEM_IMAGE });
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
  ASSET_TOO_LARGE = 'ASSET_TOO_LARGE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

export enum AssetType {
  NOVEL_PIC = 'NOVEL_PIC',
  CHARACTER_PIC = 'CHARACTER_PIC',
  EMOTION_IMAGE = 'EMOTION_IMAGE',
  EMOTION_ANIMATED = 'EMOTION_ANIMATED',
  EMOTION_SOUND = 'EMOTION_SOUND',
  BACKGROUND_IMAGE = 'BACKGROUND_IMAGE',
  BACKGROUND_VIDEO = 'BACKGROUND_VIDEO',
  MAP_IMAGE = 'MAP_IMAGE',
  MAP_MASK = 'MAP_MASK',
  MAP_IMAGE_PREVIEW = 'MAP_IMAGE_PREVIEW',
  MAP_VIDEO = 'MAP_VIDEO',
  MUSIC = 'MUSIC',
  ITEM_IMAGE = 'ITEM_IMAGE',
  PROFILE_PIC = 'PROFILE_PIC',
  NOVEL_AD = 'NOVEL_AD',
  NOVEL_SCREENSHOT = 'NOVEL_SCREENSHOT',
  NOVEL_AD_VIDEO = 'NOVEL_AD_VIDEO',
  NOVEL_SHARE = 'NOVEL_SHARE',
}

export const importAndReplaceNovelStateAssets = async (
  novel: NovelV3.NovelState,
  options: {
    uploadAsset: (dataString: string, type: AssetType) => Promise<{ success: boolean; assetId: string }>;
    onUpdate: (value: { progress: number; total: number; bytes: number }) => void;
    onError: (error: ErrorImportType, message?: string) => void;
    uploadBatchSize: number;
  },
): Promise<NovelV3.NovelState> => {
  const {
    novel: novelWithReplacedAssets,
    assets: { images, audios, videos },
  } = await extractNovelAssets(novel);
  // CHECK IF SOME AUDIO IS MORE THAN 20MB
  const bigAudio = Array.from(audios.entries()).find(([_, audio]) => audio.source.length > 20 * ONE_MB);

  if (bigAudio) {
    options.onError(ErrorImportType.ASSET_TOO_LARGE, `Audio ${bigAudio[0]} is too large`);
  }

  // check big image
  const bigImage = Array.from(images.entries()).find(([_, image]) => image.source.length > 20 * ONE_MB);

  if (bigImage) {
    options.onError(ErrorImportType.ASSET_TOO_LARGE, `Image ${bigImage[0]} is too large`);
  }

  // check big video

  const bigVideo = Array.from(videos.entries()).find(([_, video]) => video.source.length > 20 * ONE_MB);

  if (bigVideo) {
    options.onError(ErrorImportType.ASSET_TOO_LARGE, `Video ${bigVideo[0]} is too large`);
  }

  const assets = new Map([...images, ...audios, ...videos]);
  const total = assets.size + 1;
  let progress = 0;
  let bytes = 0;

  options.onUpdate({ progress, total, bytes });

  async function uploadAssetBatch(batch: string[]): Promise<{ find: string; replace: string }[]> {
    return Promise.all(
      batch.map(async (asset) => {
        try {
          const { source, type } = assets.get(asset)!;
          const result = await options.uploadAsset(source, type);
          options.onUpdate({
            progress: ++progress,
            total,
            bytes: (bytes = bytes + source.length),
          });
          if (!result.success) {
            options.onError(ErrorImportType.UPLOAD_FAILED, `Asset ${asset} upload failed.`);
          }
          return { find: asset, replace: result.assetId || '' };
        } catch (error) {
          options.onError(ErrorImportType.UPLOAD_FAILED, `Asset ${asset} upload failed.`);
          progress++;
          return { find: asset, replace: '' };
        }
      }),
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
    novelResult = replaceStringsInObject(novelResult, find, replace) as NovelV3.NovelState;
  });

  return novelResult;
};

export enum NovelValidationTargetType {
  DESC,
  SCENE,
  CHARACTER,
  OUTFIT,
  SONG,
  BACKGROUND,
  START,
  MAP,
  INVENTORY,
  OBJETIVES,
  CUTSCENE,
}
export interface NovelValidation {
  targetType: NovelValidationTargetType;
  targetId: string;
  severity: 'error' | 'warning';
  message: string;
}

export function validateNovelState(novel: NovelV3.NovelState): NovelValidation[] {
  const errors: NovelValidation[] = [];
  try {
    if (!novel.title) {
      errors.push({
        targetType: NovelValidationTargetType.DESC,
        severity: 'error',
        targetId: 'title',
        message: 'Novel has no title',
      });
    }

    if (!novel.logoPic) {
      errors.push({
        targetType: NovelValidationTargetType.DESC,
        severity: 'error',
        targetId: 'logoPic',
        message: 'Novel has no logo pic',
      });
    }

    if (!novel.author) {
      errors.push({
        targetType: NovelValidationTargetType.DESC,
        severity: 'error',
        targetId: 'author',
        message: 'Novel has no author',
      });
    }

    if (!novel.description) {
      errors.push({
        targetType: NovelValidationTargetType.DESC,
        severity: 'error',
        targetId: 'description',
        message: 'Novel has no description',
      });
    }

    // Validate scene IDs in starts
    novel.starts.forEach((start) => {
      const startScene = novel.scenes.find((scene) => scene.id === start.sceneId);
      if (!startScene) {
        errors.push({
          targetType: NovelValidationTargetType.START,
          severity: 'error',
          targetId: start.id,
          message: `Scene ${start.sceneId} not found`,
        });
      } else {
        // check if characters are in the scene
        start.characters.forEach((character) => {
          if (!startScene.characters.some((sceneCharacter) => sceneCharacter.characterId === character.characterId)) {
            errors.push({
              targetType: NovelValidationTargetType.START,
              severity: 'error',
              targetId: start.id,
              message: `A character in start "${start.title || start.id}" not found in scene ${start.sceneId}`,
            });
          } else {
            const { outfit: outfitSlug } = startScene.characters.find(
              (sceneCharacter) => sceneCharacter.characterId === character.characterId,
            ) || { outfit: '' };
            const characterEntity = novel.characters.find((c) => c.id === character.characterId);
            // check if outfit is valid
            const outfit = characterEntity?.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === outfitSlug);
            if (!outfit) {
              errors.push({
                targetType: NovelValidationTargetType.START,
                severity: 'error',
                targetId: start.id,
                message: `Outfit ${outfit} not found for character ${character.characterId}`,
              });
            }
            // check if emotion is valid for outfit, using base-emotions for single-emotion outfits
            if (outfit) {
              const validEmotions =
                outfit.template === 'single-emotion'
                  ? EMOTION_GROUP_TEMPLATES['base-emotions'].emotionIds
                  : outfit.emotions.map((e) => e.id);

              if (!validEmotions.includes(character.emotion)) {
                errors.push({
                  targetType: NovelValidationTargetType.START,
                  severity: 'error',
                  targetId: start.id,
                  message: `Emotion ${character.emotion} not found for outfit ${outfit.name} in character ${characterEntity?.name}`,
                });
              }
            }

            // check if text is not empty
            if (!character.text) {
              errors.push({
                targetType: NovelValidationTargetType.START,
                severity: 'warning',
                targetId: start.id,
                message: `A character in start "${start.title || start.id}" has no text`,
              });
            }
            // check if text has more than 2000 characters
            if (character.text.length > 2000) {
              errors.push({
                targetType: NovelValidationTargetType.START,
                severity: 'warning',
                targetId: start.id,
                message: `A character in start "${start.title || start.id}" has more than 2000 characters in text`,
              });
            }
          }
        });
      }

      // Validate character IDs in starts
      start.characters.forEach((character) => {
        if (!novel.characters.some((c) => c.id === character.characterId)) {
          errors.push({
            targetType: NovelValidationTargetType.START,
            severity: 'error',
            targetId: start.id,
            message: `Character ${character.characterId} not found`,
          });
        }
      });
    });

    //validate maps
    novel.maps.forEach((map) => {
      //validate map image source
      if (!map.source.png) {
        errors.push({
          targetType: NovelValidationTargetType.MAP,
          targetId: map.id,
          severity: 'error',
          message: `Map "${map.name}" has no map image`,
        });
      }
      // validate places
      if (!map.places.length) {
        errors.push({
          targetType: NovelValidationTargetType.MAP,
          targetId: map.id,
          severity: 'warning',
          message: `Map "${map.name}" has no places`,
        });
      }
      // validate map assigned to at least one scene
      const mapInScene = novel.scenes.find((scene) => scene.parentMapIds?.includes(map.id));
      if (!mapInScene) {
        errors.push({
          targetType: NovelValidationTargetType.MAP,
          targetId: map.id,
          severity: 'warning',
          message: `Map "${map.name}" is not assigned to any scene`,
        });
      }
      // validate places
      map.places.forEach((place) => {
        if (!place.maskSource) {
          errors.push({
            targetType: NovelValidationTargetType.MAP,
            targetId: map.id,
            severity: 'error',
            message: `Place ${place.name} has no mask image.`,
          });
        }
        //validate place name
        if (!place.name) {
          errors.push({
            targetType: NovelValidationTargetType.MAP,
            targetId: map.id,
            severity: 'error',
            message: `Place has no name in map ${map.name}`,
          });
        }
        // validate sceneId
        if (!novel.scenes.some((scene) => scene.id === place.sceneId)) {
          errors.push({
            targetType: NovelValidationTargetType.MAP,
            targetId: map.id,
            severity: 'error',
            message: `Scene ${place.sceneId} not found, please change it on place ${place.name} in map ${map.name}`,
          });
        }

        if (!place.sceneId) {
          errors.push({
            targetType: NovelValidationTargetType.MAP,
            targetId: map.id,
            severity: 'error',
            message: `Place ${place.name} has no scene assigned`,
          });
        }
      });
    });

    //Validate Inventory Items
    if (novel.inventory) {
      novel.inventory.forEach((item) => {
        if (!item.name) {
          errors.push({
            targetType: NovelValidationTargetType.INVENTORY,
            targetId: item.id,
            severity: 'error',
            message: `Item has no name`,
          });
        }
        if (!item.description) {
          errors.push({
            targetType: NovelValidationTargetType.INVENTORY,
            targetId: item.id,
            severity: 'warning',
            message: `Item '${item.name}' has no description`,
          });
        }
        if (!item.icon) {
          errors.push({
            targetType: NovelValidationTargetType.INVENTORY,
            targetId: item.id,
            severity: 'error',
            message: `Item '${item.name}' has no icon`,
          });
        }
        if (item.actions) {
          if (!item.actions.length) {
            errors.push({
              targetType: NovelValidationTargetType.INVENTORY,
              targetId: item.id,
              severity: 'error',
              message: `Item '${item.name}' has no actions`,
            });
          }
          item.actions.forEach((action) => {
            if (!action.name) {
              errors.push({
                targetType: NovelValidationTargetType.INVENTORY,
                targetId: item.id,
                severity: 'error',
                message: `Action has no name in item '${item.name}'`,
              });
            }
            if (!action.prompt) {
              errors.push({
                targetType: NovelValidationTargetType.INVENTORY,
                targetId: item.id,
                severity: 'error',
                message: `Action '${action.name}' in item '${item.name}' has no prompt`,
              });
            }
            if (action.usageActions) {
              action.usageActions.forEach((usageAction) => {
                if (usageAction.type === NovelV3.NovelActionType.SHOW_ITEM) {
                  if (!usageAction.params.itemId) {
                    errors.push({
                      targetType: NovelValidationTargetType.DESC,
                      targetId: item.id,
                      severity: 'error',
                      message: `Show item action has no item id in action '${action.name}' in '${item.name}'`,
                    });
                  }
                }
                if (usageAction.type === NovelV3.NovelActionType.HIDE_ITEM) {
                  if (!usageAction.params.itemId) {
                    errors.push({
                      targetType: NovelValidationTargetType.DESC,
                      targetId: item.id,
                      severity: 'error',
                      message: `Hide item action has no item id in action '${action.name}' in '${item.name}'`,
                    });
                  }
                }
                if (usageAction.type === NovelV3.NovelActionType.ADD_CHILD_SCENES) {
                  if (!usageAction.params.sceneId) {
                    errors.push({
                      targetType: NovelValidationTargetType.DESC,
                      targetId: item.id,
                      severity: 'error',
                      message: `Add child scenes action has no scene id in action '${action.name}' in '${item.name}'`,
                    });
                  }
                  if (!usageAction.params.children) {
                    errors.push({
                      targetType: NovelValidationTargetType.DESC,
                      targetId: item.id,
                      severity: 'error',
                      message: `Add child scenes action has no children in action '${action.name}' in '${item.name}'`,
                    });
                  }
                }
                if (usageAction.type === NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE) {
                  if (!usageAction.params.sceneId) {
                    errors.push({
                      targetType: NovelValidationTargetType.DESC,
                      targetId: item.id,
                      severity: 'error',
                      message: `Suggest advance scene action has no scene id in action '${action.name}' in '${item.name}'`,
                    });
                  }
                }
              });
            }
            if (action.usageCondition) {
              if (!action.usageCondition.config.sceneIds) {
                errors.push({
                  targetType: NovelValidationTargetType.INVENTORY,
                  targetId: item.id,
                  severity: 'error',
                  message: `Action '${action.name}' has no condition in item '${item.name}'`,
                });
              }
            }
          });
        }
      });
    }

    //Validate Novel objectives
    if (novel.objectives) {
      novel.objectives.forEach((objective) => {
        if (!objective.name) {
          errors.push({
            targetType: NovelValidationTargetType.OBJETIVES,
            targetId: objective.id,
            severity: 'error',
            message: `Objective has no name`,
          });
        }
        if (objective.actions) {
          if (!objective.actions.length) {
            errors.push({
              targetType: NovelValidationTargetType.OBJETIVES,
              targetId: objective.id,
              severity: 'error',
              message: `Objective '${objective.name}' has no actions`,
            });
          }
          objective.actions.forEach((action) => {
            if (action.type === NovelV3.NovelActionType.SHOW_ITEM) {
              if (!action.params.itemId) {
                errors.push({
                  targetType: NovelValidationTargetType.OBJETIVES,
                  targetId: objective.id,
                  severity: 'error',
                  message: `Show item action has no item id in objective '${objective.name}'`,
                });
              }
            }
            if (action.type === NovelV3.NovelActionType.HIDE_ITEM) {
              if (!action.params.itemId) {
                errors.push({
                  targetType: NovelValidationTargetType.OBJETIVES,
                  targetId: objective.id,
                  severity: 'error',
                  message: `Hide item action has no item id in objective '${objective.name}'`,
                });
              }
            }
            if (action.type === NovelV3.NovelActionType.ADD_CHILD_SCENES) {
              if (!action.params.sceneId) {
                errors.push({
                  targetType: NovelValidationTargetType.OBJETIVES,
                  targetId: objective.id,
                  severity: 'error',
                  message: `Add child scenes action has no scene id in objective '${objective.name}'`,
                });
              }
              if (!action.params.children) {
                errors.push({
                  targetType: NovelValidationTargetType.OBJETIVES,
                  targetId: objective.id,
                  severity: 'error',
                  message: `Add child scenes action has no children in objective '${objective.name}'`,
                });
              }
            }
            if (action.type === NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE) {
              if (!action.params.sceneId) {
                errors.push({
                  targetType: NovelValidationTargetType.OBJETIVES,
                  targetId: objective.id,
                  severity: 'error',
                  message: `Suggest advance scene action has no scene id in objective '${objective.name}'`,
                });
              }
            }
          });
        }
        if (!objective.condition) {
          errors.push({
            targetType: NovelValidationTargetType.OBJETIVES,
            targetId: objective.id,
            severity: 'error',
            message: `Objective '${objective.name}' has no condition`,
          });
        }

        if (!objective.stateCondition?.config?.sceneIds || !objective.stateCondition?.config?.sceneIds.length) {
          errors.push({
            targetType: NovelValidationTargetType.OBJETIVES,
            targetId: objective.id,
            severity: 'error',
            message: `Objective '${objective.name}' is not assigned to any scene`,
          });
        }
      });
    }

    novel.scenes.forEach((scene) => {
      // validate background ids
      if (!novel.backgrounds.some((bg) => bg.id === scene.backgroundId)) {
        errors.push({
          targetType: NovelValidationTargetType.SCENE,
          targetId: scene.id,
          severity: 'error',
          message: `Background ${scene.backgroundId} not found`,
        });
      }
      // validate music ids
      if (!novel.songs.some((song) => song.id === scene.musicId)) {
        errors.push({
          targetType: NovelValidationTargetType.SCENE,
          targetId: scene.id,
          severity: 'error',
          message: `Music ${scene.musicId} not found`,
        });
      }

      // validate character ids
      scene.characters.forEach((character) => {
        if (!novel.characters.some((c) => c.id === character.characterId)) {
          errors.push({
            targetType: NovelValidationTargetType.SCENE,
            targetId: scene.id,
            severity: 'error',
            message: `Character ${character.characterId} not found`,
          });
        }
      });

      // validate character outfits
      scene.characters.forEach((character) => {
        const characterObject = novel.characters.find((c) => c.id === character.characterId);
        if (!characterObject) return;
        if (!characterObject.card.data.extensions.mikugg_v2.outfits.some((outfit) => outfit.id === character.outfit)) {
          errors.push({
            targetType: NovelValidationTargetType.SCENE,
            targetId: scene.id,
            severity: 'error',
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
            severity: 'error',
            message: `Child scene ${childId} not found`,
          });
        }
      });

      // validate parentMapId
      if (scene.parentMapIds?.length) {
        const erroredMap = scene.parentMapIds.find((parentMapId) => !novel.maps.some((map) => map.id === parentMapId));
        if (erroredMap) {
          errors.push({
            targetType: NovelValidationTargetType.SCENE,
            targetId: scene.id,
            severity: 'error',
            message: `Parent map ${erroredMap} not found`,
          });
        }
      }

      // validate no scene name
      if (!scene.name) {
        errors.push({
          targetType: NovelValidationTargetType.SCENE,
          targetId: scene.id,
          severity: 'warning',
          message: `Scene ${scene.id} has no name`,
        });
      }

      // validate scene prompt and condition sizes
      if (scene.prompt.length > 500) {
        errors.push({
          targetType: NovelValidationTargetType.SCENE,
          targetId: scene.id,
          severity: 'warning',
          message: `Scene ${scene.name || scene.id} has more than 500 characters in prompt`,
        });
      }
      if ((scene.condition?.length || 0) > 400) {
        errors.push({
          targetType: NovelValidationTargetType.SCENE,
          targetId: scene.id,
          severity: 'warning',
          message: `Scene ${scene.name || scene.id} has more than 400 characters in condition`,
        });
      }

      // validate scene character objective sizes less than 200.
      scene.characters.forEach((character) => {
        if ((character.objective?.length || 0) > 400) {
          errors.push({
            targetType: NovelValidationTargetType.SCENE,
            targetId: scene.id,
            severity: 'warning',
            message: `Scene ${scene.name || scene.id} has more than 400 characters in a character objective`,
          });
        }
      });
    });

    // validate backgrounds
    novel.backgrounds.forEach((bg) => {
      if (!bg.source.jpg) {
        errors.push({
          targetType: NovelValidationTargetType.BACKGROUND,
          targetId: bg.id,
          severity: 'error',
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
          severity: 'error',
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
          severity: 'error',
          message: `Character ${character.name} has no profile pic`,
        });
      }
      character.card.data.extensions.mikugg_v2.outfits.forEach((outfit) => {
        outfit.emotions.forEach((emotion) => {
          if (!emotion.sources.png) {
            errors.push({
              targetType: NovelValidationTargetType.OUTFIT,
              targetId: outfit.id,
              severity: 'error',
              message: `Outfit ${outfit.name} has no png source for emotion "${emotion.id}"`,
            });
          }
        });
        // check outfit template is in Object.keys(EMOTION_GROUP_TEMPLATES)
        // eslint-disable-next-line
        // @ts-ignore
        const template = EMOTION_GROUP_TEMPLATES[outfit.template] as {
          id: string;
          label: string;
          emotionIds: string[];
        };
        if (!template || !template.emotionIds?.length) {
          errors.push({
            targetType: NovelValidationTargetType.OUTFIT,
            targetId: outfit.id,
            severity: 'error',
            message: `Outfit ${outfit.name} has invalid template "${outfit.template}"`,
          });
        } else {
          // check outfit template has correct emotions
          const missingEmotions = template.emotionIds.filter(
            (emotionId) => !outfit.emotions.some((emotion) => emotion.id === emotionId),
          );
          if (missingEmotions.length) {
            errors.push({
              targetType: NovelValidationTargetType.OUTFIT,
              targetId: outfit.id,
              severity: 'error',
              message: `Outfit ${outfit.name} is missing emotions: ${missingEmotions.join(', ')}`,
            });
          }
        }
      });

      // check for name, description, conversation example
      if (!character.card.data.name) {
        errors.push({
          targetType: NovelValidationTargetType.CHARACTER,
          targetId: character.id,
          severity: 'error',
          message: `Character ${character.id} has no name`,
        });
      }

      if (!character.short_description) {
        errors.push({
          targetType: NovelValidationTargetType.CHARACTER,
          targetId: character.id,
          severity: 'warning',
          message: `Character ${character.name} has no short description`,
        });
      }

      if (!character.card.data.mes_example) {
        errors.push({
          targetType: NovelValidationTargetType.CHARACTER,
          targetId: character.id,
          severity: 'warning',
          message: `Character ${character.name} has no conversation example`,
        });
      }

      if (!character.card.data.description) {
        errors.push({
          targetType: NovelValidationTargetType.CHARACTER,
          targetId: character.id,
          severity: 'warning',
          message: `Character ${character.name} has no description`,
        });
      }

      // if character name has special chars or numbers
      if (character.name.match(/[^a-zA-Z\s]/)) {
        errors.push({
          targetType: NovelValidationTargetType.CHARACTER,
          targetId: character.id,
          severity: 'warning',
          message: `Character ${character.name} has special characters or numbers in name`,
        });
      }

      // if character name has more than 20 characters
      if (character.name.length > 20) {
        errors.push({
          targetType: NovelValidationTargetType.CHARACTER,
          targetId: character.id,
          severity: 'warning',
          message: `Character ${character.name} has more than 20 characters in name`,
        });
      }

      // if character short description has more than 100 characters
      if (character.short_description.length > 100) {
        errors.push({
          targetType: NovelValidationTargetType.CHARACTER,
          targetId: character.id,
          severity: 'warning',
          message: `Character ${character.name} has more than 100 characters in short description`,
        });
      }

      // if character messages have more than 2000 characters
      if (character.card.data.mes_example.length > 2500) {
        errors.push({
          targetType: NovelValidationTargetType.CHARACTER,
          targetId: character.id,
          severity: 'warning',
          message: `Character ${character.name} has more than 2500 characters in conversation example`,
        });
      }

      // if character description has more than 2000 characters
      if (character.card.data.description.length > 2500) {
        errors.push({
          targetType: NovelValidationTargetType.CHARACTER,
          targetId: character.id,
          severity: 'warning',
          message: `Character ${character.name} has more than 2500 characters in description`,
        });
      }

      // if character personality has more than 2000 characters
      if (character.card.data.personality.length > 1000) {
        errors.push({
          targetType: NovelValidationTargetType.CHARACTER,
          targetId: character.id,
          severity: 'warning',
          message: `Character ${character.name} has more than 1000 characters in personality`,
        });
      }

      // if an outfit description has more tha 300 characters
      character.card.data.extensions.mikugg_v2.outfits.forEach((outfit) => {
        if (outfit.description.length > 300) {
          errors.push({
            targetType: NovelValidationTargetType.OUTFIT,
            targetId: outfit.id,
            severity: 'warning',
            message: `Outfit ${character.name}:${outfit.name} has more than 300 characters in description`,
          });
        }
      });
    });

    // validate non-empty
    if (!novel.characters.length) {
      errors.push({
        targetType: NovelValidationTargetType.CHARACTER,
        targetId: 'characters',
        severity: 'error',
        message: `Novel has no characters`,
      });
    }

    if (!novel.scenes.length) {
      errors.push({
        targetType: NovelValidationTargetType.SCENE,
        targetId: 'scenes',
        severity: 'error',
        message: `Novel has no scenes`,
      });
    }

    if (!novel.backgrounds.length) {
      errors.push({
        targetType: NovelValidationTargetType.BACKGROUND,
        targetId: 'backgrounds',
        severity: 'error',
        message: `Novel has no backgrounds`,
      });
    }

    if (!novel.songs.length) {
      errors.push({
        targetType: NovelValidationTargetType.SONG,
        targetId: 'songs',
        severity: 'error',
        message: `Novel has no songs`,
      });
    }

    if (!novel.starts.length) {
      errors.push({
        targetType: NovelValidationTargetType.START,
        targetId: 'starts',
        severity: 'error',
        message: `Novel has no starts`,
      });
    }

    if (novel.cutscenes?.length) {
      novel.cutscenes.forEach((cutscene) => {
        if (!cutscene.parts?.length) {
          errors.push({
            targetType: NovelValidationTargetType.CUTSCENE,
            targetId: cutscene.id,
            severity: 'error',
            message: `Cutscene "${cutscene.name || cutscene.id}" has no parts`,
          });
        }

        cutscene.parts?.forEach((part) => {
          if (!part.text?.length) {
            errors.push({
              targetType: NovelValidationTargetType.CUTSCENE,
              targetId: cutscene.id,
              severity: 'error',
              message: `Part ${part.id} in cutscene "${cutscene.name}" has no text`,
            });
          }

          part.text?.forEach((text, index) => {
            if (!text.content) {
              errors.push({
                targetType: NovelValidationTargetType.CUTSCENE,
                targetId: cutscene.id,
                severity: 'error',
                message: `Text ${index + 1} in part ${part.id} of cutscene "${cutscene.name}" is empty`,
              });
            }
          });

          // Validar background
          if (!part.background) {
            errors.push({
              targetType: NovelValidationTargetType.CUTSCENE,
              targetId: cutscene.id,
              severity: 'error',
              message: `Part ${part.id} in cutscene "${cutscene.name}" has no background`,
            });
          } else if (!novel.backgrounds.some((bg) => bg.id === part.background)) {
            errors.push({
              targetType: NovelValidationTargetType.CUTSCENE,
              targetId: cutscene.id,
              severity: 'error',
              message: `Background ${part.background} not found for part ${part.id} in cutscene "${cutscene.name}"`,
            });
          }

          part.characters?.forEach((character) => {
            if (!character) {
              errors.push({
                targetType: NovelValidationTargetType.CUTSCENE,
                targetId: cutscene.id,
                severity: 'error',
                message: `A part of cutscene "${cutscene.name}" has an null character`,
              });
              return;
            }
            const characterObj = novel.characters.find((c) => c.id === character.id);
            if (!characterObj) {
              errors.push({
                targetType: NovelValidationTargetType.CUTSCENE,
                targetId: cutscene.id,
                severity: 'error',
                message: `Character ${character.id} not found in part ${part.id} of cutscene "${cutscene.name}"`,
              });
              return;
            }

            const outfit = characterObj.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === character.outfitId);
            if (!outfit) {
              errors.push({
                targetType: NovelValidationTargetType.CUTSCENE,
                targetId: cutscene.id,
                severity: 'error',
                message: `Outfit ${character.outfitId} not found for character ${characterObj.name} in part ${part.id} of cutscene "${cutscene.name}"`,
              });
              return;
            }

            if (!outfit.emotions.some((e) => e.id === character.emotionId)) {
              errors.push({
                targetType: NovelValidationTargetType.CUTSCENE,
                targetId: cutscene.id,
                severity: 'error',
                message: `Emotion ${character.emotionId} not found in outfit ${outfit.name} for character ${characterObj.name} in part ${part.id} of cutscene "${cutscene.name}"`,
              });
            }
          });
        });
      });
    }
  } catch (e) {
    console.error(e);
    errors.push({
      targetType: NovelValidationTargetType.DESC,
      severity: 'error',
      targetId: 'error',
      message: 'An error occurred while validating the novel',
    });
  }

  return errors;
}
