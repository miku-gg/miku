import { EMOTION_GROUP_TEMPLATES, EMPTY_MIKU_CARD, TavernCardV2 } from '@mikugg/bot-utils';
import { AbstractPromptStrategy, fillTextTemplate, parseLLMResponse } from '..';
import {
  selectAllParentDialoguesWhereCharactersArePresent,
  selectAvailableSummarySentences,
  selectCurrentCharacterOutfits,
  selectCurrentScene,
  selectLastLoadedCharacters,
} from '../../../../state/selectors';
import { RootState } from '../../../../state/store';
import { NarrationInteraction, NarrationResponse } from '../../../../state/versioning';
import { findLorebooksEntries } from '../../../lorebookSearch';

const PROMPT_TOKEN_OFFSET = 50;

export class RoleplayPromptStrategy extends AbstractPromptStrategy<
  {
    state: RootState;
    currentCharacterId: string;
  },
  NarrationResponse
> {
  protected getContextPrompt(state: RootState, currentCharacterId: string, maxTokens: number): string {
    const scene = selectCurrentScene(state);
    const characters = scene?.characters || [];
    const characterTemplates = characters
      .filter(({ characterId }) => characterId !== currentCharacterId)
      .map(({ characterId }) => `{{${characterId}}}`);
    const { persona, attributes, sampleChat } = this.getCharacterSpecs(
      state.novel.characters.find(({ id }) => id === currentCharacterId)?.card || EMPTY_MIKU_CARD,
    );
    const formattedAttributes = attributes
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_key, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    const emotions = this.getCharacterEmotions(state, currentCharacterId);
    const emotionStrings = emotions.join(', ');

    const { BOS, INPUT_START, SYSTEM_START, SYSTEM_END } = this.instructTemplate;

    let template =
      `${BOS}${SYSTEM_START}You are an expert actor that can fully immerse yourself into any role given. You do not break character for any reason, even if someone tries addressing you as an AI or language model.` +
      ` Currently your role is {{char}}, which is described in detail below. As {{char}}, continue the exchange with ${
        characterTemplates.length ? characterTemplates.join(', ') + ' and ' : ''
      }{{user}}.`;
    template += `\nAvoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`;
    template += `\nDO NOT describe {{user}}'s actions or dialogues, ONLY describe {{char}}'s actions and dialogue.`;
    template += `\nYou must also indicate {{char}}'s reaction in the response.`;
    template += `\nYou MUST not repeat the same reaction too many times.`;
    template += `\nThe reaction MUST be one of: ${emotionStrings}.`;
    if (persona || formattedAttributes) {
      template += `${SYSTEM_END}${INPUT_START}${persona}\n${formattedAttributes}\n`;
    }

    if (state.settings.prompt.systemPrompt) {
      template += `${state.settings.prompt.systemPrompt}\n`;
    }

    const lorebook = this.getContextForLorebookEntry(state, currentCharacterId);

    if (sampleChat.length || lorebook) {
      template += `\nThis is how {{char}} should talk:\n`;
      for (const example of sampleChat) {
        template += example + '\n';
      }
      if (lorebook) {
        template += `${lorebook}\n`;
      }
    }

    template += `\nThen the roleplay chat between ${[...characterTemplates, '{{user}}'].join(
      ', ',
    )} and {{char}} begins.\n`;

    if (state.settings.summaries?.enabled) {
      const setences = selectAvailableSummarySentences(state, [currentCharacterId], maxTokens);
      if (setences.length) {
        template += `STORY EVENTS UNTIL NOW:\n${setences.join('\n')}\n`;
      }
    }

    if (scene?.prompt) {
      template += `CURRENT SCENE: ${scene.prompt}\n`;
    }

    scene?.characters.forEach((char) => {
      if (char.objective) {
        template += `\n{{${char.characterId}}}'s OBJECTIVE: ${char.objective}\n`;
      }
    });

    return template;
  }

  public template() {
    const { INPUT_START, INPUT_END, OUTPUT_START, OUTPUT_END, STOPS } = this.instructTemplate;
    return {
      askLine: `${INPUT_END}${OUTPUT_START}# Reaction + 2 paragraphs, engaging, natural, authentic, descriptive, creative.\n`,
      instruction: `${OUTPUT_END}${INPUT_START}`,
      response: `${INPUT_END}${OUTPUT_START}`,
      stops: STOPS,
    };
  }

  public buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: {
      state: RootState;
      currentCharacterId: string;
      maxTokens: number;
    },
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    const characters = input.state.novel.characters || [];
    const currentCharacter = input.state.novel.characters.find(
      (character) => character.id === input.currentCharacterId,
    );
    const { name } = this.getCharacterSpecs(currentCharacter?.card || EMPTY_MIKU_CARD);
    const emotions = this.getCharacterEmotions(input.state, input.currentCharacterId);

    let template = this.getContextPrompt(input.state, input.currentCharacterId, input.maxTokens);

    template += this.getDialogueHistoryPrompt(input.state, memorySize, {
      name: currentCharacter?.name || '',
      id: currentCharacter?.id || '',
    });
    template += this.getResponseAskLine(input.state, maxNewTokens, input.currentCharacterId);

    template = fillTextTemplate(template, {
      user: input.state.settings.user.name,
      bot: name,
      characters: characters.reduce((prev, { id, card }) => {
        prev[id] = card.data.name;
        return prev;
      }, {} as Record<string, string>),
    });

    const totalTokens = this.countTokens(template) + PROMPT_TOKEN_OFFSET;

    const parentEmotion =
      selectLastLoadedCharacters(input.state).find(({ id }) => id === input.currentCharacterId)?.emotion || '';

    return {
      template,
      variables: {
        scene_opt: [' Yes', ' No'],
        cond_opt: Array.from({ length: 10 }, (_, i) => ' ' + i.toString()),
        emotions: emotions
          .filter((emotion) => (emotions.length > 1 ? emotion !== parentEmotion : true))
          .map((emotion) => ' ' + emotion),
      },
      totalTokens,
    };
  }

  public completeResponse(
    input: {
      state: RootState;
      currentCharacterId: string;
    },
    response: NarrationResponse,
    variables: Map<string, string>,
  ): NarrationResponse {
    const currentCharacterResponse = response.characters.find(
      ({ characterId }) => characterId === input.currentCharacterId,
    );
    const currentCharacterName =
      input.state.novel.characters.find((character) => character.id === input.currentCharacterId)?.name || '';
    const characterResponse = {
      characterId: currentCharacterResponse?.characterId || input.currentCharacterId,
      text: currentCharacterResponse?.text || '',
      emotion: currentCharacterResponse?.emotion || '',
      pose: currentCharacterResponse?.pose || '',
    };
    characterResponse.emotion = variables.get('emotion')?.trim() || characterResponse.emotion;
    characterResponse.text = parseLLMResponse(variables.get('text')?.trim() || '', currentCharacterName);

    const index = response.characters.findIndex(({ characterId }) => characterId === input.currentCharacterId);

    return {
      ...response,
      characters: [
        ...response.characters.slice(0, index !== -1 ? index : response.characters.length),
        characterResponse,
      ],
    };
  }

  protected getDialogueHistoryPrompt(
    state: RootState,
    maxLines: number,
    currentCharacter?: {
      name: string;
      id: string;
    },
  ): string {
    const messages = selectAllParentDialoguesWhereCharactersArePresent(state, [currentCharacter?.id || '']);
    let prompt = '';
    for (const message of [...messages].reverse().slice(-maxLines)) {
      prompt += this.getDialogueLine(message, currentCharacter, prompt);
    }
    return prompt;
  }

  protected getDialogueLine(
    dialog: { type: 'response'; item: NarrationResponse } | { type: 'interaction'; item: NarrationInteraction },
    character?: {
      name: string;
      id: string;
    },
    currentText?: string,
  ): string {
    const temp = this.template();
    let prevCharString = '';
    let nextCharString = '';
    let currentCharacterIndex;
    let currentCharacter;
    switch (dialog.type) {
      case 'response':
        currentCharacterIndex = dialog.item.characters.findIndex(({ characterId }) => {
          return character?.id === characterId;
        });
        currentCharacter =
          currentCharacterIndex !== -1
            ? dialog.item.characters[currentCharacterIndex]
            : {
                text: '',
                emotion: '',
                pose: '',
              };
        if (currentCharacterIndex !== -1) {
          prevCharString = dialog.item.characters
            .slice(0, currentCharacterIndex)
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n');
          nextCharString = dialog.item.characters
            .slice(currentCharacterIndex + 1)
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n');
        } else {
          prevCharString = dialog.item.characters
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n');
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
          );
        } else {
          return (
            (prevCharString ? `${temp.instruction}${prevCharString}\n` : '') +
            (currentCharacter.text ? temp.response + `{{char}}: ${currentCharacter.text}\n` : '') +
            '\n' +
            (nextCharString ? `${temp.instruction}${nextCharString}\n` : '')
          );
        }
      case 'interaction':
        if ((currentText?.lastIndexOf(temp.instruction) || 0) < (currentText?.lastIndexOf(temp.response) || 1))
          return `${temp.instruction}{{user}}: ${dialog.item.query}\n`;
        else return `{{user}}: ${dialog.item.query}\n`;
    }
  }

  protected getResponseAskLine(state: RootState, maxTokens: number, characterId: string): string {
    const temp = this.template();
    const currentResponse = state.narration.responses[state.narration.currentResponseId];
    const currentCharacterResponse = currentResponse?.characters.find((char) => char.characterId === characterId);
    const scene = selectCurrentScene(state);

    // const background = state.novel.backgrounds.find(
    //   (bg) => bg.id === scene?.backgroundId
    // )
    const existingEmotion = currentCharacterResponse?.emotion || '';
    const existingText = currentCharacterResponse?.text || '';
    const charStops = scene?.characters
      .map(({ characterId }) => {
        const character = state.novel.characters.find((char) => char.id === characterId);
        const charName = (character?.name || '').replace(/"/g, '\\"');

        return `"\\n${charName}:","\\n${charName}'s reaction:"`;
      })
      .concat(temp.stops.map((stop) => `"${stop}"`))
      .join(',');

    const userSanitized = state.settings.user.name.replace(/"/g, '\\"');

    return (
      temp.askLine +
      `{{char}}'s reaction:${existingEmotion ? ' ' + existingEmotion : '{{SEL emotion options=emotions}}'}\n` +
      `{{char}}:${existingText}{{GEN text max_tokens=${maxTokens} stop=["\\n${userSanitized}:",${charStops}]}}`
    );
  }

  static getConditionPrompt({
    condition,
    instructionPrefix,
    responsePrefix,
  }: {
    condition: string;
    instructionPrefix: string;
    responsePrefix: string;
  }) {
    return (
      `\n${instructionPrefix}OOC: In the current roleplay, has the following thing happened?: ${condition}` +
      `\nAnswer with Yes or No` +
      `\n${responsePrefix}Based on the last two messages, the answer is:{{SEL cond options=cond_opt}}`
    );
  }

  protected getCharacterSpecs(card: TavernCardV2): {
    persona: string;
    attributes: [string, string][];
    sampleChat: string[];
    scenario: string;
    greeting: string;
    name: string;
  } {
    return {
      persona: card.data.description,
      attributes: this.parseAttributes(card.data.personality),
      sampleChat: this.parseExampleMessages(card.data.mes_example),
      scenario: card.data.scenario,
      greeting: card.data.first_mes,
      name: card.data.name,
    };
  }

  protected getCharacterEmotions(state: RootState, characterId: string): string[] {
    const characters = selectCurrentCharacterOutfits(state);
    const characterEmotions =
      EMOTION_GROUP_TEMPLATES[
        characters.find((character) => character.id === characterId)?.outfit?.template || 'base-emotions'
      ].emotionIds;
    return characterEmotions;
  }

  private parseAttributes(s: string): [string, string][] {
    return s.split('\n').map((x) => {
      const [a = '', b = ''] = x.split(': ');
      return [a.trim(), b.trim()];
    });
  }

  private parseExampleMessages(s: string): string[] {
    return s
      .split('<START>\n')
      .map((x) => x.trim())
      .filter((x) => x);
  }

  protected getContextForLorebookEntry(state: RootState, currentCharacterId: string) {
    let content: string = '';
    const lorebookIds = new Set<string>();

    const currentScene = selectCurrentScene(state);
    const sceneLorebookIds = (currentScene?.lorebookIds || []).filter((lorebookId) => {
      if (lorebookIds.has(lorebookId)) {
        return false;
      } else {
        lorebookIds.add(lorebookId);
        return true;
      }
    });
    const charactersInScene = selectLastLoadedCharacters(state);
    const characterLorebookIds = charactersInScene
      .map((character) => state.novel.characters.find((char) => char.id === character.id)?.lorebookIds || [])
      .flat()
      .filter((characterLorebookId) => {
        if (lorebookIds.has(characterLorebookId)) {
          return false;
        } else {
          lorebookIds.add(characterLorebookId);
          return true;
        }
      });
    const globalLorebookIds =
      state.novel.lorebooks
        ?.map((lorebook) => (lorebook.isGlobal ? lorebook.id : null))
        .filter((id) => {
          if (id) {
            if (lorebookIds.has(id)) {
              return false;
            } else {
              lorebookIds.add(id);
              return true;
            }
          } else {
            return false;
          }
        }) || [];

    const lastMessages = selectAllParentDialoguesWhereCharactersArePresent(state, [currentCharacterId])
      .slice(1, 4)
      .reverse();
    const lorebooks = [...sceneLorebookIds, ...characterLorebookIds, ...globalLorebookIds]
      .map((lorebookId) => state.novel.lorebooks?.find((lorebook) => lorebook.id === lorebookId))
      .filter((lorebook) => lorebook);

    if (!lorebooks.length) return null;

    const fillTextTemplateWithCharacters = (text: string) =>
      fillTextTemplate(text, {
        user: state.settings.user.name,
        bot: state.novel.characters.find((character) => character.id === currentCharacterId)?.name || '',
        characters: state.novel.characters.reduce((prev, { id, card }) => {
          prev[id] = card.data.name;
          return prev;
        }, {} as Record<string, string>),
      });
    const lastMessagesWordsArray = lastMessages
      .map((message) => {
        if (message.type === 'response') {
          return message.item.characters.map((char) => fillTextTemplateWithCharacters(char.text));
        } else {
          return fillTextTemplateWithCharacters(message.item.query);
        }
      })
      .flat();

    const currentEntries = findLorebooksEntries(
      lastMessagesWordsArray,
      lorebooks
        .map((lorebook) => lorebook?.entries || [])
        .flat()
        .map((entry) => ({
          keys: entry?.keys || [],
          content: entry?.content || '',
        })),
    );

    if (currentEntries.length > 0) {
      // load the top 3 entries
      currentEntries.slice(0, 3).forEach((entry, index) => {
        content += (index ? '\n' : '') + entry.content;
      });
    }

    return content;
  }
}
