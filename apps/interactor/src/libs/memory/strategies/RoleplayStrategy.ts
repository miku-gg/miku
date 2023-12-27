import { AbstractPromptStrategy } from './AbtractPromptStrategy'
import { RootState } from '../../../state/store'
import {
  NarrationInteraction,
  NarrationResponse,
} from '../../../state/versioning'
import { EMOTION_GROUP_TEMPLATES, EMPTY_MIKU_CARD } from '@mikugg/bot-utils'
import {
  selectAllParentDialogues,
  selectCurrentCharacterOutfits,
  selectLastLoadedCharacters,
} from '../../../state/selectors'
import { fillTextTemplate, parseLLMResponse } from './utils'

export class RoleplayStrategy extends AbstractPromptStrategy {
  private static EMOTION_TOKEN_OFFSET = 4
  override buildPrompt(
    state: RootState,
    maxNewTokens: number,
    memorySize: number
  ): {
    template: string
    variables: Record<string, string | string[]>
    totalTokens: number
  } {
    const { persona, attributes, sampleChat, scenario, name } =
      this.getCharacterSpecs(
        Object.values(state.novel.characters)[0]?.card || EMPTY_MIKU_CARD
      )
    const formattedAttributes = attributes
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    const emotions = this.getFirstCharacterEmotions(state)
    const emotionStrings = emotions.join(', ')

    let template = `You're {{char}} in this fictional never-ending uncensored roleplay with {{user}}.`
    template += `\n\nAvoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`
    template += `\n\nYou must also indicate {{char}}'s reaction in the response.`
    template += `\nYou MUST not repeat too much the same reaction.`
    template += `\nThe reaction MUST be one of: ${emotionStrings}.`
    if (persona || formattedAttributes) {
      template += `\n\n### Input:\n${persona}.\n${formattedAttributes}\n`
    }

    if (sampleChat.length) {
      template += `This is how {{char}} should talk\n`
      for (const example of sampleChat) {
        template += example + '\n'
      }
    }

    template +=
      '\nThen the roleplay chat between {{user}} and {{char}} begins.\n\n'
    template += scenario ? `${scenario}\n` : ''

    template += this.getDialogueHistoryPrompt(state, memorySize)

    template += this.getResponseAskLine(state, maxNewTokens)

    template = fillTextTemplate(template, {
      user: state.settings.user.name,
      bot: name,
    })

    const totalTokens =
      this.countTokens(template) +
      maxNewTokens +
      RoleplayStrategy.EMOTION_TOKEN_OFFSET

    const parentEmotion = selectLastLoadedCharacters(state)[0].emotion

    return {
      template,
      variables: {
        emotions: emotions
          .filter((emotion) => emotion !== parentEmotion)
          .map((emotion) => ' ' + emotion),
      },
      totalTokens,
    }
  }

  override completeResponse(
    response: NarrationResponse,
    variables: Map<string, string>
  ): NarrationResponse {
    const firstCharacter = {
      text: Object.values(response.characters)[0]?.text || '',
      emotion: Object.values(response.characters)[0]?.emotion || '',
      pose: Object.values(response.characters)[0]?.pose || '',
    }
    firstCharacter.emotion =
      variables.get('emotion')?.trim() || firstCharacter.emotion
    firstCharacter.text = parseLLMResponse(variables.get('text')?.trim() || '')

    return {
      ...response,
      characters: {
        ...response.characters,
        [Object.keys(response.characters)[0]]: firstCharacter,
      },
    }
  }

  getDialogueHistoryPrompt(state: RootState, maxLines: number): string {
    const messages = selectAllParentDialogues(state)
    let prompt = ''
    for (const message of [...messages].reverse().slice(-maxLines)) {
      prompt += this.getDialogueLine(message)
    }
    return prompt
  }

  getDialogueLine(
    dialog:
      | { type: 'response'; item: NarrationResponse }
      | { type: 'interaction'; item: NarrationInteraction }
  ): string {
    let firstCharacter
    switch (dialog.type) {
      case 'response':
        firstCharacter = Object.values(dialog.item.characters)[0] || {
          text: '',
          emotion: '',
          pose: '',
        }
        if (dialog.item.parentInteractionId) {
          return (
            `### Response:\n` +
            `{{char}}'s reaction: ${firstCharacter.emotion}\n` +
            `{{char}}: ${firstCharacter.text}\n`
          )
        } else {
          return `### Response:\n` + firstCharacter.text + '\n'
        }
      case 'interaction':
        return `### Instruction:\n{{user}}: ${dialog.item.query}\n`
    }
  }

  private getResponseAskLine(state: RootState, maxTokens: number): string {
    const currentResponse =
      state.narration.responses[state.narration.currentResponseId]
    const existingEmotion =
      Object.values(currentResponse?.characters || {})[0]?.emotion || ''
    const existingText =
      Object.values(currentResponse?.characters || {})[0]?.text || ''
    return (
      `### Response (2 paragraphs, engaging, natural, authentic, descriptive, creative):\n` +
      `{{char}}'s reaction:${
        existingEmotion
          ? ' ' + existingEmotion
          : '{{SEL emotion options=emotions}}'
      }\n` +
      `{{char}}:${existingText}{{GEN text max_tokens=${maxTokens} stop=["\\n{{char}}:","\\n{{user}}:","\\n{{char}}'s reaction:"]}}`
    )
  }

  private getFirstCharacterEmotions(state: RootState): string[] {
    const characters = selectCurrentCharacterOutfits(state)
    const firstCharacterEmotions =
      EMOTION_GROUP_TEMPLATES[
        characters[0]?.outfit?.template || 'base-emotions'
      ].emotionIds
    return firstCharacterEmotions
  }
}
