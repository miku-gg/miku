import { AbstractPromptStrategy } from './strategies';

type InferI<T> = T extends AbstractPromptStrategy<infer I, unknown> ? I : never;
type InferO<T> = T extends AbstractPromptStrategy<unknown, infer O> ? O : never;

export interface PromptBuilderOptions<StrategyClass extends AbstractPromptStrategy<unknown, unknown>> {
  strategy: StrategyClass;
  truncationLength: number;
  maxNewTokens: number;
}
class PromptBuilder<StrategyClass extends AbstractPromptStrategy<unknown, unknown>> {
  private options: PromptBuilderOptions<AbstractPromptStrategy<InferI<StrategyClass>, InferO<StrategyClass>>>;
  private strategy: AbstractPromptStrategy<InferI<StrategyClass>, InferO<StrategyClass>>;

  constructor(options: PromptBuilderOptions<AbstractPromptStrategy<InferI<StrategyClass>, InferO<StrategyClass>>>) {
    this.options = options;
    this.strategy = options.strategy as AbstractPromptStrategy<InferI<StrategyClass>, InferO<StrategyClass>>;
  }

  public buildPrompt(
    input: InferI<StrategyClass>,
    maxMemorySize: number,
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    // binary search for the last message that fits within the max tokens
    const recursiveBinarySearch = (minIndex: number, maxIndex: number, maxTokens: number): number => {
      if (minIndex > maxIndex) {
        return minIndex;
      }
      const midIndex = Math.floor((minIndex + maxIndex) / 2);
      const tokens = this.strategy.buildGuidancePrompt(this.options.maxNewTokens, midIndex, input).totalTokens;
      if (tokens > maxTokens) {
        return recursiveBinarySearch(minIndex, midIndex - 1, maxTokens);
      } else {
        return recursiveBinarySearch(midIndex + 1, maxIndex, maxTokens);
      }
    };
    const memorySize =
      recursiveBinarySearch(0, maxMemorySize, this.options.truncationLength - this.options.maxNewTokens) - 1;

    return this.strategy.buildGuidancePrompt(this.options.maxNewTokens, memorySize, input);
  }

  public completeResponse(
    response: InferO<StrategyClass>,
    variables: Map<string, string>,
    input: InferI<StrategyClass>,
  ): InferO<StrategyClass> {
    return this.strategy.completeResponse(input, response, variables);
  }

  public setStrategy(strategy: AbstractPromptStrategy<InferI<StrategyClass>, InferO<StrategyClass>>) {
    this.strategy = strategy;
  }

  public setTrucationLength(truncationLength: number) {
    this.options.truncationLength = truncationLength;
  }
}

export default PromptBuilder;
