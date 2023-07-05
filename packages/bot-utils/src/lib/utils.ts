import * as MikuExtensions from '@mikugg/extensions';
import { MikuCard, EMOTION_GROUP_TEMPLATES } from "./MikuCardValidator";
import { BotConfig } from "./BotConfigValidator";

export function parseAttributes(s: string): [string, string][] {
  return s.split("\n").map((x) => {
    const [a = '', b = ''] = x.split(": ");
    return [a.trim(), b.trim()];
  });
}

export function parseExampleMessages(s: string): string[] {
  return s.split("<START>\n").map((x) => x.trim()).filter(x => x);
}

const emotionTemplateSlugs = ['base-emotions', 'lewd-emotions'] as const;
export type EmotionTemplateSlug = (typeof emotionTemplateSlugs)[number];

const emotionTemplates = new Map<EmotionTemplateSlug, string>([
  ['base-emotions', 'Qmdr5ooTdADLFZA6dCvTE28neq1S7aQwZyma7266weGJZV'],
  ['lewd-emotions', 'QmPNrWHqQJK4Uj1ZsBMTUT6RAPrVRTF6ngdydm8cQZe71C'],
]);


export const mikuCardToBotConfig = (card: MikuCard): BotConfig => {
  const { mikugg } = card.data.extensions;
  const scenario = mikugg.scenarios.find(_scneario => _scneario.id === mikugg.start_scenario); 
  const voice = mikugg.voices.find(_voice => _voice.id === scenario?.voice);
  return {
    bot_name: card.data.name,
    version: card.data.character_version,
    description: mikugg.short_description,
    author: card.data.creator,
    configVersion: 2,
    subject: "Anon",
    profile_pic: mikugg.profile_pic,
    backgrounds: mikugg.backgrounds,
    short_term_memory: {
      service: MikuExtensions.Services.ServicesNames.GPTShortTermMemoryV2,
      props: {
        prompt_context: "",
        prompt_initiator: "",
        language: "en",
        subjects: [
          "Anon"
        ],
        botSubject: card.data.name,
        buildStrategySlug: "alpaca",
        parts: {
          "persona": card.data.description,
          "attributes": parseAttributes(card.data.personality),
          "sampleChat": parseExampleMessages(card.data.mes_example),
          "scenario": card.data.scenario,
          "greeting": card.data.first_mes,
          "botSubject": card.data.name
        }
      }
    },
    "prompt_completer": {
      "service": MikuExtensions.Services.ServicesNames.Oobabooga,
      "props": {
        "model": "llama-30b"
      }
    },
    "outputListeners": [
      {
        // eslint-disable-next-line
        // @ts-ignore
        "service": voice?.provider || MikuExtensions.Services.ServicesNames.AzureTTS,
        "props": {
          "voiceId": voice?.provider_voice_id  || "en-US-AriaNeural",
          "emotion": voice?.provider_emotion || "neutral",
        }
      },
      {
        "service": MikuExtensions.Services.ServicesNames.SBertEmotionInterpreter,
        "props": {
          "model": "all-MiniLM-L6-v2",
          "start_context": mikugg.start_scenario,
          "context_base_description_embeddings": "",
          "contexts": mikugg.scenarios.map((scenario) => {
            const emotion_group = mikugg.emotion_groups.find(_emotion_group => _emotion_group.id === scenario?.emotion_group);
            return {
              id: scenario.id,
              "context_change_trigger": scenario.context,
              "emotion_embeddings": emotionTemplates.get(emotion_group?.template as EmotionTemplateSlug) || "",
              "emotion_images": emotion_group?.emotions.map(emotion => ({
                id: emotion.id,
                hashes: emotion.source
              })),
            }
          })
        }
      }
    ]
  }
}
