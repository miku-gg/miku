import { TavernCardV2 } from "@mikugg/bot-utils";
import { NovelFormState } from "../state/NovelFormState";

export const tavernV2ToNovelState = (
  tavernV2: TavernCardV2
): NovelFormState => {  const { data } = tavernV2;
  const { extensions } = data;
  const mikugg_v2 = extensions.mikugg_v2;

  const characters = mikugg_v2.outfits.map((outfit) => ({
    id: outfit.id,
    name: data.name,
    profile_pic: mikugg_v2.profile_pic,
    short_description: mikugg_v2.short_description,
    tags: data.tags,
    card: {
      ...tavernV2,
      data: {
        ...data,
        extensions: {
          mikugg_v2: {
            ...mikugg_v2,
            outfits: [outfit],
          },
        },
      },
    },
    nsfw: outfit.nsfw || NovelNSFW.NONE,
  }));

  const backgrounds = mikugg_v2.backgrounds.map((background) => ({
    id: background.id,
    name: background.description,
    description: background.description,
    attributes: [],
    source: {
      jpg: background.source,
    },
  }));

  const songs = mikugg_v2.sounds?.map((sound) => ({
    id: sound.id,
    name: sound.name,
    description: '',
    tags: [],
    source: sound.source,
  })) || [];

  return {
    title: data.name,
    description: data.description,
    tags: data.tags,
    logoPic: mikugg_v2.profile_pic,
    author: data.creator,
    characters,
    backgrounds,
    songs,
    maps: [],
    scenes: [],
    starts: [],
  };
};
