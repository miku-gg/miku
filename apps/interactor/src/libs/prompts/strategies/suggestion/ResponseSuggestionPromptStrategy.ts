import { AbstractPromptStrategy } from '../AbstractPromptStrategy';
import { selectChatHistory } from '../../../../state/selectors';
import { RootState } from '../../../../state/store';

export class ResponseSuggestionPromptStrategy extends AbstractPromptStrategy<RootState, string[]> {
  protected getLabels(): Record<string, string> {
    const labels: Record<string, Record<string, string>> = {
      en: {
        writing_assistant_intro:
          'You are a writing assistant that will help you write a story. You suggest replies to a conversation.',
        suggest_replies:
          'Suggest 3 possible reply Smart/Funny/Flirty dialogs from {{user}} to continue the conversation. They MUST BE ONE SENTENCE EACH.',
      },
      es: {
        // Spanish translations
      },
      fr: {
        // French translations
      },
    };

    return labels[this.language] || labels['en'];
  }

  protected i18n(labelKey: string): string {
    const labels = this.getLabels();
    return labels[labelKey] || labelKey;
  }

  public buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: RootState,
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    const personas = Object.values(input.novel.characters)
      .map((character) => character?.card?.data?.description || '')
      .filter(Boolean)
      .join('\n');
    const messages = this.getMessagesPrompt(input, memorySize);
    const { BOS, SYSTEM_START, SYSTEM_END, INPUT_START, INPUT_END, OUTPUT_START } = this.instructTemplate;
    let template = `${BOS}${SYSTEM_START}You are a writing assistant that will help you write a story. You suggest replies to a conversation.\n`;
    template += `\n${personas}\nConversation:\n${messages}`;
    template += `${SYSTEM_END}${INPUT_START}`;
    template += `Suggest 3 possible reply Smart/Funny/Flirty dialogs from ${input.settings.user.name} to continue the conversation. They MUST BE ONE SENTENCE EACH.\n`;
    template += `${INPUT_END}${OUTPUT_START}`;
    template += `Smart Reply: ${input.settings.user.name}: "{{GEN smart max_tokens=${maxNewTokens} stop=["\\"", "\\n"]}}"\n`;
    template += `Funny Reply: ${input.settings.user.name}: "{{GEN funny max_tokens=${maxNewTokens} stop=["\\"", "\\n"]}}"\n`;
    template += `Flirty Reply: ${input.settings.user.name}: "{{GEN flirt max_tokens=${maxNewTokens} stop=["\\"", "\\n"]}}"\n`;

    return {
      template,
      variables: {},
      totalTokens: this.countTokens(template) + maxNewTokens * 3,
    };
  }

  public completeResponse(_input: RootState, response: string[], variables: Map<string, string>): string[] {
    response[0] = variables.get('funny') || '';
    response[1] = variables.get('smart') || '';
    response[2] = variables.get('flirt') || '';
    return response;
  }

  public getMessagesPrompt(state: RootState, memorySize: number): string {
    const messages = selectChatHistory(state)
      .filter((_, index) => index < memorySize)
      .map((message) => `${message.name}: ${message.text}`)
      .reverse()
      .join('\n');

    return messages;
  }
}
