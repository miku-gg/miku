import {
  EMOTION_GROUP_TEMPLATES,
  EMPTY_MIKU_CARD,
  MikuCard,
} from '@mikugg/bot-utils'
import { RootState } from '../../../state/store'
import {
  NarrationInteraction,
  NarrationResponse,
} from '../../../state/versioning'
import llamaTokenizer from '../_llama-tokenizer'
import { fillTextTemplate, parseLLMResponse } from '.'
import {
  selectCurrentScene,
  selectCurrentCharacterOutfits,
  selectLastLoadedCharacters,
  selectAllParentDialogues,
} from '../../../state/selectors'

const EMOTION_TOKEN_OFFSET = 4

export abstract class AbstractPromptStrategy {
  protected abstract getContextPrompt(
    state: RootState,
    currentRole: string
  ): string

  protected abstract template(): {
    instruction: string
    response: string
    askLine: string
    stops: string[]
  }

  public buildPrompt(
    state: RootState,
    maxNewTokens: number,
    memorySize: number,
    currentRole: string
  ): {
    template: string
    variables: Record<string, string | string[]>
    totalTokens: number
  } {
    const roles = selectCurrentScene(state)?.roles || []
    const outfits = selectCurrentCharacterOutfits(state)
    const currentCharacter =
      outfits.find(({ role }) => role === currentRole) || null
    const { name } = this.getCharacterSpecs(
      state.novel.characters[currentCharacter?.id || '']?.card ||
        EMPTY_MIKU_CARD
    )
    const emotions = this.getRoleEmotions(state, currentRole)

    let template = this.getContextPrompt(state, currentRole)
    template += this.getDialogueHistoryPrompt(state, memorySize, {
      name: state.novel.characters[currentCharacter?.id || '']?.name || '',
      roles: state.novel.characters[currentCharacter?.id || '']?.roles || {},
    })
    template += this.getResponseAskLine(state, maxNewTokens, currentRole)

    template = fillTextTemplate(template, {
      user: state.settings.user.name,
      bot: name,
      roles: roles.reduce((prev, { role, characterId }) => {
        prev[role] = state.novel.characters[characterId]?.name || ''
        return prev
      }, {} as Record<string, string>),
    })

    const totalTokens =
      this.countTokens(template) + maxNewTokens + EMOTION_TOKEN_OFFSET

    const parentEmotion =
      selectLastLoadedCharacters(state).find(({ role }) => role === currentRole)
        ?.emotion || ''

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

  public completeResponse(
    response: NarrationResponse,
    variables: Map<string, string>,
    role: string
  ): NarrationResponse {
    const currentCharacterResponse = response.characters.find(
      ({ role: characterRole }) => characterRole === role
    )
    const characterResponse = {
      role: currentCharacterResponse?.role || role,
      text: currentCharacterResponse?.text || '',
      emotion: currentCharacterResponse?.emotion || '',
      pose: currentCharacterResponse?.pose || '',
    }
    characterResponse.emotion =
      variables.get('emotion')?.trim() || characterResponse.emotion
    characterResponse.text = parseLLMResponse(
      variables.get('text')?.trim() || ''
    )

    const index = response.characters.findIndex(
      ({ role: characterRole }) => characterRole === role
    )

    return {
      ...response,
      characters: [
        ...response.characters.slice(
          0,
          index !== -1 ? index : response.characters.length
        ),
        characterResponse,
      ],
    }
  }

  protected getDialogueHistoryPrompt(
    state: RootState,
    maxLines: number,
    currentCharacter?: {
      name: string
      roles: Record<string, string | undefined>
    }
  ): string {
    const messages = selectAllParentDialogues(state)
    let prompt = ''
    for (const message of [...messages].reverse().slice(-maxLines)) {
      prompt += this.getDialogueLine(message, currentCharacter, prompt)
    }
    return prompt
  }

  protected getDialogueLine(
    dialog:
      | { type: 'response'; item: NarrationResponse }
      | { type: 'interaction'; item: NarrationInteraction },
    character?: {
      name: string
      roles: Record<string, string | undefined>
    },
    currentText?: string
  ): string {
    const temp = this.template()
    let prevCharString = ''
    let nextCharString = ''
    let currentCharacterIndex
    let currentCharacter
    switch (dialog.type) {
      case 'response':
        currentCharacterIndex = dialog.item.characters.findIndex(({ role }) => {
          return Object.keys(character?.roles || {}).includes(role)
        })
        currentCharacter =
          currentCharacterIndex !== -1
            ? dialog.item.characters[currentCharacterIndex]
            : {
                text: '',
                emotion: '',
                pose: '',
              }
        if (currentCharacterIndex !== -1) {
          prevCharString = dialog.item.characters
            .slice(0, currentCharacterIndex)
            .map(({ text, role }) => `{{${role}}}: ${text}`)
            .join('\n')
          nextCharString = dialog.item.characters
            .slice(currentCharacterIndex + 1)
            .map(({ text, role }) => `{{${role}}}: ${text}`)
            .join('\n')
        } else {
          prevCharString = dialog.item.characters
            .map(({ text, role }) => `{{${role}}}: ${text}`)
            .join('\n')
        }
        if (dialog.item.parentInteractionId) {
          return (
            (prevCharString ? prevCharString + '\n' : '') +
            (currentCharacter.text
              ? temp.response +
                `{{char}}'s reaction: ${currentCharacter.emotion}\n` +
                `{{char}}: ${currentCharacter.text}\n`
              : '') +
            (nextCharString ? `${temp.instruction}${nextCharString}\n` : '')
          )
        } else {
          return (
            (prevCharString ? `${temp.instruction}${prevCharString}\n` : '') +
            (currentCharacter.text
              ? temp.response + currentCharacter.text
              : '') +
            '\n' +
            (nextCharString ? `${temp.instruction}${nextCharString}\n` : '')
          )
        }
      case 'interaction':
        if (
          (currentText?.lastIndexOf(temp.instruction) || 0) <
          (currentText?.lastIndexOf(temp.response) || 1)
        )
          return `${temp.instruction}{{user}}: ${dialog.item.query}\n`
        else return `{{user}}: ${dialog.item.query}\n`
    }
  }

  protected getResponseAskLine(
    state: RootState,
    maxTokens: number,
    role: string
  ): string {
    const temp = this.template()
    const currentResponse =
      state.narration.responses[state.narration.currentResponseId]
    const currentCharacterResponse = currentResponse?.characters.find(
      ({ role: characterRole }) => characterRole === role
    )
    const scene = selectCurrentScene(state)
    const existingEmotion = currentCharacterResponse?.emotion || ''
    const existingText = currentCharacterResponse?.text || ''
    const charStops = scene?.roles
      .map(({ role }) => {
        return `"\\n{{${role}}}:","\\n{{${role}}}'s reaction:"`
      })
      .concat(temp.stops.map((stop) => `"${stop}"`))
      .join(',')
    return (
      temp.askLine +
      `{{char}}'s reaction:${
        existingEmotion
          ? ' ' + existingEmotion
          : '{{SEL emotion options=emotions}}'
      }\n` +
      `{{char}}:${existingText}{{GEN text max_tokens=${maxTokens} stop=["\\n{{user}}:",${charStops}]}}`
    )
  }

  protected getCharacterSpecs(card: MikuCard): {
    persona: string
    attributes: [string, string][]
    sampleChat: string[]
    scenario: string
    greeting: string
    name: string
  } {
    return {
      persona: card.data.description,
      attributes: this.parseAttributes(card.data.personality),
      sampleChat: this.parseExampleMessages(card.data.mes_example),
      scenario: card.data.scenario,
      greeting: card.data.first_mes,
      name: card.data.name,
    }
  }

  protected getRoleEmotions(state: RootState, role: string): string[] {
    const characters = selectCurrentCharacterOutfits(state)
    const characterEmotions =
      EMOTION_GROUP_TEMPLATES[
        characters.find((character) => character.role === role)?.outfit
          ?.template || 'base-emotions'
      ].emotionIds
    return characterEmotions
  }

  protected countTokens(template: string): number {
    const _template = template.replace(/{{.*?}}/g, '')
    return llamaTokenizer.encode(_template).length
  }

  private parseAttributes(s: string): [string, string][] {
    return s.split('\n').map((x) => {
      const [a = '', b = ''] = x.split(': ')
      return [a.trim(), b.trim()]
    })
  }

  private parseExampleMessages(s: string): string[] {
    return s
      .split('<START>\n')
      .map((x) => x.trim())
      .filter((x) => x)
  }
}
