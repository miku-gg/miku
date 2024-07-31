import { ModelType } from '../state/versioning';
import { RoleplayStrategySlug, isOfTypeStrategySlug } from './prompts/strategies/roleplay';

interface ModelMetadata {
  strategy: RoleplayStrategySlug;
  tokenizer: string;
  truncation_length: number;
  max_new_tokens: number;
  secondary: {
    id: ModelType;
    strategy: RoleplayStrategySlug;
    tokenizer: string;
    truncation_length: number;
    max_new_tokens: number;
  };
}

const cacheStrategy = new Map<ModelType, ModelMetadata>();

export async function retrieveModelMetadata(servicesEndpoint: string, model: ModelType): Promise<ModelMetadata> {
  try {
    if (!cacheStrategy.get(model)) {
      const response = await fetch(`${servicesEndpoint}/text/metadata/${model}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok || response.status != 200) {
        throw new Error('Error getting prompt strategy');
      }
      const data = await response.json();
      cacheStrategy.set(model, data as ModelMetadata);
    }

    const metadata = cacheStrategy.get(model);

    return {
      strategy: metadata?.strategy && isOfTypeStrategySlug(metadata?.strategy) ? metadata?.strategy : 'alpacarp',
      tokenizer: metadata?.tokenizer || 'llama',
      truncation_length: metadata?.truncation_length || 4096,
      max_new_tokens: metadata?.max_new_tokens || 200,
      secondary: {
        id: (metadata?.secondary?.id as ModelType) || 'RP',
        strategy: metadata?.secondary?.strategy || 'alpacarp',
        tokenizer: metadata?.secondary?.tokenizer || 'llama',
        truncation_length: metadata?.secondary?.truncation_length || 4096,
        max_new_tokens: metadata?.secondary?.max_new_tokens || 200,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      strategy: 'alpacarp',
      tokenizer: 'llama',
      truncation_length: 4096,
      max_new_tokens: 200,
      secondary: {
        id: ModelType.RP,
        strategy: 'alpacarp',
        tokenizer: 'llama',
        truncation_length: 4096,
        max_new_tokens: 200,
      },
    };
  }
}
