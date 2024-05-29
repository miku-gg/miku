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
  | 'ALPACA_TEMPLATE__AVOID_REPETITION'
  | 'ALPACA_TEMPLATE__NO_USER_ACTION'
  | 'ALPACA_TEMPLATE__REACTION'
  | 'ALPACA_TEMPLATE__REPEAT_REACTION'
  | 'ALPACA_TEMPLATE__REACTION_MUST_BE_ONE_OF'
  | 'ALPACA_TEMPLATE__TALK'
  | 'LLAMA_TEMPLATE__AVOID_REPETITION'
  | 'LLAMA_TEMPLATE__NO_USER_ACTION'
  | 'LLAMA_TEMPLATE__REACTION'
  | 'LLAMA_TEMPLATE__REPEAT_REACTION'
  | 'LLAMA_TEMPLATE__TALK'

type i18nPromptObject = Record<i18nPromptKeys, string>

const jp: i18nPromptObject = {
  ALPACA_TEMPLATE__AVOID_REPETITION: `\n\n繰り返しを避け、ループを回さないでください。プロットをゆっくりと展開し、常にキャラクターにとどまります。すべての行動を詳細に、緻密に、明示的に、グラフィックで、鮮明に描写します。すべての関連する感覚知覚を言及します。`,
  ALPACA_TEMPLATE__NO_USER_ACTION: `{{user}}の行動や対話を説明しないでください。{{char}}の行動と対話のみを説明してください。`,
  ALPACA_TEMPLATE__REACTION: `応答には{{char}}の反応も示さなければなりません。`,
  ALPACA_TEMPLATE__REPEAT_REACTION: `同じ反応を繰り返しすぎないようにしてください。`,
  ALPACA_TEMPLATE__REACTION_MUST_BE_ONE_OF: `反応は次のいずれかでなければなりません:`,
  ALPACA_TEMPLATE__TALK: `{{char}}が話す方法\n`,

  LLAMA_TEMPLATE__AVOID_REPETITION: `\n\n繰り返しを避け、ループを回さないでください。プロットをゆっくりと展開し、常にキャラクターにとどまります。すべての行動を詳細に、緻密に、明示的に、グラフィックで、鮮明に描写します。すべての関連する感覚知覚を言及します。`,
  LLAMA_TEMPLATE__NO_USER_ACTION: `{{user}}の行動や対話を説明しないでください。{{char}}の行動と対話のみを説明してください。`,
  LLAMA_TEMPLATE__REACTION: `応答には{{char}}の反応も示さなければなりません。`,
  LLAMA_TEMPLATE__REPEAT_REACTION: `同じ反応を繰り返しすぎないようにしてください。`,
  LLAMA_TEMPLATE__TALK: `{{char}}が話す方法\n`,
}
const en: i18nPromptObject = {
  ALPACA_TEMPLATE__AVOID_REPETITION: `\n\nAvoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`,
  ALPACA_TEMPLATE__NO_USER_ACTION: `DO NOT describe {{user}}'s actions or dialogues, ONLY describe {{char}}'s actions and dialogue.`,
  ALPACA_TEMPLATE__REACTION: `You must also indicate {{char}}'s reaction in the response.`,
  ALPACA_TEMPLATE__REPEAT_REACTION: `You MUST not repeat the same reaction too many times.`,
  ALPACA_TEMPLATE__REACTION_MUST_BE_ONE_OF: `The reaction MUST be one of:`,
  ALPACA_TEMPLATE__TALK: `This is how {{char}} should talk\n`,

  LLAMA_TEMPLATE__AVOID_REPETITION: `\n\nAvoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`,
  LLAMA_TEMPLATE__NO_USER_ACTION: `DO NOT describe {{user}}'s actions or dialogues, ONLY describe {{char}}'s actions and dialogue.`,
  LLAMA_TEMPLATE__REACTION: `You must also indicate {{char}}'s reaction in the response.`,
  LLAMA_TEMPLATE__REPEAT_REACTION: `You MUST not repeat the same reaction too many times.`,
  LLAMA_TEMPLATE__TALK: `This is how {{char}} should talk\n`,
}

const es: i18nPromptObject = {
  ALPACA_TEMPLATE__AVOID_REPETITION: `\n\nEvita la repetición, no hagas bucles. Desarrolla la trama lentamente, siempre mantente en el personaje. Describe todas las acciones en detalle, elabora, explícito, gráfico y vívido. Menciona todas las percepciones sensoriales relevantes.`,
  ALPACA_TEMPLATE__NO_USER_ACTION: `NO describas las acciones o diálogos de {{user}}, SOLO describe las acciones y el diálogo de {{char}}.`,
  ALPACA_TEMPLATE__REACTION: `También debes indicar la reacción de {{char}} en la respuesta.`,
  ALPACA_TEMPLATE__REPEAT_REACTION: `NO repitas la misma reacción demasiadas veces.`,
  ALPACA_TEMPLATE__REACTION_MUST_BE_ONE_OF: `La reacción DEBE ser una de:`,
  ALPACA_TEMPLATE__TALK: `Así es como {{char}} debería hablar\n`,

  LLAMA_TEMPLATE__AVOID_REPETITION: `\n\nEvita la repetición, no hagas bucles. Desarrolla la trama lentamente, siempre mantente en el personaje. Describe todas las acciones en detalle, elabora, explícito, gráfico y vívido. Menciona todas las percepciones sensoriales relevantes.`,
  LLAMA_TEMPLATE__NO_USER_ACTION: `NO describas las acciones o diálogos de {{user}}, SOLO describe las acciones y el diálogo de {{char}}.`,
  LLAMA_TEMPLATE__REACTION: `También debes indicar la reacción de {{char}} en la respuesta.`,
  LLAMA_TEMPLATE__REPEAT_REACTION: `NO repitas la misma reacción demasiadas veces.`,
  LLAMA_TEMPLATE__TALK: `Así es como {{char}} debería hablar\n`,
}

const i18n = {
  jp,
  en,
  es,
}

export const i18nPrompt = (key: i18nPromptKeys) => {
  return i18n[language][key]
}
