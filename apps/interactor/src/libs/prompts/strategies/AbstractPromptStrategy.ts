import { Tokenizer } from '../_llama-tokenizer';
import mistralTokenizer from '../_mistral-tokenizer';

export abstract class AbstractPromptStrategy<Input, Output> {
  private tokenizer: Tokenizer;
  constructor(_tokenizerSkug?: string) {
    this.tokenizer = mistralTokenizer;
  }
  public abstract buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: Input,
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  };

  public abstract completeResponse(input: Input, response: Output, variables: Map<string, string>): Output;

  protected countTokens(template: string): number {
    let maxTokens: number = 0;
    template.replace(/max_tokens=(\d+)/g, (_, _maxTokens) => {
      maxTokens += parseInt(_maxTokens) || 0;
      return '';
    });
    const _template = template.replace(/{{.*?}}/g, '');
    return this.tokenizer.encode(_template).length + maxTokens;
  }
}
