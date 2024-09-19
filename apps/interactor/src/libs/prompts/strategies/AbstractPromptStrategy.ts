import llamaTokenizer, { Tokenizer } from '../_llama-tokenizer';
import { getInstructTemplateFromSlug, InstructTemplate, InstructTemplateSlug } from './instructTemplates';

const cache: { [key: string]: number } = {};

const memoizedTokenize = (line: string): number => {
  if (line in cache) {
    return cache[line];
  }
  const result = llamaTokenizer.encode(line).length;
  cache[line] = result;
  return result;
};

const TOKEN_OFFSET_CONSTANT = 10;
function tokenizeAndSum(text: string): number {
  const lines = text.split('\n');
  const sum = lines.reduce((acc, line) => acc + memoizedTokenize(line), 0);

  return sum + lines.length + TOKEN_OFFSET_CONSTANT;
}

export abstract class AbstractPromptStrategy<Input, Output> {
  // eslint-disable-next-line
  // @ts-ignore
  private tokenizer: Tokenizer;
  protected instructTemplate: InstructTemplate;

  constructor(_instructTemplate: InstructTemplateSlug = 'llama3') {
    this.tokenizer = llamaTokenizer;
    this.instructTemplate = getInstructTemplateFromSlug(_instructTemplate);
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
    return tokenizeAndSum(_template) + maxTokens;
  }
}
