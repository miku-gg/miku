import { ModelType } from '../state/versioning'

import { _i18n } from './lang/i18n'

import {
  RoleplayStrategySlug,
  isOfTypeStrategySlug,
} from './prompts/strategies/roleplay'

interface ModelMetadata {
  strategy: RoleplayStrategySlug
  tokenizer: string
  truncation_length: number
}

const cacheStrategy = new Map<ModelType, ModelMetadata>()

export async function retrieveModelMetadata(
  servicesEndpoint: string,
  model: ModelType
): Promise<ModelMetadata> {
  try {
    if (!cacheStrategy.get(model)) {
      const response = await fetch(
        `${servicesEndpoint}/text/metadata/${model}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      if (!response.ok || response.status != 200) {
        throw new Error(_i18n('ERROR_GETTING_PROMPT_STRATEGY'))
      }
      const data = await response.json()
      cacheStrategy.set(model, data as ModelMetadata)
    }

    const metadata = cacheStrategy.get(model)

    return {
      strategy:
        metadata?.strategy && isOfTypeStrategySlug(metadata?.strategy)
          ? metadata?.strategy
          : 'alpacarp',
      tokenizer: metadata?.tokenizer || 'llama',
      truncation_length: metadata?.truncation_length || 4096,
    }
  } catch (error) {
    console.error(error)
    return {
      strategy: 'alpacarp',
      tokenizer: 'llama',
      truncation_length: 4096,
    }
  }
}
