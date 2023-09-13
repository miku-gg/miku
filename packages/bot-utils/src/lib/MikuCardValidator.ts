import { MikuCard } from '@mikugg/extensions';
import { DEFAULT_MUSIC } from '..';
export { MikuCard, TavernCardV2 } from '@mikugg/extensions';

export const LICENSES = [
  'CC0',
  'CC BY',
  'CC BY-SA',
  'CC BY-ND',
  'CC BY-NC',
  'CC BY-NC-SA',
  'CC BY-NC-ND'
];

export const EMOTION_GROUP_TEMPLATES = {
  'base-emotions': {
    id: 'base-emotions',
    label: 'Base emotions',
    emotionIds: ['angry', 'sad', 'happy', 'disgusted', 'begging', 'scared', 'excited', 'hopeful', 'longing', 'proud', 'neutral', 'rage', 'scorn', 'blushed', 'pleasure', 'lustful', 'shocked', 'confused', 'disappointed', 'embarrassed', 'guilty', 'shy', 'frustrated', 'annoyed', 'exhausted', 'tired', 'curious', 'intrigued', 'amused']
  },
  'lewd-emotions': {
    id: 'lewd-emotions',
    label: 'Lewd emotions',
    emotionIds: ['desire', 'pleasure', 'anticipation', 'condescension', 'arousal', 'ecstasy', 'relief', 'release', 'intensity', 'comfort', 'humiliation', 'discomfort', 'submission', 'pain', 'teasing', 'arrogant']
  }
};

export const EMPTY_MIKU_CARD: MikuCard = {
  "spec": "chara_card_v2",
  "spec_version": "2.0",
  "data": {
    "name": "",
    "character_version": "1",
    "system_prompt": "",
    "description": "",
    "personality": "",
    "scenario": "",
    "first_mes": "",
    "mes_example": "",
    "alternate_greetings": [],
    "post_history_instructions": "",
    "creator_notes": "",
    "tags": [],
    "creator": "",
    "extensions": {
      "mikugg": {
        "license": "CC BY",
        "language": "en",
        "profile_pic": "",
        "short_description": "",
        "start_scenario": "default",
        "scenarios": [
          {
            "id": "default",
            "name": "",
            "children_scenarios": [],
            "context": "",
            "trigger_suggestion_similarity": "",
            "trigger_action": "",
            "background": "",
            "emotion_group": "",
            "voice": "",
            "music": ""
          }
        ],
        "emotion_groups": [],
        "backgrounds": [],
        "voices": [
          {
            id: 'azure_tts.en-GB-SoniaNeural',
            provider: 'azure_tts',
            provider_voice_id: 'en-GB-SoniaNeural',
            provider_emotion: 'sad'
          }
        ],
        "sounds": []
      }
    }
  }
}

export function validateMikuCard(card: MikuCard): string[] {
  const errors: string[] = [];
  const { mikugg } = card.data.extensions;
  if (!mikugg.scenarios.length)
    errors.push('extensions.mikugg.scenarios is empty');
  if (!mikugg.backgrounds.length)
    errors.push('extensions.mikugg.backgrounds is empty');
  if (!mikugg.emotion_groups.length)
    errors.push('extensions.mikugg.emotion_groups is empty');
  if (!mikugg.voices.length)
    errors.push('extensions.mikugg.voices is empty');

  const scenarios = new Map<string, typeof mikugg.scenarios[0]>();
  const backgrounds = new Map<string, typeof mikugg.backgrounds[0]>();
  const emotion_groups = new Map<string, typeof mikugg.emotion_groups[0]>();
  const voices = new Map<string, typeof mikugg.voices[0]>();
  const sounds = new Map<string, { id: string, name: string, source: string }>();

  mikugg.scenarios.forEach(scenario => scenarios.set(scenario.id, scenario));
  mikugg.backgrounds.forEach(background => backgrounds.set(background.id, background));
  mikugg.emotion_groups.forEach(emotion_group => emotion_groups.set(emotion_group.id, emotion_group));
  mikugg.voices.forEach(voice => voices.set(voice.id, voice));
  mikugg.sounds?.forEach(sound => sounds.set(sound.id, sound));
  
  // check start scenario
  if (!scenarios.has(mikugg.start_scenario))
    errors.push('start_scenario not found in scenarios');

  // check scenarios
  for (const scenario of mikugg.scenarios) {
    if (!backgrounds.has(scenario.background))
      errors.push(`${scenario.id}: ${scenario.background} not found in mikugg.backgrounds`)
    if (!emotion_groups.has(scenario.emotion_group))
      errors.push(`${scenario.id}: ${scenario.emotion_group} not found in mikugg.emotion_groups`)
    if (!voices.has(scenario.voice))
      errors.push(`${scenario.id}: ${scenario.voice} not found in mikugg.voices`)

    for (const child_scenario of scenario.children_scenarios)
      if (!scenarios.has(child_scenario))
        errors.push(`${scenario.id}: ${child_scenario} not found in children_scenarios`);

    if (!sounds.has(scenario.music || '') && !DEFAULT_MUSIC.includes(scenario.music || '')) {
      errors.push(`${scenario.id}: ${scenario.music} not found in mikugg.sounds`)
    }
   }

  // check license
  if (!LICENSES.includes(mikugg.license))
    errors.push(`Invalid mikugg.license ${mikugg.license}. Please use one of ${LICENSES.join(' | ')}`);
  
  // check emotion_groups
  for (const [_, emotion_group] of emotion_groups) {
    if (!Object.keys(EMOTION_GROUP_TEMPLATES).includes(emotion_group.template)) {
      errors.push(`${emotion_group.id}: Invalid emotion group template ${emotion_group.template}`)
    } else {
      const emotions_ids = new Map<string, string[]>(emotion_group.emotions.map(emotion => [emotion.id, emotion.source]));

      // check each emotion has valid or null sound
      for (const emotion of emotion_group.emotions) {
        if (emotion.sound && !sounds.has(emotion.sound))
          errors.push(`${emotion_group.id}: ${emotion.id}: ${emotion.sound} not found in mikugg.sounds`)
      }

      // eslint-disable-next-line
      // @ts-ignore
      for (const template_emotion_id of EMOTION_GROUP_TEMPLATES[emotion_group.template].emotionIds) {
        if (!emotions_ids.has(template_emotion_id))
          errors.push(`mikugg.emotion_groups ${emotion_group.id}: ${template_emotion_id} not found`)
        else if (!emotions_ids.get(template_emotion_id)?.length)
          errors.push(`mikugg.emotion_groups ${emotion_group.id}: no source files for ${template_emotion_id}`)
      }
    }
  }

  return errors;
}