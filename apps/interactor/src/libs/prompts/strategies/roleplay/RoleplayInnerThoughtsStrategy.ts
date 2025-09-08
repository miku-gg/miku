import { AbstractPromptStrategy } from '../AbstractPromptStrategy';
import { RootState } from '../../../../state/store';
import { NarrationResponse } from '../../../../state/versioning';

export class RoleplayInnerThoughtsStrategy extends AbstractPromptStrategy<RootState, NarrationResponse> {
  protected getLabels(): Record<string, Record<string, string>> {
    const labels = {
      en: {
        inner_thoughts_prompt: '%\'s inner thoughts (first person): "',
      },
      es: {
        inner_thoughts_prompt: 'Pensamientos internos de % (primera persona): "',
      },
      es_es: {
        inner_thoughts_prompt: 'Pensamientos internos de % (primera persona): "',
      },
      fr: {
        inner_thoughts_prompt: 'Pensées intérieures de % (première personne): "',
      },
      de: {
        inner_thoughts_prompt: 'Innere Gedanken von % (erste Person): "',
      },
      it: {
        inner_thoughts_prompt: 'Pensieri interiori di % (prima persona): "',
      },
      pt: {
        inner_thoughts_prompt: 'Pensamentos internos de % (primeira pessoa): "',
      },
      ru: {
        inner_thoughts_prompt: 'Внутренние мысли % (от первого лица): "',
      },
      ja: {
        inner_thoughts_prompt: '%の内面の思考 (一人称): "',
      },
      ko: {
        inner_thoughts_prompt: '%의 내면의 생각 (1인칭): "',
      },
      zh: {
        inner_thoughts_prompt: '%的内心想法 (第一人称): "',
      },
    };
    return labels;
  }

  public buildGuidancePrompt(
    maxNewTokens: number,
    _memorySize: number,
    input: RootState,
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    const currentResponse = input.narration.responses[input.narration.currentResponseId];
    const selectedCharacterId = currentResponse?.selectedCharacterId;
    const characterName = input.novel.characters.find(char => char.id === selectedCharacterId)?.name || 'Character';
    
    // Get the character's response text to provide context
    const currentCharacter = currentResponse?.characters.find(char => char.characterId === selectedCharacterId);
    const characterResponse = currentCharacter?.text || '';
    
    // the template that the AI will autocomplete
    const { BOS, SYSTEM_START, SYSTEM_END, INPUT_START, INPUT_END, OUTPUT_START } = this.instructTemplate;
    
    let template = `${BOS}${SYSTEM_START}You are completing the inner thoughts for a character. Generate what the character is thinking based on their response. Write the inner thoughts in first person from the character's perspective (use "I", "me", "my", etc.).${SYSTEM_END}`;
    template += `${INPUT_START}${characterName}: "${characterResponse}"\n${this.i18n('inner_thoughts_prompt', [characterName])}`;
    template += `${INPUT_END}${OUTPUT_START}`;
    template += `{{GEN inner_thoughts max_tokens=${maxNewTokens} stop=["\\"", "\\n"]}}`;

    console.log('RoleplayInnerThoughtsStrategy - buildGuidancePrompt:', {
      characterName,
      characterResponse,
      template,
      variables: {
        character_name: characterName,
        character_response: characterResponse,
        inner_thoughts: '',
      }
    });

    return {
      template,
      variables: {
        character_name: characterName,
        character_response: characterResponse,
        inner_thoughts: '',
      },
      totalTokens: this.countTokens(template) + maxNewTokens,
    };
  }

  public completeResponse(_input: RootState, response: NarrationResponse, variables: Map<string, string>): NarrationResponse {
    const innerThoughts = variables.get('inner_thoughts') || '';
    const selectedCharacterId = response.selectedCharacterId;
    
    console.log('RoleplayInnerThoughtsStrategy - completeResponse:', {
      innerThoughts,
      selectedCharacterId,
      variables: Object.fromEntries(variables),
      originalResponse: response
    });
    
    // Update the innerThoughts field
    const updatedResponse = {
      ...response,
      characters: response.characters.map(char => {
        if (char.characterId === selectedCharacterId) {
          return {
            ...char,
            innerThoughts: innerThoughts,
          };
        }
        return char;
      }),
    };

    console.log('RoleplayInnerThoughtsStrategy - updatedResponse:', updatedResponse);
    return updatedResponse;
  }

}
