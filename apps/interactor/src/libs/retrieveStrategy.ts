import { ModelType } from '../state/versioning'
import { StrategySlug, isOfTypeStrategySlug } from './memory/strategies'

const cacheStrategy = new Map<ModelType, StrategySlug>()

export async function retrieveStrategy(
  servicesEndpoint: string,
  model: ModelType
): Promise<StrategySlug> {
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
      cacheStrategy.set(model, data.strategy as StrategySlug)
    }

    const strategy = cacheStrategy.get(model)

    return isOfTypeStrategySlug(strategy) ? strategy : 'alpacarp'
  } catch (error) {
    console.error(error)
    return 'alpacarp'
  }
}
