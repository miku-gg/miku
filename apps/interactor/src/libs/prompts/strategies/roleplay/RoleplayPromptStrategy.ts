import { EMOTION_GROUP_TEMPLATES, EMPTY_MIKU_CARD, NovelV3, TavernCardV2 } from '@mikugg/bot-utils';
import { AbstractPromptStrategy, fillTextTemplate, parseLLMResponse } from '..';
import {
  selectAllParentDialoguesWhereCharactersArePresent,
  selectAvailableSummarySentences,
  selectCurrentCharacterOutfits,
  selectCurrentScene,
  selectLastLoadedCharacters,
  selectSummaryEnabled,
} from '../../../../state/selectors';
import { RootState } from '../../../../state/store';
import { NarrationInteraction, NarrationResponse } from '../../../../state/versioning';
import { findLorebooksEntries } from '../../../lorebookSearch';
import labels from './RoleplayPromptLabels';

const PROMPT_TOKEN_OFFSET = 50;

export const indicatorVarName = (indicatorName: string) => indicatorName.replace(/\W+/g, '_').toLowerCase();

export class RoleplayPromptStrategy extends AbstractPromptStrategy<
  {
    state: RootState;
    currentCharacterId: string;
  },
  NarrationResponse
> {
  protected getLabels(): Record<string, Record<string, string>> {
    return labels;
  }

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
    // get the charact outfit descriptions
    const outfitDescriptions = characters
      .map(({ outfit: outfitId, characterId }) => {
        const character = state.novel.characters.find((character) => character.id === characterId);
        const outfit = character?.card.data.extensions.mikugg_v2.outfits.find(
          (outfit) => outfit.id === outfitId,
        )?.description;
        return outfit
          ? {
              characterName: character.name,
              description: outfit,
            }
          : null;
      })
      .filter(Boolean);

    const { BOS, INPUT_START, SYSTEM_START, SYSTEM_END } = this.instructTemplate;

    let template = `${BOS}${SYSTEM_START}${this.i18n('system_prompt')} `;
    template += this.i18n('current_role', ['{{char}}', '{{char}}', '{{user}}']);
    template += `\n${this.i18n('avoid_repetition')}`;
    template += `\n${this.i18n('do_not_describe_user_actions', ['{{user}}', '{{char}}'])}`;
    template += `\n${this.i18n('must_indicate_reaction', ['{{char}}'])}`;
    template += `\n${this.i18n('must_not_repeat_reactions')}`;
    template += `\n${this.i18n('reaction_must_be_one_of', [emotionStrings])}`;

    if (persona || formattedAttributes) {
      template += `${SYSTEM_END}${INPUT_START}${persona}\n${formattedAttributes}\n`;
    }

    if (state.settings.prompt.systemPrompt) {
      template += `${state.settings.prompt.systemPrompt}\n`;
    }

    if (outfitDescriptions.length) {
      for (const outfitDescription of outfitDescriptions) {
        if (outfitDescription?.characterName && outfitDescription?.description) {
          template += `\n${this.i18n('character_outfit_description', [
            outfitDescription?.characterName || '',
            outfitDescription?.description || '',
          ])}\n`;
        }
      }
    }

    const lorebook = this.getContextForLorebookEntry(state, currentCharacterId);

    if (sampleChat.length || lorebook) {
      template += `\n${this.i18n('character_speech_example', ['{{char}}'])}\n`;
      for (const example of sampleChat) {
        template += example + '\n';
      }
      if (lorebook) {
        template += `${lorebook}\n`;
      }
    }

    template += `\n${this.i18n('roleplay_chat_begins', [
      [...characterTemplates, '{{user}}'].join(', '),
      '{{char}}',
    ])}\n`;

    if (selectSummaryEnabled(state)) {
      const sentences = selectAvailableSummarySentences(state, [currentCharacterId], maxTokens);
      if (sentences.length) {
        template += `${this.i18n('story_events_until_now')}\n${sentences.join('\n')}\n`;
      }
    }

    if (scene?.prompt) {
      template += `${this.i18n('current_scene')} ${scene.prompt}\n`;
    }

    scene?.characters.forEach((char) => {
      if (char.objective) {
        template += `\n${this.i18n('character_objective', [`{{${char.characterId}}}`])} ${char.objective}\n`;
      }
    });

    if (scene?.indicators) {
      template += `\n${this.i18n('current_indicators')}`;
      scene.indicators.forEach((indicator) => {
        template += `\n${indicator.name}: ${indicator.description} ${
          indicator.type === 'percentage'
            ? `${indicator.name} MUST be a percentage between 0 and 100.`
            : indicator.type === 'amount'
            ? `${indicator.name} MUST be an amount between ${indicator.min} and ${indicator.max}.`
            : `${indicator.name} MUST be one of the following: ${indicator.values?.join(', ')}.`
        }`;
      });
    }

    return template;
  }

  public template() {
    const { INPUT_START, INPUT_END, OUTPUT_START, OUTPUT_END, STOPS } = this.instructTemplate;
    return {
      askLine: `${INPUT_END}${OUTPUT_START}`,
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

    const scene = selectCurrentScene(input.state);
    const variables: Record<string, string | string[]> = {
      scene_opt: [' Yes', ' No'],
      cond_opt: Array.from({ length: 10 }, (_, i) => ' ' + i.toString()),
      emotions: emotions
        .filter((emotion) => (emotions.length > 1 ? emotion !== parentEmotion : true))
        .map((emotion) => ' ' + emotion),
    };

    if (scene?.indicators) {
      scene.indicators.forEach((indicator) => {
        if (indicator.type === 'discrete') {
          variables[`${indicatorVarName(indicator.name)}_options`] =
            indicator.values?.map((value) => ` ${value}`) || [];
        }
      });
    }

    return {
      template,
      variables,
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
      reasoning: currentCharacterResponse?.reasoning || '',
    };
    characterResponse.emotion = variables.get('emotion')?.trim() || characterResponse.emotion;
    characterResponse.text = parseLLMResponse(variables.get('text')?.trim() || '', currentCharacterName);
    characterResponse.reasoning = variables.get('reasoning')?.trim() || '';

    const index = response.characters.findIndex(({ characterId }) => characterId === input.currentCharacterId);

    const sceneId = input.state.narration.interactions[response?.parentInteractionId || '']?.sceneId;
    const scene = input.state.novel.scenes.find((scene) => scene.id === sceneId);
    const indicators = scene?.indicators || [];

    const updatedIndicators = indicators.map((indicator) => {
      const value =
        variables.get(indicatorVarName(indicator.name))?.trim() ||
        response.indicators?.find((m) => m.id === indicator.id)?.value;
      return { id: indicator.id, name: indicator.name, value: value || '' };
    });

    return {
      ...response,
      characters: [
        ...response.characters.slice(0, index !== -1 ? index : response.characters.length),
        characterResponse,
      ],
      indicators: updatedIndicators,
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
    let sceneId = '';
    let scene: NovelV3.NovelScene | undefined = undefined;
    const temp = this.template();

    const transformCutsceneToPrompt = (cutscene: NovelV3.CutScene): string => {
      return cutscene.parts
        .map((part) =>
          part.text
            .map((textPart) => (textPart.type === 'description' ? `*${textPart.content}*` : `"${textPart.content}"`))
            .join('\n'),
        )
        .join('\n');
    };

    for (const message of [...messages].reverse().slice(-maxLines)) {
      const messageSceneId =
        (message.type === 'interaction'
          ? message.item.sceneId
          : state.novel.starts.find((start) => start.id === message.item.id)?.sceneId) || sceneId;
      if (messageSceneId !== sceneId) {
        scene = state.novel.scenes.find((scene) => scene.id === messageSceneId);
        const cutscene = state.novel.cutscenes?.find((cutscene) => cutscene.id === scene?.cutScene?.id);
        if (cutscene?.parts.length) {
          prompt += `${temp.response}${transformCutsceneToPrompt(cutscene)}\n`;
        }
        sceneId = messageSceneId;
      }

      // Handle battle-related content for interactions
      if (message.type === 'interaction' && message.item.afterBattle) {
        const battleConfig = state.novel.battles?.find((b) => b.battleId === message.item.afterBattle!.battleId);
        if (battleConfig) {
          const isWin = message.item.afterBattle.isWin;
          const cutsceneId = isWin ? battleConfig.winCutsceneId : battleConfig.lossCutsceneId;

          if (cutsceneId) {
            const cutscene = state.novel.cutscenes?.find((c) => c.id === cutsceneId);
            if (cutscene?.parts.length) {
              prompt += `${temp.response}${transformCutsceneToPrompt(cutscene)}\n`;
            }
          }
        }
      }

      prompt += this.getDialogueLine(message, currentCharacter, prompt, scene?.indicators);

      // Handle battle-related content for responses
      if (message.type === 'response' && message.item.battleStartId) {
        const battleConfig = state.novel.battles?.find((b) => b.battleId === message.item.battleStartId);
        if (battleConfig) {
          // Add battle prompt
          if (battleConfig.prompt) {
            prompt += `${temp.response}*${battleConfig.prompt}*\n`;
          }

          // Add intro cutscene if it exists
          if (battleConfig.introCutsceneId) {
            const introCutscene = state.novel.cutscenes?.find((c) => c.id === battleConfig.introCutsceneId);
            if (introCutscene?.parts.length) {
              prompt += `${temp.response}${transformCutsceneToPrompt(introCutscene)}\n`;
            }
          }
        }
      }
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
    indicatorsFromScene?: NovelV3.NovelIndicator[],
  ): string {
    const temp = this.template();
    let prevCharString = '';
    let nextCharString = '';
    let currentCharacterIndex;
    let currentCharacter;
    let linePrefix = '';
    let indicatorsString = '';
    switch (dialog.type) {
      case 'response':
        indicatorsString =
          dialog.item.indicators?.reduce((prev, indicator) => {
            const indicatorFromScene = indicatorsFromScene?.find((m) => m.id === indicator.id);
            if (!indicatorFromScene) {
              return prev;
            } else {
              return (
                prev +
                `${indicatorFromScene?.name}: ${indicator.value}${
                  indicatorFromScene.type === 'percentage' ? '%' : ''
                }\n`
              );
            }
          }, '') || '';
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
                (indicatorsString ? indicatorsString + '\n' : '') +
                `${this.i18n('character_reaction', [`{{char}}`])}: ${currentCharacter.emotion}\n` +
                `{{char}}: ${currentCharacter.text}\n`
              : '') +
            (nextCharString ? `${temp.instruction}${nextCharString}\n` : '')
          );
        } else {
          return (
            (prevCharString ? `${temp.instruction}${prevCharString}\n` : '') +
            (currentCharacter.text
              ? temp.response +
                (indicatorsString ? indicatorsString + '\n' : '') +
                `{{char}}: ${currentCharacter.text}\n`
              : '') +
            '\n' +
            (nextCharString ? `${temp.instruction}${nextCharString}\n` : '')
          );
        }
      case 'interaction':
        linePrefix = dialog.item.query.startsWith('OOC:') ? '' : '{{user}}: ';
        if ((currentText?.lastIndexOf(temp.instruction) || 0) < (currentText?.lastIndexOf(temp.response) || 1))
          return `${temp.instruction}${linePrefix}${dialog.item.query}\n`;
        else return `${linePrefix}${dialog.item.query}\n`;
    }
  }

  protected getResponseAskLine(state: RootState, maxTokens: number, characterId: string): string {
    const temp = this.template();
    const currentResponse = state.narration.responses[state.narration.currentResponseId];
    const currentCharacterResponse = currentResponse?.characters.find((char) => char.characterId === characterId);
    const scene = selectCurrentScene(state);

    const existingIndicators = currentResponse?.indicators || [];
    const existingEmotion = currentCharacterResponse?.emotion || '';
    const existingText = currentCharacterResponse?.text || '';
    const charStops = scene?.characters
      .map(({ characterId }) => {
        const character = state.novel.characters.find((char) => char.id === characterId);
        const charName = (character?.name || '').replace(/"/g, '\\"');

        return `"\\n${charName}:","\\n${charName}'s reaction:","# "`;
      })
      .concat(temp.stops.map((stop) => `"${stop}"`))
      .join(',');

    const userSanitized = state.settings.user.name.replace(/"/g, '\\"');

    let response = temp.askLine;
    let alreadyReacted = false;

    if (this.hasReasoning) {
      if (state.settings.prompt.reasoningEnabled) {
        response += `<think>\nOkay, the reaction that {{char}} will show is${
          existingEmotion ? ' ' + existingEmotion : '{{SEL emotion options=emotions}}'
        }. So,{{GEN reasoning max_tokens=512 stop=["</think>"]}}</think>\n`;
        alreadyReacted = true;
      } else {
        response += '<think></think>\n';
      }
    }

    response += `${this.i18n('reaction_instruction')}\n`;

    if (scene?.indicators) {
      scene.indicators.forEach((indicator) => {
        const existingIndicator = existingIndicators.find((m) => m.id === indicator.id);
        if (existingIndicator) {
          response += `${indicator.name}: ${existingIndicator.value}${indicator.type === 'percentage' ? '%' : ''}\n`;
        } else {
          if (indicator.inferred && (indicator.type === 'percentage' || indicator.type === 'amount')) {
            response += `${indicator.name}: {{GEN ${indicatorVarName(indicator.name)} max_tokens=3 stop=["%"]}}\n`;
          } else if (indicator.type === 'discrete') {
            response += `${indicator.name}: {{SEL ${indicatorVarName(indicator.name)} options=${indicatorVarName(
              indicator.name,
            )}_options}}\n`;
          }
        }
      });
    }

    if (!alreadyReacted) {
      response += `${this.i18n('character_reaction', ['{{char}}'])}:${
        existingEmotion ? ' ' + existingEmotion : '{{SEL emotion options=emotions}}'
      }\n`;
    }
    response += `{{char}}:${existingText}{{GEN text max_tokens=${maxTokens} stop=["\\n${userSanitized}:",${charStops}]}}`;
    return response;
  }

  static getConditionPrompt({
    condition,
    instructionPrefix,
    responsePrefix,
    language,
  }: {
    condition: string;
    instructionPrefix: string;
    responsePrefix: string;
    language: string;
  }) {
    const getLabel = (key: string) => RoleplayPromptStrategy.getLabel(language, key);
    return (
      `\n${instructionPrefix}OOC: ${getLabel('has_condition_happened')}: ${condition}` +
      `\nAnswer with Yes or No` +
      `\n${responsePrefix}${getLabel('based_on_last_two_messages')}{{SEL cond options=cond_opt}}`
    );
  }

  static getLabel(language: string, key: string) {
    return labels[language]?.[key] || labels['en']?.[key] || key;
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
