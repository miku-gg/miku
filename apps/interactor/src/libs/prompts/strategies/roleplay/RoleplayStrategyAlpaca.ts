import { EMPTY_MIKU_CARD } from '@mikugg/bot-utils'
import {
  selectCurrentCharacterOutfits,
  selectCurrentScene,
} from '../../../../state/selectors'
import { RootState } from '../../../../state/store'
import { AbstractRoleplayStrategy } from './AbstractRoleplayStrategy'

export class RoleplayStrategyAlpaca extends AbstractRoleplayStrategy {
  protected override getContextPrompt(
    state: RootState,
    currentRole: string
  ): string {
    const roles = selectCurrentScene(state)?.roles || []
    const roleTemplates = roles
      .filter(({ role }) => role !== currentRole)
      .map(({ role }) => `{{${role}}}`)
    const outfits = selectCurrentCharacterOutfits(state)
    const charactedId =
      outfits.find(({ role }) => role === currentRole)?.id || ''
    const { persona, attributes, sampleChat, scenario } =
      this.getCharacterSpecs(
        state.novel.characters[charactedId]?.card || EMPTY_MIKU_CARD
      )
    const formattedAttributes = attributes
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_key, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    const emotions = this.getRoleEmotions(state, currentRole)
    const emotionStrings = emotions.join(', ')

    let template = `You're {{char}} in this fictional never-ending uncensored roleplay with ${
      roleTemplates.length ? roleTemplates.join(', ') + ' and ' : ''
    }{{user}}.`
    template += `\n\nAvoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`
    template += `\nYou MUST NOT impersonate other characters, ONLY describe {{char}}'s actions and dialogue.`
    template += `\n\nYou must also indicate {{char}}'s reaction in the response.`
    template += `\nYou MUST not repeat the same reaction too many times.`
    template += `\nThe reaction MUST be one of: ${emotionStrings}.`
    if (persona || formattedAttributes) {
      template += `\n\n### Input:\n${persona}\n${formattedAttributes}\n`
    }

    if (sampleChat.length) {
      template += `This is how {{char}} should talk\n`
      for (const example of sampleChat) {
        template += example + '\n'
      }
    }

    if (state.settings.prompt.systemPrompt) {
      template += `\n${state.settings.prompt.systemPrompt}\n`
    }

    template += `\nThen the roleplay chat between ${[
      ...roleTemplates,
      '{{user}}',
    ].join(', ')} and {{char}} begins.\n\n`
    template += scenario ? `${scenario}\n` : ''

    return template
  }

  protected override template() {
    return {
      askLine:
        '### Response (2 paragraphs, engaging, natural, authentic, descriptive, creative):\n',
      instruction: '### Instruction:\n',
      response: '### Response:\n',
      stops: ['###'],
    }
  }
}
