import { ModelType } from '../state/versioning'
import {
  RoleplayStrategySlug,
  isOfTypeStrategySlug,
} from './prompts/strategies/roleplay'

const cacheStrategy = new Map<ModelType, RoleplayStrategySlug>()

export async function retrieveModelStrategy(
  servicesEndpoint: string,
  model: ModelType
): Promise<RoleplayStrategySlug> {
  try {
    if (!cacheStrategy.get(model)) {
      const response = await fetch(
        `${servicesEndpoint}/text/strategy/${model}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      if (!response.ok || response.status != 200) {
        throw new Error('Error getting prompt strategy')
      }
      const data = await response.json()
      cacheStrategy.set(model, data.strategy as RoleplayStrategySlug)
    }

    const strategy = cacheStrategy.get(model)

    return isOfTypeStrategySlug(strategy) ? strategy : 'alpacarp'
  } catch (error) {
    console.error(error)
    return 'alpacarp'
  }
}
