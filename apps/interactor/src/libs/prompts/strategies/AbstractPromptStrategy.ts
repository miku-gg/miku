import llamaTokenizer, { Tokenizer } from '../_llama-tokenizer';

export abstract class AbstractPromptStrategy<Input, Output> {
  // eslint-disable-next-line
  // @ts-ignore
  private tokenizer: Tokenizer;
  constructor(_tokenizerSkug?: string) {
    this.tokenizer = llamaTokenizer;
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
    // ESTIMATED TOKEN COUNT
    const averageTokensPerWord = 1.3; // Pre-computed average, may vary based on your specific tokenizer

    const words = template.trim().split(/\s+/);
    const wordCount = words.length;

    let specialCharCount = 0;
    for (const word of words) {
      specialCharCount += (word.match(/[^a-zA-Z0-9]/g) || []).length;
    }

    return Math.ceil(wordCount * averageTokensPerWord + specialCharCount * 0.5);
    // let maxTokens: number = 0;
    // template.replace(/max_tokens=(\d+)/g, (_, _maxTokens) => {
    //   maxTokens += parseInt(_maxTokens) || 0;
    //   return '';
    // });
    // const _template = template.replace(/{{.*?}}/g, '');
    // return this.tokenizer.encode(_template).length + maxTokens;
  }
}
