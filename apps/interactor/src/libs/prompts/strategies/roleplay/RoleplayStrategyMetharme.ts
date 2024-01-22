import { AbstractRoleplayStrategy } from './AbstractRoleplayStrategy'
import { RootState } from '../../../../state/store'
import { EMPTY_MIKU_CARD } from '@mikugg/bot-utils'
import {
  selectCurrentCharacterOutfits,
  selectCurrentScene,
} from '../../../../state/selectors'

export class RoleplayStrategyMetharme extends AbstractRoleplayStrategy {
  protected override getContextPrompt(
    state: RootState,
    currentRole: string
  ): string {
    const roles = selectCurrentScene(state)?.roles || []
    const roleTemplates = roles.map(({ role }) => `{{${role}}}`)
    const outfits = selectCurrentCharacterOutfits(state)
    const charactedId =
      outfits.find(({ role }) => role === currentRole)?.id || ''
    const { persona, sampleChat, scenario } = this.getCharacterSpecs(
      state.novel.characters[charactedId]?.card || EMPTY_MIKU_CARD
    )
    const emotions = this.getRoleEmotions(state, currentRole)
    const emotionStrings = emotions.join(', ')

    let template = `<|system|>Below is an instruction that describes a task. Write a response that appropriately completes the request.`

    template += `\n\nWrite {{char}}'s next reply in a fictional roleplay chat between ${roleTemplates.join(
      ', '
    )} and {{user}}.`
    template += `\n\nYou must also indicate {{char}}'s reaction in the response.`
    template += `\nYou MUST not repeat the same reaction too many times.`
    template += `\nThe reaction MUST be one of: ${emotionStrings}.`

    template += `\n\n{{char}}'s Persona: ${persona}`

    if (sampleChat.length) {
      template += `\n\nThis is how {{char}} should talk:\n`
      for (const example of sampleChat) {
        template += example + '\n'
      }
    }

    template += `\nThen the roleplay chat between ${roleTemplates.join(
      ', '
    )} and {{user}} begins.\n\n`
    template += scenario ? `${scenario}\n` : ''

    return template
  }

  protected override template() {
    return {
      askLine: '<|model|>',
      instruction: '<|user|>',
      response: '<|model|>',
      stops: ['<|model|>', '<|user|>'],
    }
  }
}
