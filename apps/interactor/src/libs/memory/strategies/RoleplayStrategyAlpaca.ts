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
  selectCurrentScene,
  selectLastLoadedCharacters,
} from '../../../state/selectors'
import { fillTextTemplate, parseLLMResponse } from './utils'

export class RoleplayStrategyAlpaca extends AbstractPromptStrategy {
  private static EMOTION_TOKEN_OFFSET = 4
  override buildPrompt(
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
    const roleTemplates = roles
      .filter(({ role }) => role !== currentRole)
      .map(({ role }) => `{{${role}}}`)
    const outfits = selectCurrentCharacterOutfits(state)
    const charactedId =
      outfits.find(({ role }) => role === currentRole)?.id || ''
    const { persona, attributes, sampleChat, scenario, name } =
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
    template += `\nYou MUST NOT impersonate other characters, ONLY describe {{char}} actions and dialogue.`
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

    template += `\nThen the roleplay chat between ${[
      ...roleTemplates,
      '{{user}}',
    ].join(', ')} and {{char}} begins.\n\n`
    template += scenario ? `${scenario}\n` : ''

    template += this.getDialogueHistoryPrompt(state, memorySize, currentRole)
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
      this.countTokens(template) +
      maxNewTokens +
      RoleplayStrategyAlpaca.EMOTION_TOKEN_OFFSET

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

  override completeResponse(
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

  getDialogueHistoryPrompt(
    state: RootState,
    maxLines: number,
    currentRole: string
  ): string {
    const messages = selectAllParentDialogues(state)
    let prompt = ''
    for (const message of [...messages].reverse().slice(-maxLines)) {
      prompt += this.getDialogueLine(message, currentRole, prompt)
    }
    return prompt
  }

  getDialogueLine(
    dialog:
      | { type: 'response'; item: NarrationResponse }
      | { type: 'interaction'; item: NarrationInteraction },
    currentRole: string,
    currentText?: string
  ): string {
    let prevCharString = ''
    let nextCharString = ''
    let currentCharacterIndex
    let characterCharacter
    switch (dialog.type) {
      case 'response':
        currentCharacterIndex = dialog.item.characters.findIndex(
          ({ role }) => role === currentRole
        )
        characterCharacter =
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
            (characterCharacter.text
              ? `### Response:\n` +
                `{{char}}'s reaction: ${characterCharacter.emotion}\n` +
                `{{char}}: ${characterCharacter.text}\n`
              : '') +
            (nextCharString ? `### Instruction:\n${nextCharString}\n` : '')
          )
        } else {
          return (
            (prevCharString ? `### Instruction:\n${prevCharString}\n` : '') +
            (characterCharacter.text
              ? `### Response:\n` + characterCharacter.text
              : '') +
            '\n' +
            (nextCharString ? `### Instruction:\n${nextCharString}\n` : '')
          )
        }
      case 'interaction':
        if (
          (currentText?.lastIndexOf('### Instruction:') || 0) <
          (currentText?.lastIndexOf('### Response:') || 1)
        )
          return `### Instruction:\n{{user}}: ${dialog.item.query}\n`
        else return `{{user}}: ${dialog.item.query}\n`
    }
  }

  private getResponseAskLine(
    state: RootState,
    maxTokens: number,
    role: string
  ): string {
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
      .join(',')
    return (
      `### Response (2 paragraphs, engaging, natural, authentic, descriptive, creative):\n` +
      `{{char}}'s reaction:${
        existingEmotion
          ? ' ' + existingEmotion
          : '{{SEL emotion options=emotions}}'
      }\n` +
      `{{char}}:${existingText}{{GEN text max_tokens=${maxTokens} stop=["\\n{{user}}:",${charStops}]}}`
    )
  }

  private getRoleEmotions(state: RootState, role: string): string[] {
    const characters = selectCurrentCharacterOutfits(state)
    const characterEmotions =
      EMOTION_GROUP_TEMPLATES[
        characters.find((character) => character.role === role)?.outfit
          ?.template || 'base-emotions'
      ].emotionIds
    return characterEmotions
  }
}
