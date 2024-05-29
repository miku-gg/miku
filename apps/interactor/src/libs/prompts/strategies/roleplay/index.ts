import {
  AbstractRoleplayStrategy,
  RoleplayStrategyAlpaca,
  RoleplayStrategyMetharme,
  RoleplayStrategyLlama3,
  RoleplayStrategyVicuna,
} from '..'
import { language } from '../../../lang/i18n'

export const roleplayStrategySlugs = [
  'alpacarp',
  'metharmerp',
  'vicunarp',
  'llama3rp',
] as const
export type RoleplayStrategySlug = (typeof roleplayStrategySlugs)[number]
export function isOfTypeStrategySlug(
  slug: string | undefined
): slug is RoleplayStrategySlug {
  return typeof slug === typeof undefined
    ? false
    : (roleplayStrategySlugs as readonly string[]).includes(slug!)
}

export const getRoleplayStrategyFromSlug = (
  slug: RoleplayStrategySlug,
  tokenizerSlug: string = 'llama'
): AbstractRoleplayStrategy => {
  switch (slug) {
    case 'alpacarp':
      return new RoleplayStrategyAlpaca(tokenizerSlug)
    case 'metharmerp':
      return new RoleplayStrategyMetharme(tokenizerSlug)
    case 'llama3rp':
      return new RoleplayStrategyLlama3(tokenizerSlug)
    case 'vicunarp':
      return new RoleplayStrategyVicuna(tokenizerSlug)
    default:
      throw new Error(`Invalid roleplay strategy slug: ${slug}`)
  }
}

type i18nPromptKeys =
  // Alpaca
  | 'ALPACA_TEMPLATE__AVOID_REPETITION'
  | 'ALPACA_TEMPLATE__NO_USER_ACTION'
  | 'ALPACA_TEMPLATE__REACTION'
  | 'ALPACA_TEMPLATE__REPEAT_REACTION'
  | 'ALPACA_TEMPLATE__REACTION_MUST_BE_ONE_OF'
  | 'ALPACA_TEMPLATE__TALK'
  // Llama
  | 'LLAMA_TEMPLATE__AVOID_REPETITION'
  | 'LLAMA_TEMPLATE__NO_USER_ACTION'
  | 'LLAMA_TEMPLATE__REACTION'
  | 'LLAMA_TEMPLATE__REPEAT_REACTION'
  | 'LLAMA_TEMPLATE__TALK'
  // Metharme
  | 'METHARME_TEMPLATE__PERSONA'
  | 'METHARME_TEMPLATE__AVOID_REPETITION'
  | 'METHARME_TEMPLATE__NO_USER_ACTION'
  | 'METHARME_TEMPLATE__REACTION'
  | 'METHARME_TEMPLATE__REPEAT_REACTION'
  | 'METHARME_TEMPLATE__REACTION_MUST_BE_ONE_OF'
  | 'METHARME_TEMPLATE__TALK'
  // Vicuna
  | 'VICUNA_TEMPLATE__AVOID_REPETITION'
  | 'VICUNA_TEMPLATE__NO_USER_ACTION'
  | 'VICUNA_TEMPLATE__REACTION'
  | 'VICUNA_TEMPLATE__REPEAT_REACTION'
  | 'VICUNA_TEMPLATE__REACTION_MUST_BE_ONE_OF'
  | 'VICUNA_TEMPLATE__TALK'

type i18nPromptObject = Record<i18nPromptKeys, string>

const jp: i18nPromptObject = {
  ALPACA_TEMPLATE__AVOID_REPETITION: `繰り返しを避け、ループを回さないでください。プロットをゆっくりと展開し、常にキャラクターにとどまります。すべての行動を詳細に、緻密に、明示的に、グラフィックで、鮮明に描写します。すべての関連する感覚知覚を言及します。`,
  ALPACA_TEMPLATE__NO_USER_ACTION: `{{user}}の行動や対話を説明しないでください。{{char}}の行動と対話のみを説明してください。`,
  ALPACA_TEMPLATE__REACTION: `応答には{{char}}の反応も示さなければなりません。`,
  ALPACA_TEMPLATE__REPEAT_REACTION: `同じ反応を繰り返しすぎないようにしてください。`,
  ALPACA_TEMPLATE__REACTION_MUST_BE_ONE_OF: `反応は次のいずれかでなければなりません:`,
  ALPACA_TEMPLATE__TALK: `{{char}}が話す方法`,

  LLAMA_TEMPLATE__AVOID_REPETITION: `繰り返しを避け、ループを回さないでください。プロットをゆっくりと展開し、常にキャラクターにとどまります。すべての行動を詳細に、緻密に、明示的に、グラフィックで、鮮明に描写します。すべての関連する感覚知覚を言及します。`,
  LLAMA_TEMPLATE__NO_USER_ACTION: `{{user}}の行動や対話を説明しないでください。{{char}}の行動と対話のみを説明してください。`,
  LLAMA_TEMPLATE__REACTION: `応答には{{char}}の反応も示さなければなりません。`,
  LLAMA_TEMPLATE__REPEAT_REACTION: `同じ反応を繰り返しすぎないようにしてください。`,
  LLAMA_TEMPLATE__TALK: `{{char}}が話す方法`,

  METHARME_TEMPLATE__PERSONA: `{{char}}のペルソナ:`,
  METHARME_TEMPLATE__AVOID_REPETITION: `繰り返しを避け、ループを回さないでください。プロットをゆっくりと展開し、常にキャラクターにとどまります。すべての行動を詳細に、緻密に、明示的に、グラフィックで、鮮明に描写します。すべての関連する感覚知覚を言及します。`,
  METHARME_TEMPLATE__NO_USER_ACTION: `{{user}}の行動や対話を説明しないでください。{{char}}の行動と対話のみを説明してください。`,
  METHARME_TEMPLATE__REACTION: `応答には{{char}}の反応も示さなければなりません。`,
  METHARME_TEMPLATE__REPEAT_REACTION: `同じ反応を繰り返しすぎないようにしてください。`,
  METHARME_TEMPLATE__REACTION_MUST_BE_ONE_OF: `反応は次のいずれかでなければなりません:`,
  METHARME_TEMPLATE__TALK: `{{char}}が話す方法:`,

  VICUNA_TEMPLATE__AVOID_REPETITION: `繰り返しを避け、ループを回さないでください。プロットをゆっくりと展開し、常にキャラクターにとどまります。すべての行動を詳細に、緻密に、明示的に、グラフィックで、鮮明に描写します。すべての関連する感覚知覚を言及します。`,
  VICUNA_TEMPLATE__NO_USER_ACTION: `{{user}}の行動や対話を説明しないでください。{{char}}の行動と対話のみを説明してください。`,
  VICUNA_TEMPLATE__REACTION: `応答には{{char}}の反応も示さなければなりません。`,
  VICUNA_TEMPLATE__REPEAT_REACTION: `同じ反応を繰り返しすぎないようにしてください。`,
  VICUNA_TEMPLATE__REACTION_MUST_BE_ONE_OF: `反応は次のいずれかでなければなりません:`,
  VICUNA_TEMPLATE__TALK: `{{char}}が話す方法`,
}
const en: i18nPromptObject = {
  ALPACA_TEMPLATE__AVOID_REPETITION: `Avoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`,
  ALPACA_TEMPLATE__NO_USER_ACTION: `DO NOT describe {{user}}'s actions or dialogues, ONLY describe {{char}}'s actions and dialogue.`,
  ALPACA_TEMPLATE__REACTION: `You must also indicate {{char}}'s reaction in the response.`,
  ALPACA_TEMPLATE__REPEAT_REACTION: `You MUST not repeat the same reaction too many times.`,
  ALPACA_TEMPLATE__REACTION_MUST_BE_ONE_OF: `The reaction MUST be one of:`,
  ALPACA_TEMPLATE__TALK: `This is how {{char}} should talk`,

  LLAMA_TEMPLATE__AVOID_REPETITION: `Avoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`,
  LLAMA_TEMPLATE__NO_USER_ACTION: `DO NOT describe {{user}}'s actions or dialogues, ONLY describe {{char}}'s actions and dialogue.`,
  LLAMA_TEMPLATE__REACTION: `You must also indicate {{char}}'s reaction in the response.`,
  LLAMA_TEMPLATE__REPEAT_REACTION: `You MUST not repeat the same reaction too many times.`,
  LLAMA_TEMPLATE__TALK: `This is how {{char}} should talk`,

  METHARME_TEMPLATE__PERSONA: `{{char}}'s Persona:`,
  METHARME_TEMPLATE__AVOID_REPETITION: `Avoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`,
  METHARME_TEMPLATE__NO_USER_ACTION: `DO NOT describe {{user}}'s actions or dialogues, ONLY describe {{char}}'s actions and dialogue.`,
  METHARME_TEMPLATE__REACTION: `You must also indicate {{char}}'s reaction in the response.`,
  METHARME_TEMPLATE__REPEAT_REACTION: `You MUST not repeat the same reaction too many times.`,
  METHARME_TEMPLATE__REACTION_MUST_BE_ONE_OF: `The reaction MUST be one of:`,
  METHARME_TEMPLATE__TALK: `This is how {{char}} should talk:`,

  VICUNA_TEMPLATE__AVOID_REPETITION: `Avoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`,
  VICUNA_TEMPLATE__NO_USER_ACTION: `DO NOT describe {{user}}'s actions or dialogues, ONLY describe {{char}}'s actions and dialogue.`,
  VICUNA_TEMPLATE__REACTION: `You must also indicate {{char}}'s reaction in the response.`,
  VICUNA_TEMPLATE__REPEAT_REACTION: `You MUST not repeat the same reaction too many times.`,
  VICUNA_TEMPLATE__REACTION_MUST_BE_ONE_OF: `The reaction MUST be one of:`,
  VICUNA_TEMPLATE__TALK: `This is how {{char}} should talk`,
}

const es: i18nPromptObject = {
  ALPACA_TEMPLATE__AVOID_REPETITION: `Evita la repetición, no hagas bucles. Desarrolla la trama lentamente, siempre mantente en el personaje. Describe todas las acciones en detalle, elabora, explícito, gráfico y vívido. Menciona todas las percepciones sensoriales relevantes.`,
  ALPACA_TEMPLATE__NO_USER_ACTION: `NO describas las acciones o diálogos de {{user}}, SOLO describe las acciones y el diálogo de {{char}}.`,
  ALPACA_TEMPLATE__REACTION: `También debes indicar la reacción de {{char}} en la respuesta.`,
  ALPACA_TEMPLATE__REPEAT_REACTION: `NO repitas la misma reacción demasiadas veces.`,
  ALPACA_TEMPLATE__REACTION_MUST_BE_ONE_OF: `La reacción DEBE ser una de:`,
  ALPACA_TEMPLATE__TALK: `Así es como {{char}} debería hablar`,

  LLAMA_TEMPLATE__AVOID_REPETITION: `Evita la repetición, no hagas bucles. Desarrolla la trama lentamente, siempre mantente en el personaje. Describe todas las acciones en detalle, elabora, explícito, gráfico y vívido. Menciona todas las percepciones sensoriales relevantes.`,
  LLAMA_TEMPLATE__NO_USER_ACTION: `NO describas las acciones o diálogos de {{user}}, SOLO describe las acciones y el diálogo de {{char}}.`,
  LLAMA_TEMPLATE__REACTION: `También debes indicar la reacción de {{char}} en la respuesta.`,
  LLAMA_TEMPLATE__REPEAT_REACTION: `NO repitas la misma reacción demasiadas veces.`,
  LLAMA_TEMPLATE__TALK: `Así es como {{char}} debería hablar`,

  METHARME_TEMPLATE__PERSONA: `Persona de {{char}}:`,
  METHARME_TEMPLATE__AVOID_REPETITION: `Evita la repetición, no hagas bucles. Desarrolla la trama lentamente, siempre mantente en el personaje. Describe todas las acciones en detalle, elabora, explícito, gráfico y vívido. Menciona todas las percepciones sensoriales relevantes.`,
  METHARME_TEMPLATE__NO_USER_ACTION: `NO describas las acciones o diálogos de {{user}}, SOLO describe las acciones y el diálogo de {{char}}.`,
  METHARME_TEMPLATE__REACTION: `También debes indicar la reacción de {{char}} en la respuesta.`,
  METHARME_TEMPLATE__REPEAT_REACTION: `NO repitas la misma reacción demasiadas veces.`,
  METHARME_TEMPLATE__REACTION_MUST_BE_ONE_OF: `La reacción DEBE ser una de:`,
  METHARME_TEMPLATE__TALK: `Así es como {{char}} debería hablar:`,

  VICUNA_TEMPLATE__AVOID_REPETITION: `Evita la repetición, no hagas bucles. Desarrolla la trama lentamente, siempre mantente en el personaje. Describe todas las acciones en detalle, elabora, explícito, gráfico y vívido. Menciona todas las percepciones sensoriales relevantes.`,
  VICUNA_TEMPLATE__NO_USER_ACTION: `NO describas las acciones o diálogos de {{user}}, SOLO describe las acciones y el diálogo de {{char}}.`,
  VICUNA_TEMPLATE__REACTION: `También debes indicar la reacción de {{char}} en la respuesta.`,
  VICUNA_TEMPLATE__REPEAT_REACTION: `NO repitas la misma reacción demasiadas veces.`,
  VICUNA_TEMPLATE__REACTION_MUST_BE_ONE_OF: `La reacción DEBE ser una de:`,
  VICUNA_TEMPLATE__TALK: `Así es como {{char}} debería hablar`,
}

const i18n = {
  jp,
  en,
  es,
}

export const i18nPrompt = (key: i18nPromptKeys) => {
  return i18n[language][key]
}
