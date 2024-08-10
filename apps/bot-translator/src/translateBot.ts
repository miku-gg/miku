import { Configuration, OpenAIApi } from 'openai';
import { TavernCardV2 } from '@mikugg/bot-utils';

type Language = 'en' | 'es' | 'ko' | 'cn' | 'jp' | 'ru';

export const languageCodeToName = new Map<Language, string>([
  // ['en', 'English'],
  ['es', 'Spanish'],
  ['ko', 'Korean'],
  ['cn', 'Chinese'],
  ['jp', 'Japanese'],
  ['ru', 'Russian'],
]);

let openai: OpenAIApi | null;

async function translateText(text: string, language: Language): Promise<string> {
  if (!text) return '';
  if (!openai) {
    throw new Error('OpenAI API not initialized');
  }

  const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: `Translate the following †ext template to ${languageCodeToName.get(
          language,
        )} (respond only with the template transalation, do NOT translate content in between curly braces):\n\`${text}\``,
      },
    ],
  });

  return chatCompletion.data.choices[0].message?.content || '';
}

export function initOpenAI(apiKey: string): void {
  openai = new OpenAIApi(
    new Configuration({
      apiKey,
    }),
  );
}

export async function* translateCard(card: TavernCardV2, language: Language) {
  if (!openai) {
    throw new Error('OpenAI API not initialized');
  }

  const translationPromises: Promise<string>[] = [
    translateText(card.data.description, language),
    translateText(card.data.personality, language),
    translateText(card.data.scenario, language),
    translateText(card.data.first_mes, language),
    Promise.all(card.data.mes_example.split('<START>').map((_) => translateText(_, language))).then((translations) =>
      translations.join('<START>'),
    ),
    translateText(card.data.creator_notes, language),
    translateText(card.data.system_prompt, language),
    translateText(card.data.post_history_instructions, language),
    ...card.data.alternate_greetings.map((greeting) => translateText(greeting, language)),
  ];

  const mikuggPromises: Promise<any>[] =
    card.data.extensions && card.data.extensions.mikugg
      ? [
          translateText(card.data.extensions.mikugg.short_description, language),
          ...card.data.extensions.mikugg.scenarios.map((scenario) => translateText(scenario.context, language)),
          ...card.data.extensions.mikugg.scenarios.map((scenario) => translateText(scenario.trigger_action, language)),
        ]
      : [];

  const allPromises = [...translationPromises, ...mikuggPromises];

  let completed = 0;
  let progressPromises = allPromises.map((promise, index) => {
    return {
      promise: promise.then(() => index),
      id: index,
    };
  });

  while (progressPromises.length > 0) {
    const first = await Promise.race(progressPromises.map((item) => item.promise));
    yield { completed: ++completed, total: allPromises.length };
    progressPromises = progressPromises.filter((item) => item.id !== first);
  }

  await Promise.allSettled(allPromises);

  const [
    description,
    personality,
    scenario,
    first_mes,
    mes_example,
    creator_notes,
    system_prompt,
    post_history_instructions,
    ...alternate_greetings
  ] = await Promise.all(translationPromises);

  const [short_description, ...scenarioTranslations] = await Promise.all(mikuggPromises);

  const scenarios = card.data.extensions.mikugg?.scenarios?.map((scenario, index) => ({
    ...scenario,
    context: scenarioTranslations[index * 2],
    trigger_action: scenarioTranslations[index * 2 + 1],
  }));

  const translatedCard: TavernCardV2 = {
    spec: card.spec,
    spec_version: card.spec_version,
    data: {
      ...card.data,
      name: card.data.name,
      description,
      personality,
      scenario,
      first_mes,
      mes_example,
      creator_notes,
      system_prompt,
      post_history_instructions,
      alternate_greetings,
      character_book: card.data.character_book,
      tags: card.data.tags,
      creator: card.data.creator,
      character_version: card.data.character_version,
      extensions:
        card.data.extensions && card.data.extensions.mikugg
          ? {
              mikugg: {
                license: card.data.extensions.mikugg.license,
                language,
                short_description,
                profile_pic: card.data.extensions.mikugg.profile_pic,
                start_scenario: card.data.extensions.mikugg.start_scenario,
                scenarios,
                emotion_groups: card.data.extensions.mikugg.emotion_groups,
                backgrounds: card.data.extensions.mikugg.backgrounds,
                voices: card.data.extensions.mikugg.voices,
              },
            }
          : {},
    },
  };

  yield translatedCard;
}
