

import * as  Core from '@mikugg/core';
import PropTypes from 'prop-types';
import { SBertSimilarityAPIClient } from './SBertEmbeddingsAPI';

const CONTEXT_CHANGE_EMBEDDINGS_HASH = '0x0';

const EmotionContextPropTypes = {
  id: PropTypes.string.isRequired,
  embeddingsHash: PropTypes.string.isRequired,
};

export const SBertEmotionInterpreterPropTypes = {
  botResponse: PropTypes.string.isRequired,
  completePrompt: PropTypes.string.isRequired,
  currentContextId: PropTypes.string.isRequired,
  contexts: PropTypes.arrayOf(PropTypes.shape(EmotionContextPropTypes).isRequired).isRequired,
  contextDescriptionsHash: PropTypes.string.isRequired,
}

export type EmotionContext = PropTypes.InferProps<typeof EmotionContextPropTypes>

export type SBertEmotionInterpreterProps = PropTypes.InferProps<typeof SBertEmotionInterpreterPropTypes>;

export interface SbertEmotionInterpreterOutput {
  emotionId: string
  contextId: string
  nextContextId: string
}

interface SBertEmotionInterpreterServiceConfig extends Core.Services.ServiceConfig {
  sbertEmbeddingsAPIUrl: string
  sbertEmbeddingsAPIToken: string
}

export class SBertEmotionInterpreterService extends Core.Services.Service<SbertEmotionInterpreterOutput> {
  private similarityAPI: SBertSimilarityAPIClient;

  constructor(config: SBertEmotionInterpreterServiceConfig) {
    super(config);
    this.similarityAPI = new SBertSimilarityAPIClient({
      url: config.sbertEmbeddingsAPIUrl,
      authToken: config.sbertEmbeddingsAPIToken,
    });
  }

  protected defaultProps: SBertEmotionInterpreterProps = {
    botResponse: '',
    completePrompt: '',
    currentContextId: '',
    contextDescriptionsHash: '',
    contexts: [],
  };

  protected getPropTypes() {
    return SBertEmotionInterpreterPropTypes;
  }

  protected async computeInput(input: SBertEmotionInterpreterProps): Promise<SbertEmotionInterpreterOutput> {
    const { completePrompt, botResponse, currentContextId, contexts, contextDescriptionsHash } = input;

    const nextContext = await this.findContext(contexts, currentContextId, contextDescriptionsHash, completePrompt, botResponse);

    const { similarities: emotionSimilarities } = await this.similarityAPI.searchSimilarities({
      text: botResponse,
      embeddingsHash: currentContextId,
      topK: 1,
    });

    const emotionId = emotionSimilarities.length > 0 ? emotionSimilarities[0].id : '';

    return {
      emotionId,
      contextId: currentContextId,
      nextContextId: nextContext.id,
    };
  }

  protected async calculatePrice(input: SBertEmotionInterpreterProps): Promise<number> {
    return 0;
  }

  protected async findContext(contexts: EmotionContext[], currentContextId: string, contextDescriptionsHash: string, completePrompt: string, botResponse: string): Promise<EmotionContext> {
    let context = contexts.find(context => context.id === currentContextId);

    if (!context) {
      throw new Error(`Context ${context} not found`);
    }

    // figure out if we need to change context
    const { similarities: contextChangeSimilarities } = await this.similarityAPI.searchSimilarities({
      text: botResponse,
      embeddingsHash: CONTEXT_CHANGE_EMBEDDINGS_HASH,
      topK: 4,
    });

    const shouldContextChange = contextChangeSimilarities.reduce((acc, similarity) => {
      return acc && similarity.score > 0.5;
    }, true);

    // if we need to change context, we need to find the new context
    if (shouldContextChange) {
      const { similarities: contextSimilarities } = await this.similarityAPI.searchSimilarities({
        text: completePrompt,
        embeddingsHash: contextDescriptionsHash,
        topK: 1,
      });
      

      context = contexts.find(context => context.id === contextSimilarities[0].id);
      if (!context) {
        throw new Error(`Context ${context} not found`);
      }
    }

    return context;
  }
}
