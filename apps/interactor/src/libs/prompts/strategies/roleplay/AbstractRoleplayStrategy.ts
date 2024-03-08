import {
  EMOTION_GROUP_TEMPLATES,
  EMPTY_MIKU_CARD,
  TavernCardV2,
} from '@mikugg/bot-utils'
import { RootState } from '../../../../state/store'
import {
  NarrationInteraction,
  NarrationResponse,
} from '../../../../state/versioning'
import { AbstractPromptStrategy, fillTextTemplate, parseLLMResponse } from '..'
import {
  selectCurrentScene,
  selectCurrentCharacterOutfits,
  selectLastLoadedCharacters,
  selectAllParentDialogues,
} from '../../../../state/selectors'

const EMOTION_TOKEN_OFFSET = 4

export abstract class AbstractRoleplayStrategy extends AbstractPromptStrategy<
  {
    state: RootState
    currentCharacterId: string
  },
  NarrationResponse
> {
  protected abstract getContextPrompt(
    state: RootState,
    currentCharacterId: string
  ): string

  protected abstract template(): {
    instruction: string
    response: string
    askLine: string
    stops: string[]
  }

  public buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: {
      state: RootState
      currentCharacterId: string
    }
  ): {
    template: string
    variables: Record<string, string | string[]>
    totalTokens: number
  } {
    const characters = selectCurrentScene(input.state)?.characters || []
    const currentCharacter = input.state.novel.characters.find(
      (character) => character.id === input.currentCharacterId
    )
    const { name } = this.getCharacterSpecs(
      currentCharacter?.card || EMPTY_MIKU_CARD
    )
    const emotions = this.getCharacterEmotions(
      input.state,
      input.currentCharacterId
    )

    let template = this.getContextPrompt(input.state, input.currentCharacterId)
    template += this.getDialogueHistoryPrompt(input.state, memorySize, {
      name: currentCharacter?.name || '',
      id: currentCharacter?.id || '',
    })
    template += this.getResponseAskLine(
      input.state,
      maxNewTokens,
      input.currentCharacterId
    )

    template = fillTextTemplate(template, {
      user: input.state.settings.user.name,
      bot: name,
      characters: characters.reduce((prev, { characterId }) => {
        prev[characterId] =
          input.state.novel.characters.find(({ id }) => id === characterId)
            ?.name || ''
        return prev
      }, {} as Record<string, string>),
    })

    const totalTokens =
      this.countTokens(template) + maxNewTokens + EMOTION_TOKEN_OFFSET

    const parentEmotion =
      selectLastLoadedCharacters(input.state).find(
        ({ id }) => id === input.currentCharacterId
      )?.emotion || ''

    return {
      template,
      variables: {
        emotions: emotions
          .filter((emotion) =>
            emotions.length > 1 ? emotion !== parentEmotion : true
          )
          .map((emotion) => ' ' + emotion),
      },
      totalTokens,
    }
  }

  public completeResponse(
    input: {
      state: RootState
      currentCharacterId: string
    },
    response: NarrationResponse,
    variables: Map<string, string>
  ): NarrationResponse {
    const currentCharacterResponse = response.characters.find(
      ({ characterId }) => characterId === input.currentCharacterId
    )
    const characterResponse = {
      characterId:
        currentCharacterResponse?.characterId || input.currentCharacterId,
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
      ({ characterId }) => characterId === input.currentCharacterId
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
      id: string
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
      id: string
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
        currentCharacterIndex = dialog.item.characters.findIndex(
          ({ characterId }) => {
            return character?.id === characterId
          }
        )
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
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n')
          nextCharString = dialog.item.characters
            .slice(currentCharacterIndex + 1)
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n')
        } else {
          prevCharString = dialog.item.characters
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
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
    characterId: string
  ): string {
    const temp = this.template()
    const currentResponse =
      state.narration.responses[state.narration.currentResponseId]
    const currentCharacterResponse = currentResponse?.characters.find(
      (char) => char.characterId === characterId
    )
    const scene = selectCurrentScene(state)
    const existingEmotion = currentCharacterResponse?.emotion || ''
    const existingText = currentCharacterResponse?.text || ''
    const charStops = scene?.characters
      .map(({ characterId }) => {
        return `"\\n{{${characterId}}}:","\\n{{${characterId}}}'s reaction:"`
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

  protected getCharacterSpecs(card: TavernCardV2): {
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

  protected getCharacterEmotions(
    state: RootState,
    characterId: string
  ): string[] {
    const characters = selectCurrentCharacterOutfits(state)
    const characterEmotions =
      EMOTION_GROUP_TEMPLATES[
        characters.find((character) => character.id === characterId)?.outfit
          ?.template || 'base-emotions'
      ].emotionIds
    return characterEmotions
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
