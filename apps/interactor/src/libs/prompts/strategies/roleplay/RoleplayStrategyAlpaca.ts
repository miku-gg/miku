import { EMPTY_MIKU_CARD } from '@mikugg/bot-utils'
import { selectCurrentScene } from '../../../../state/selectors'
import { RootState } from '../../../../state/store'
import { AbstractRoleplayStrategy } from './AbstractRoleplayStrategy'
import { language } from '../../../lang/i18n'
import { i18nPrompt } from './'

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

    template += `\n\n${i18nPrompt('ALPACA_TEMPLATE__AVOID_REPETITION')}`
    template += i18nPrompt('ALPACA_TEMPLATE__NO_USER_ACTION')
    template += i18nPrompt('ALPACA_TEMPLATE__REACTION')
    template += i18nPrompt('ALPACA_TEMPLATE__REPEAT_REACTION')
    template += `${i18nPrompt(
      'ALPACA_TEMPLATE__REACTION_MUST_BE_ONE_OF'
    )} ${emotionStrings}.`

    if (persona || formattedAttributes) {
      template += `\n\n### Input:\n${persona}\n${formattedAttributes}\n`
    }

    if (sampleChat.length) {
      template += `${i18nPrompt('ALPACA_TEMPLATE__TALK')}\n`
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
        template += `\nLuego comienza el chat de rol entre ${[
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
