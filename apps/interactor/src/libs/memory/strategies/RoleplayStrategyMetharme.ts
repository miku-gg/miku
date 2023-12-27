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

export class RoleplayStrategyMetharme extends AbstractPromptStrategy {
  private static EMOTION_TOKEN_OFFSET = 4
  override buildPrompt(
    state: RootState,
    maxNewTokens: number,
    memorySize: number,
    continueResponse?: boolean
  ): {
    template: string
    variables: Record<string, string | string[]>
    totalTokens: number
  } {
    const { persona, sampleChat, scenario, name } = this.getCharacterSpecs(
      Object.values(state.novel.characters)[0]?.card || EMPTY_MIKU_CARD
    )

    const emotions = this.getFirstCharacterEmotions(state)
    const emotionStrings = emotions.join(', ')

    let template = `<|system|>Below is an instruction that describes a task. Write a response that appropriately completes the request.`

    template += `\n\nWrite {{char}}'s next reply in a fictional roleplay chat between {{char}} and {{user}}.`

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

    template +=
      '\nThen the roleplay chat between {{user}} and {{char}} begins.\n\n'
    template += scenario ? `${scenario}\n` : ''

    template += this.getDialogueHistoryPrompt(state, memorySize)

    if (continueResponse) {
      template += "\n\n<|system|>Continue writing {{char}}'s response below."
    }

    template += this.getResponseAskLine(state, maxNewTokens)

    template = fillTextTemplate(template, {
      user: state.settings.user.name,
      bot: name,
    })

    const totalTokens =
      this.countTokens(template) +
      maxNewTokens +
      RoleplayStrategyMetharme.EMOTION_TOKEN_OFFSET

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
            `<|model|>` +
            `{{char}}'s reaction: ${firstCharacter.emotion}\n` +
            `{{char}}: ${firstCharacter.text}\n`
          )
        } else {
          return `<|model|>\n` + firstCharacter.text + '\n'
        }
      case 'interaction':
        return `<|user|>{{user}}: ${dialog.item.query}\n`
    }
  }

  private getResponseAskLine(state: RootState, maxTokens: number): string {
    const currentResponse =
      state.narration.responses[state.narration.currentResponseId]
    const existingEmotion =
      Object.values(currentResponse?.characters || {})[0]?.emotion || ''
    const existingText =
      Object.values(currentResponse?.characters || {})[0]?.text || ''

    return `<|system|>{{char}}'s reacton:${
      existingEmotion
        ? ' ' + existingEmotion
        : '{{SEL emotion options=emotions}}'
    }\n\n<|model|>{{char}}:${existingText.trimStart()}{{GEN text max_tokens=${maxTokens} stop=["\\n{{user}}:","\\n{{char}}:","<|model|>","<|system|>","<|user|>"]}}`
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
