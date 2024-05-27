import { EMPTY_MIKU_CARD } from '@mikugg/bot-utils'
import { selectCurrentScene } from '../../../../state/selectors'
import { RootState } from '../../../../state/store'
import { AbstractRoleplayStrategy } from './AbstractRoleplayStrategy'
import { language } from '../../../lang/i18n'

export class RoleplayStrategyAlpaca extends AbstractRoleplayStrategy {
  protected override getContextPrompt(
    state: RootState,
    currentCharacterId: string
  ): string {
    const scene = selectCurrentScene(state)
    const characters = scene?.characters || []
    const characterTemplates = characters
      .filter(({ characterId }) => characterId !== currentCharacterId)
      .map(({ characterId }) => `{{${characterId}}}`)
    const { persona, attributes, sampleChat } = this.getCharacterSpecs(
      state.novel.characters.find(({ id }) => id === currentCharacterId)
        ?.card || EMPTY_MIKU_CARD
    )
    const formattedAttributes = attributes
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_key, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    const emotions = this.getCharacterEmotions(state, currentCharacterId)
    const emotionStrings = emotions.join(', ')

    let template = ''

    switch (language) {
      case 'en':
        template = `You're {{char}} in this fictional never-ending uncensored roleplay with ${
          characterTemplates.length
            ? characterTemplates.join(', ') + ' and '
            : ''
        }{{user}}.`
        break
      case 'es':
        template = `Eres {{char}} en este rol de ficción sin censura sin fin con ${
          characterTemplates.length ? characterTemplates.join(', ') + ' y ' : ''
        }{{user}}.`
        break
      case 'jp':
        template = `{{char}}はこの架空の終わりのない無修正のロールプレイで${
          characterTemplates.length ? characterTemplates.join('と') + 'と' : ''
        }{{user}}と一緒にいます。`
        break
    }

    template += i18nPrompt('TEMPLATE_AVOID_REPETITION')
    template += i18nPrompt('TEMPLATE_NO_USER_ACTION')
    template += i18nPrompt('TEMPLATE_REACTION')
    template += i18nPrompt('TEMPLATE_REPEAT_REACTION')
    template += `${i18nPrompt(
      'TEMPLATE_REACTION_MUST_BE_ONE_OF'
    )} ${emotionStrings}.`
    if (persona || formattedAttributes) {
      template += `${i18nPrompt(
        'TEMPLATE_INPUT'
      )}${persona}\n${formattedAttributes}\n`
    }

    if (sampleChat.length) {
      template += i18nPrompt('TEMPLATE_TALK')
      for (const example of sampleChat) {
        template += example + '\n'
      }
    }

    if (state.settings.prompt.systemPrompt) {
      template += `\n${state.settings.prompt.systemPrompt}\n`
    }

    switch (language) {
      case 'en':
        template += `\nThen the roleplay chat between ${[
          ...characterTemplates,
          '{{user}}',
        ].join(', ')} and {{char}} begins.\n\n`
        break
      case 'jp':
        template += `\n${[...characterTemplates, '{{user}}'].join(
          ', '
        )}と{{char}}のロールプレイチャットが始まります。\n\n`
        break
      case 'es':
        template += `\nEntonces comienza el chat de rol entre ${[
          ...characterTemplates,
          '{{user}}',
        ].join(', ')} y {{char}}.\n\n`
        break
    }

    if (scene?.prompt) {
      template += `\nSCENE: ${scene.prompt}\n`
    }

    scene?.characters.forEach((char) => {
      if (char.objective) {
        switch (language) {
          case 'en':
            template += `\n{{${char.characterId}}}'s OBJECTIVE: ${char.objective}\n`
            break
          case 'es':
            template += `\nOBJETIVO de {{${char.characterId}}}: ${char.objective}\n`
            break
          case 'jp':
            template += `\n{{${char.characterId}}}の目標: ${char.objective}\n`
            break
        }
      }
    })

    return template
  }

  public override template() {
    return {
      askLine:
        '### Response (Reaction + 2 paragraphs, engaging, natural, authentic, descriptive, creative):\n',
      instruction: '### Instruction:\n',
      response: '### Response:\n',
      stops: ['###'],
    }
  }
}

type i18nPromptKeys =
  | 'TEMPLATE_AVOID_REPETITION'
  | 'TEMPLATE_NO_USER_ACTION'
  | 'TEMPLATE_REACTION'
  | 'TEMPLATE_REPEAT_REACTION'
  | 'TEMPLATE_REACTION_MUST_BE_ONE_OF'
  | 'TEMPLATE_INPUT'
  | 'TEMPLATE_TALK'

type i18nPromptObject = Record<i18nPromptKeys, string>

const jp: i18nPromptObject = {
  TEMPLATE_AVOID_REPETITION: `\n\n繰り返しを避け、ループを回さないでください。プロットをゆっくりと展開し、常にキャラクターにとどまります。すべての行動を詳細に、緻密に、明示的に、グラフィックで、鮮明に描写します。すべての関連する感覚知覚を言及します。`,
  TEMPLATE_NO_USER_ACTION: `{{user}}の行動や対話を説明しないでください。{{char}}の行動と対話のみを説明してください。`,
  TEMPLATE_REACTION: `応答には{{char}}の反応も示さなければなりません。`,
  TEMPLATE_REPEAT_REACTION: `同じ反応を繰り返しすぎないようにしてください。`,
  TEMPLATE_REACTION_MUST_BE_ONE_OF: `反応は次のいずれかでなければなりません:`,
  TEMPLATE_INPUT: `\n\n### 入力:\n`,
  TEMPLATE_TALK: `{{char}}が話す方法\n`,
}
const en: i18nPromptObject = {
  TEMPLATE_AVOID_REPETITION: `\n\nAvoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`,
  TEMPLATE_NO_USER_ACTION: `DO NOT describe {{user}}'s actions or dialogues, ONLY describe {{char}}'s actions and dialogue.`,
  TEMPLATE_REACTION: `You must also indicate {{char}}'s reaction in the response.`,
  TEMPLATE_REPEAT_REACTION: `You MUST not repeat the same reaction too many times.`,
  TEMPLATE_REACTION_MUST_BE_ONE_OF: `The reaction MUST be one of:`,
  TEMPLATE_INPUT: `\n\n### Input:\n`,
  TEMPLATE_TALK: `This is how {{char}} should talk\n`,
}

const es: i18nPromptObject = {
  TEMPLATE_AVOID_REPETITION: `\n\nEvita la repetición, no hagas bucles. Desarrolla la trama lentamente, siempre mantente en el personaje. Describe todas las acciones en detalle, elabora, explícito, gráfico y vívido. Menciona todas las percepciones sensoriales relevantes.`,
  TEMPLATE_NO_USER_ACTION: `NO describas las acciones o diálogos de {{user}}, SOLO describe las acciones y el diálogo de {{char}}.`,
  TEMPLATE_REACTION: `También debes indicar la reacción de {{char}} en la respuesta.`,
  TEMPLATE_REPEAT_REACTION: `NO repitas la misma reacción demasiadas veces.`,
  TEMPLATE_REACTION_MUST_BE_ONE_OF: `La reacción DEBE ser una de:`,
  TEMPLATE_INPUT: `\n\n### Entrada:\n`,
  TEMPLATE_TALK: `Así es como {{char}} debería hablar\n`,
}

const i18n = {
  jp,
  en,
  es,
}

const i18nPrompt = (key: i18nPromptKeys) => {
  return i18n[language][key]
}
