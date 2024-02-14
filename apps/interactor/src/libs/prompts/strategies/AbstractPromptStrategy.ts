import llamaTokenizer, { Tokenizer } from '../_llama-tokenizer'
import mistralTokenizer from '../_mistral-tokenizer'

export abstract class AbstractPromptStrategy<Input, Output> {
  private tokenizer: Tokenizer
  constructor(tokenizerSkug: string) {
    if (tokenizerSkug === 'mistral') {
      this.tokenizer = mistralTokenizer
    } else {
      this.tokenizer = llamaTokenizer
    }
  }
  public abstract buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: Input
  ): {
    template: string
    variables: Record<string, string | string[]>
    totalTokens: number
  }

  public abstract completeResponse(
    input: Input,
    response: Output,
    variables: Map<string, string>
  ): Output

  protected countTokens(template: string): number {
    const _template = template.replace(/{{.*?}}/g, '')
    return this.tokenizer.encode(_template).length
  }
}
