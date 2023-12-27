import * as Strategies from './strategies'
import { RootState } from '../../state/store'
import { selectAllParentDialogues } from '../../state/selectors'
import { NarrationResponse } from '../../state/versioning'

export interface PromptBuilderOptions {
  strategy: Strategies.StrategySlug
  trucationLength: number
  maxNewTokens: number
}

class PromptBuilder {
  private options: PromptBuilderOptions
  private strategy: Strategies.AbstractPromptStrategy

  constructor(options: PromptBuilderOptions) {
    this.options = options
    this.strategy = this.getStrategyFromSlug(options.strategy)
  }

  public buildPrompt(state: RootState): {
    template: string
    variables: Record<string, string | string[]>
  } {
    const messages = selectAllParentDialogues(state)
    // binary search for the last message that fits within the max tokens
    const recursiveBinarySearch = (
      minIndex: number,
      maxIndex: number,
      maxTokens: number
    ): number => {
      if (minIndex > maxIndex) {
        return minIndex
      }
      const midIndex = Math.floor((minIndex + maxIndex) / 2)
      const tokens = this.strategy.buildPrompt(
        state,
        this.options.maxNewTokens,
        midIndex
      ).totalTokens
      if (tokens > maxTokens) {
        return recursiveBinarySearch(minIndex, midIndex - 1, maxTokens)
      } else {
        return recursiveBinarySearch(midIndex + 1, maxIndex, maxTokens)
      }
    }
    const memorySize =
      recursiveBinarySearch(0, messages.length, this.options.trucationLength) -
      1

    return this.strategy.buildPrompt(
      state,
      this.options.maxNewTokens,
      memorySize
    )
  }

  public completeResponse(
    response: NarrationResponse,
    variables: Map<string, string>
  ): NarrationResponse {
    return this.strategy.completeResponse(response, variables)
  }

  public setStrategy(strategy: Strategies.StrategySlug) {
    this.strategy = this.getStrategyFromSlug(strategy)
  }

  private getStrategyFromSlug(
    slug: Strategies.StrategySlug
  ): Strategies.AbstractPromptStrategy {
    switch (slug) {
      case 'roleplay':
        return new Strategies.RoleplayStrategy()
      default:
        throw new Error(`Invalid strategy slug: ${slug}`)
    }
  }
}

export default PromptBuilder
