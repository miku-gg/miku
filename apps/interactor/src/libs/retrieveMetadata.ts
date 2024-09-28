import { ModelType } from '../state/versioning';
import { InstructTemplateSlug, isInstructTemplateSlug } from './prompts/strategies/instructTemplates';

interface ModelMetadata {
  strategy: InstructTemplateSlug;
  tokenizer: string;
  truncation_length: number;
  max_new_tokens: number;
  secondary: {
    id: ModelType;
    strategy: InstructTemplateSlug;
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
      strategy: metadata?.strategy && isInstructTemplateSlug(metadata?.strategy) ? metadata?.strategy : 'llama3',
      tokenizer: metadata?.tokenizer || 'llama',
      truncation_length: metadata?.truncation_length || 4096,
      max_new_tokens: metadata?.max_new_tokens || 200,
      secondary: {
        id: (metadata?.secondary?.id as ModelType) || 'RP',
        strategy: metadata?.secondary?.strategy || 'llama3',
        tokenizer: metadata?.secondary?.tokenizer || 'llama',
        truncation_length: metadata?.secondary?.truncation_length || 4096,
        max_new_tokens: metadata?.secondary?.max_new_tokens || 200,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      strategy: 'llama3',
      tokenizer: 'llama',
      truncation_length: 4096,
      max_new_tokens: 200,
      secondary: {
        id: ModelType.RP,
        strategy: 'llama3',
        tokenizer: 'llama',
        truncation_length: 4096,
        max_new_tokens: 200,
      },
    };
  }
}

export function getExistingModelMetadata(model: ModelType): ModelMetadata {
  const metadata = cacheStrategy.get(model);
  if (metadata) {
    return metadata;
  } else {
    return {
      strategy: 'llama3',
      tokenizer: 'llama',
      truncation_length: 4096,
      max_new_tokens: 200,
      secondary: {
        id: ModelType.RP,
        strategy: 'llama3',
        tokenizer: 'llama',
        truncation_length: 4096,
        max_new_tokens: 200,
      },
    };
  }
}
