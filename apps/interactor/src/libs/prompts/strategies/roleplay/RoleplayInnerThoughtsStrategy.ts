import { AbstractPromptStrategy } from '../AbstractPromptStrategy';
import { RootState } from '../../../../state/store';
import { NarrationResponse } from '../../../../state/versioning';

export class RoleplayInnerThoughtsStrategy extends AbstractPromptStrategy<RootState, NarrationResponse> {
  protected getLabels(): Record<string, Record<string, string>> {
    const labels = {
      en: {
        inner_thoughts_prompt: '%\'s inner thoughts: "',
      },
      es: {
        inner_thoughts_prompt: 'Pensamientos internos de %: "',
      },
      es_es: {
        inner_thoughts_prompt: 'Pensamientos internos de %: "',
      },
      fr: {
        inner_thoughts_prompt: 'Pensées intérieures de %"',
      },
      de: {
        inner_thoughts_prompt: 'Innere Gedanken von %: "',
      },
      it: {
        inner_thoughts_prompt: 'Pensieri interiori di %: "',
      },
      pt: {
        inner_thoughts_prompt: 'Pensamentos internos de %: "',
      },
      ru: {
        inner_thoughts_prompt: 'Внутренние мысли %: "',
      },
      ja: {
        inner_thoughts_prompt: '%の内面の思考: "',
      },
      ko: {
        inner_thoughts_prompt: '%의 내면의 생각: "',
      },
      zh: {
        inner_thoughts_prompt: '%的内心想法: "',
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
    const currentReaction = currentCharacter?.emotion || '';
    const characterResponse = currentCharacter?.text || '';
    
    // the template that the AI will autocomplete
    const { BOS, SYSTEM_START, SYSTEM_END, INPUT_START, INPUT_END, OUTPUT_START } = this.instructTemplate;
    
    let template = `${BOS}${SYSTEM_START}You are ${characterName}. Based on what was said to you and your response, write your inner thoughts. Write ONLY your internal thoughts, feelings, opinions, and mental reactions.`;
    template += `Do NOT describe actions, movements, or external observations. Do NOT explain what you are doing or reference your role. Do NOT label your thoughts. `;
    template += `Write in first person (use "I", "me", "my", etc.). Don't say "My inner thoughts" or "My thoughts", or ${characterName}'s inner thoughts, or anything like that.`;
    template += `Just write your thoughts directly without any prefix or explanation.${SYSTEM_END}`;
    template += `${INPUT_START}`;
    template += `${characterName}'s reaction: "${currentReaction}"\n`;
    template += `${characterName}: "${characterResponse}"\n`;
    template += `${characterName}'s inner thoughts: `;
    template += `${INPUT_END}${OUTPUT_START}`;
    template += `{{GEN inner_thoughts max_tokens=${maxNewTokens} stop=["\\n"]}}`;

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
    return updatedResponse;
  }

}
