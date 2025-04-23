import { DEFAULT_MUSIC } from '..';

export type LorebookEntry = Array<{
  keys: Array<string>;
  content: string;
  extensions: Record<string, any>;
  enabled: boolean;
  insertion_order: number; // if two entries inserted, lower "insertion order" = inserted higher
  case_sensitive?: boolean;

  // FIELDS WITH NO CURRENT EQUIVALENT IN SILLY
  name?: string; // not used in prompt engineering
  priority?: number; // if token budget reached, lower priority value = discarded first

  // FIELDS WITH NO CURRENT EQUIVALENT IN AGNAI
  id?: number; // not used in prompt engineering
  comment?: string; // not used in prompt engineering
  selective?: boolean; // if `true`, require a key from both `keys` and `secondary_keys` to trigger the entry
  secondary_keys?: Array<string>; // see field `selective`. ignored if selective == false
  constant?: boolean; // if true, always inserted in the prompt (within budget limit)
  position?: 'before_char' | 'after_char'; // whether the entry is placed before or after the character defs
}>;

export type CharacterBook = {
  name?: string;
  description?: string;
  scan_depth?: number; // agnai: "Memory: Chat History Depth"
  token_budget?: number; // agnai: "Memory: Context Limit"
  recursive_scanning?: boolean; // no agnai equivalent. whether entry content can trigger other entries
  extensions: Record<string, any>;
  entries: LorebookEntry;
};

export type TavernCardV2 = {
  spec: 'chara_card_v2';
  spec_version: '2.0'; // May 8th addition
  data: {
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;

    // New fields start here
    creator_notes: string;
    system_prompt: string;
    post_history_instructions: string;
    alternate_greetings: Array<string>;

    // May 8th additions
    tags: Array<string>;
    creator: string;
    character_version: string;
    extensions: Record<string, any>;

    character_book?: CharacterBook;
  };
};

export type MikuCard = TavernCardV2 & {
  data: {
    extensions: {
      mikugg: {
        license: string; // LICENSE of the bot, set by the bot author
        language: string; // Indicates the language of the bot, NOT used in the prompt
        short_description: string; // Small description of the bot, NOT used in the prompt
        profile_pic: string; // profile pic of the bot
        start_scenario: string; // id of the first scenario
        scenarios: {
          // scenarios of the bot conversation
          id: string; // id of the scenario
          name: string; // name of the scenario, only of labels in editor
          children_scenarios: string[]; // ids of the scenarios that can be triggered from this scenario
          context: string; // value to be inserted in the prompt when the scenario is triggered
          trigger_suggestion_similarity: string; // keywords that can trigger this scenario, NOT in prompt
          trigger_action: string; // text of the button that triggers this scenario, NOT in prompt
          background: string; // id of the background to be used in this scenario
          emotion_group: string; // id of the bot's emotion group to be used in this scenario
          voice: string; // id of the bot's voice to be used in this scenario
          music?: string; // id of the music to be used in this scenario
        }[];
        emotion_groups: {
          id: string; // id of the emotion group
          name: string; // name of the emotion group, NOT used in the prompt
          template: string; // template of group of emotions to be used
          emotions: {
            // list of emotions of the group, derived from the template
            id: string; // id of the emotion
            source: string[]; // [idleImg, talkingImg, ...], can be png or webm
            sound?: string; // id of the sound to be used when the emotion is triggered
          }[];
        }[];
        backgrounds: {
          id: string; // id of the background
          description: string; // description of the background, NOT used in the prompt
          source: string; // hash of the background image, can be jpg, png or webm
        }[];
        voices: {
          id: string; // id of the voice
          provider: string; // provider of the voice (elevenlabs or azure)
          provider_voice_id: string; // id of the voice in the provider
          provider_emotion?: string; // emotion of the voice in the provider (optional)
          training_sample?: string; // text sample used to train the voice (optional)
        }[];
        sounds?: {
          id: string; // id of the music
          name: string; // name of the music, NOT used in the prompt
          source: string; // hash of the music file, can be mp3 or ogg
        }[];
      };
    };
  };
};

export type MikuCardV2 = TavernCardV2 & {
  data: {
    extensions: {
      mikugg_v2: {
        license: string; // LICENSE of the bot, set by the bot author
        language: string; // Indicates the language of the bot, NOT used in the prompt
        short_description: string; // Small description of the bot, NOT used in the prompt
        profile_pic: string; // profile pic of the bot
        nsfw?: number; // indicates if the prompt is mainly NSFW (0: false, 1: nudity, 2: explicit)
        voice?: string; // reference audio for bot's voice to be used in this scenario
        outfits: {
          id: string; // id of the outfit
          name: string; // name of the outfit
          description: string; // description of the outfit
          attributes: string[][]; // attributes of the outfit
          template: string; // template of group of emotions to be used
          nsfw?: number; // whether the outfit is NSFW (0: false, 1: nudity, 2: explicit)
          generationData?: {
            headPrompt: string; // prompt that was used to generate the head of the outfit
            prompt: string; // prompt that was used to generate the outfit
            modelToUse: number; // model that was used to generate the outfit
            seed: string; // seed that was used to generate the outfit
            poseImage?: string; // pose that was used to generate the outfit
            referenceImage?: string; // reference image that was used to generate the outfit
          };
          emotions: {
            // list of emotions of the group, derived from the template
            id: string; // id of the emotion
            sources: {
              png: string;
              webm?: string;
              sound?: string; // id of the sound to be used when the emotion is triggered
            };
          }[];
        }[];
      };
    };
  };
};

export const LICENSES = ['CC0', 'CC BY', 'CC BY-SA', 'CC BY-ND', 'CC BY-NC', 'CC BY-NC-SA', 'CC BY-NC-ND'];

export type EmotionTemplateSlug = 'single-emotion' | 'tiny-emotions' | 'base-emotions' | 'lewd-emotions';

export const EMOTION_GROUP_TEMPLATES: Record<
  EmotionTemplateSlug,
  {
    id: string;
    label: string;
    emotionIds: string[];
  }
> = {
  'single-emotion': {
    id: 'single-emotion',
    label: 'Single emotion',
    emotionIds: ['neutral'],
  },
  'tiny-emotions': {
    id: 'tiny-emotions',
    label: 'Tiny emotions',
    emotionIds: ['angry', 'sad', 'happy', 'disgusted', 'scared', 'embarrased', 'surprised', 'neutral', 'confused'],
  },
  'base-emotions': {
    id: 'base-emotions',
    label: 'Base emotions',
    emotionIds: [
      'angry',
      'sad',
      'happy',
      'disgusted',
      'begging',
      'scared',
      'excited',
      'hopeful',
      'longing',
      'proud',
      'neutral',
      'rage',
      'scorn',
      'blushed',
      'pleasure',
      'lustful',
      'shocked',
      'confused',
      'disappointed',
      'embarrassed',
      'guilty',
      'shy',
      'frustrated',
      'annoyed',
      'exhausted',
      'tired',
      'curious',
      'intrigued',
      'amused',
    ],
  },
  'lewd-emotions': {
    id: 'lewd-emotions',
    label: 'Lewd emotions',
    emotionIds: [
      'desire',
      'pleasure',
      'anticipation',
      'condescension',
      'arousal',
      'ecstasy',
      'relief',
      'release',
      'intensity',
      'comfort',
      'humiliation',
      'discomfort',
      'submission',
      'pain',
      'teasing',
      'arrogant',
    ],
  },
};

export const EMPTY_MIKU_CARD: MikuCard = {
  spec: 'chara_card_v2',
  spec_version: '2.0',
  data: {
    name: '',
    character_version: '1',
    system_prompt: '',
    description: '',
    personality: '',
    scenario: '',
    first_mes: '',
    mes_example: '',
    alternate_greetings: [],
    post_history_instructions: '',
    creator_notes: '',
    tags: [],
    creator: '',
    extensions: {
      mikugg: {
        license: 'CC BY',
        language: 'en',
        profile_pic: '',
        short_description: '',
        start_scenario: 'default',
        scenarios: [
          {
            id: 'default',
            name: '',
            children_scenarios: [],
            context: '',
            trigger_suggestion_similarity: '',
            trigger_action: '',
            background: '',
            emotion_group: '',
            voice: '',
            music: '',
          },
        ],
        emotion_groups: [],
        backgrounds: [],
        voices: [
          {
            id: 'azure_tts.en-GB-SoniaNeural',
            provider: 'azure_tts',
            provider_voice_id: 'en-GB-SoniaNeural',
            provider_emotion: 'sad',
          },
        ],
        sounds: [],
      },
    },
  },
};

export function validateMikuCard(card: MikuCard): string[] {
  const errors: string[] = [];
  const { mikugg } = card.data.extensions;
  if (!mikugg.scenarios.length) errors.push('extensions.mikugg.scenarios is empty');
  if (!mikugg.backgrounds.length) errors.push('extensions.mikugg.backgrounds is empty');
  if (!mikugg.emotion_groups.length) errors.push('extensions.mikugg.emotion_groups is empty');
  if (!mikugg.voices.length) errors.push('extensions.mikugg.voices is empty');

  const scenarios = new Map<string, (typeof mikugg.scenarios)[0]>();
  const backgrounds = new Map<string, (typeof mikugg.backgrounds)[0]>();
  const emotion_groups = new Map<string, (typeof mikugg.emotion_groups)[0]>();
  const voices = new Map<string, (typeof mikugg.voices)[0]>();
  const sounds = new Map<string, { id: string; name: string; source: string }>();

  mikugg.scenarios.forEach((scenario) => scenarios.set(scenario.id, scenario));
  mikugg.backgrounds.forEach((background) => backgrounds.set(background.id, background));
  mikugg.emotion_groups.forEach((emotion_group) => emotion_groups.set(emotion_group.id, emotion_group));
  mikugg.voices.forEach((voice) => voices.set(voice.id, voice));
  mikugg.sounds?.forEach((sound) => sounds.set(sound.id, sound));

  // check start scenario
  if (!scenarios.has(mikugg.start_scenario)) errors.push('start_scenario not found in scenarios');

  // check scenarios
  for (const scenario of mikugg.scenarios) {
    if (!backgrounds.has(scenario.background))
      errors.push(`${scenario.id}: ${scenario.background} not found in mikugg.backgrounds`);
    if (!emotion_groups.has(scenario.emotion_group))
      errors.push(`${scenario.id}: ${scenario.emotion_group} not found in mikugg.emotion_groups`);
    if (!voices.has(scenario.voice)) errors.push(`${scenario.id}: ${scenario.voice} not found in mikugg.voices`);

    for (const child_scenario of scenario.children_scenarios)
      if (!scenarios.has(child_scenario))
        errors.push(`${scenario.id}: ${child_scenario} not found in children_scenarios`);

    if (scenario.music && !sounds.has(scenario.music || '') && !DEFAULT_MUSIC.includes(scenario.music || '')) {
      errors.push(`${scenario.id}: ${scenario.music} not found in mikugg.sounds`);
    }
  }

  // check license
  if (!LICENSES.includes(mikugg.license))
    errors.push(`Invalid mikugg.license ${mikugg.license}. Please use one of ${LICENSES.join(' | ')}`);

  // check emotion_groups
  for (const [_, emotion_group] of emotion_groups) {
    if (!Object.keys(EMOTION_GROUP_TEMPLATES).includes(emotion_group.template)) {
      errors.push(`${emotion_group.id}: Invalid emotion group template ${emotion_group.template}`);
    } else {
      const emotions_ids = new Map<string, string[]>(
        emotion_group.emotions.map((emotion) => [emotion.id, emotion.source]),
      );

      // check each emotion has valid or null sound
      for (const emotion of emotion_group.emotions) {
        if (emotion.sound && !sounds.has(emotion.sound))
          errors.push(`${emotion_group.id}: ${emotion.id}: ${emotion.sound} not found in mikugg.sounds`);
      }

      // eslint-disable-next-line
      // @ts-ignore
      for (const template_emotion_id of EMOTION_GROUP_TEMPLATES[emotion_group.template].emotionIds) {
        if (!emotions_ids.has(template_emotion_id))
          errors.push(`mikugg.emotion_groups ${emotion_group.id}: ${template_emotion_id} not found`);
        else if (!emotions_ids.get(template_emotion_id)?.length)
          errors.push(`mikugg.emotion_groups ${emotion_group.id}: no source files for ${template_emotion_id}`);
      }
    }
  }

  return errors;
}

export function validateMikuCardV2(card: MikuCardV2): string[] {
  const errors = [];
  const { mikugg_v2 } = card.data.extensions;

  if (!mikugg_v2?.language) errors.push('extensions.mikugg_v2.language is empty');
  if (!mikugg_v2?.profile_pic) errors.push('extensions.mikugg_v2.profile_pic is empty');
  if (!mikugg_v2?.short_description) errors.push('extensions.mikugg_v2.short_description is empty');

  if (!mikugg_v2?.outfits?.length) errors.push('extensions.mikugg_v2.outfits is empty');

  const outfits = new Map<string, (typeof mikugg_v2.outfits)[0]>();
  mikugg_v2.outfits.forEach((outfit) => outfits.set(outfit.id, outfit));

  for (const outfit of mikugg_v2.outfits) {
    if (!Object.keys(EMOTION_GROUP_TEMPLATES).includes(outfit.template)) {
      errors.push(`${outfit.id}: Invalid outfit template ${outfit.template}`);
    } else {
      const emotions_ids = new Map<string, string[]>(
        outfit.emotions.map((emotion) => [emotion.id, Object.values(emotion.sources)]),
      );

      // eslint-disable-next-line
      // @ts-ignore
      for (const template_emotion_id of EMOTION_GROUP_TEMPLATES[outfit.template].emotionIds) {
        if (!emotions_ids.has(template_emotion_id))
          errors.push(`mikugg_v2.outfits ${outfit.id}: ${template_emotion_id} not found`);
        else if (!emotions_ids.get(template_emotion_id)?.length)
          errors.push(`mikugg_v2.outfits ${outfit.id}: no source files for ${template_emotion_id}`);
      }
    }
  }

  return errors;
}
