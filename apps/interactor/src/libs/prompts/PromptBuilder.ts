import * as Strategies from './strategies'
import { RootState } from '../../state/store'
import { selectAllParentDialogues } from '../../state/selectors'
import { NarrationResponse } from '../../state/versioning'

export interface RoleplayPromptBuilderOptions {
  strategy: Strategies.StrategySlug
  trucationLength: number
  maxNewTokens: number
}

class RoleplayPromptBuilder {
  private options: RoleplayPromptBuilderOptions
  private strategy: Strategies.AbstractRoleplayStrategy

  constructor(options: RoleplayPromptBuilderOptions) {
    this.options = options
    this.strategy = this.getStrategyFromSlug(options.strategy)
  }

  public buildPrompt(
    state: RootState,
    role: string
  ): {
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
      const tokens = this.strategy.buildGuidancePrompt(
        this.options.maxNewTokens,
        midIndex,
        { state, currentRole: role }
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

    return this.strategy.buildGuidancePrompt(
      this.options.maxNewTokens,
      memorySize,
      { state, currentRole: role }
    )
  }

  public completeResponse(
    response: NarrationResponse,
    variables: Map<string, string>,
    role: string,
    state: RootState
  ): NarrationResponse {
    return this.strategy.completeResponse(
      { currentRole: role, state },
      response,
      variables
    )
  }

  public setRoleplayStrategy(strategy: Strategies.StrategySlug) {
    this.strategy = this.getStrategyFromSlug(strategy)
  }

  private getStrategyFromSlug(
    slug: Strategies.StrategySlug
  ): Strategies.AbstractRoleplayStrategy {
    switch (slug) {
      case 'alpacarp':
        return new Strategies.RoleplayStrategyAlpaca()
      case 'metharmerp':
        return new Strategies.RoleplayStrategyMetharme()
      default:
        throw new Error(`Invalid strategy slug: ${slug}`)
    }
  }
}

export default RoleplayPromptBuilder
