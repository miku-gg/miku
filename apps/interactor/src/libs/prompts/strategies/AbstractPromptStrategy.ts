import mistralTokenizer, { Tokenizer } from '../_mistral-tokenizer';
import { getInstructTemplateFromSlug, InstructTemplate, InstructTemplateSlug } from './instructTemplates';

const nemoTokenizer = mistralTokenizer;

const cache: { [key: string]: number } = {};

export const memoizedTokenize = (line: string): number => {
  if (line in cache) {
    return cache[line];
  }
  const result = nemoTokenizer.encode(line).length;
  cache[line] = result;
  return result;
};

const TOKEN_OFFSET_CONSTANT = 10;
export function tokenizeAndSum(text: string): number {
  const lines = text.split('\n');
  const sum = lines.reduce((acc, line) => acc + memoizedTokenize(line), 0);

  return sum + lines.length + TOKEN_OFFSET_CONSTANT;
}

export abstract class AbstractPromptStrategy<Input, Output> {
  // eslint-disable-next-line
  // @ts-ignore
  private tokenizer: Tokenizer;
  protected instructTemplate: InstructTemplate;
  protected language: string; // Added language property
  protected hasReasoning: boolean;

  constructor(
    _instructTemplate: InstructTemplateSlug = 'chatml',
    language: string = 'en', // Added language parameter with default 'en'
    hasReasoning: boolean = false,
  ) {
    this.tokenizer = nemoTokenizer;
    this.instructTemplate = getInstructTemplateFromSlug(_instructTemplate);
    this.language = language;
    this.hasReasoning = hasReasoning;
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

  protected abstract getLabels(): Record<string, Record<string, string>>;

  protected i18n(labelKey: string, replacements: string[] = []): string {
    const labels = this.getLabels();
    let text = labels[this.language?.toLowerCase()]?.[labelKey] || labels['en']?.[labelKey] || labelKey;
    replacements.forEach((replacement) => {
      text = text.replace('%', replacement);
    });
    return text;
  }
}
