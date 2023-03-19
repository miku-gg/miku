

import * as  Core from '@mikugg/core';
import PropTypes from 'prop-types';
import { SBertSimilarityAPIClient } from './SBertEmbeddingsAPI';

//Standard emotions
//QmXqKJ5RALQ2RFEHVxGQ5jEwr6Lwaj3GpT6s6SL32taYhj
//Lewd emotions
//QmVTv5EvHm6k1T6RbLK9FnVnAGRR16W46m9yZCViXuwQQZ

const CONTEXT_CHANGE_EMBEDDINGS_HASH = 'Qmcrx4SX9iLA3TF6xLz7Sr5gxXHHCG4GkREkudrRjp1BKj';

const EmotionContextPropTypes = {
  id: PropTypes.string.isRequired,
  emotion_embeddings: PropTypes.string.isRequired,
  context_change_trigger: PropTypes.string.isRequired,
  emotion_images: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    hashes: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired).isRequired,
};

export const SBertEmotionInterpreterPropTypes = {
  botResponse: PropTypes.string.isRequired,
  completePrompt: PropTypes.string.isRequired,
  currentContextId: PropTypes.string.isRequired,
  start_context: PropTypes.string.isRequired,
  contexts: PropTypes.arrayOf(PropTypes.shape(EmotionContextPropTypes).isRequired).isRequired,
  context_base_description_embeddings: PropTypes.string.isRequired,
}

export type EmotionContext = PropTypes.InferProps<typeof EmotionContextPropTypes>

export type SBertEmotionInterpreterProps = PropTypes.InferProps<typeof SBertEmotionInterpreterPropTypes>;

export interface SbertEmotionInterpreterOutput {
  shouldContextChange: boolean
  emotionId: string
  contextId: string
  nextContextId: string
}

interface SBertEmotionInterpreterServiceConfig extends Core.Services.ServiceConfig {
  sbertSimilarityAPIUrl: string
  sbertSimilarityAPIToken: string
}

export class SBertEmotionInterpreterService extends Core.Services.Service<SbertEmotionInterpreterOutput> {
  private similarityAPI: SBertSimilarityAPIClient;

  constructor(config: SBertEmotionInterpreterServiceConfig) {
    super(config);
    this.similarityAPI = new SBertSimilarityAPIClient({
      url: config.sbertSimilarityAPIUrl,
      authToken: config.sbertSimilarityAPIToken,
    });
  }

  protected defaultProps: SBertEmotionInterpreterProps = {
    botResponse: '',
    completePrompt: '',
    currentContextId: '',
    start_context: '',
    context_base_description_embeddings: '',
    contexts: [],
  };

  protected getPropTypes() {
    return SBertEmotionInterpreterPropTypes;
  }

  protected async computeInput(input: SBertEmotionInterpreterProps): Promise<SbertEmotionInterpreterOutput> {
    const { completePrompt, botResponse, currentContextId, contexts, context_base_description_embeddings: contextDescriptionsHash } = input;

    const {currentContext, nextContext, shouldContextChange} = await this.findContext(contexts, currentContextId, contextDescriptionsHash, completePrompt);

    const { similarities: emotionSimilarities } = await this.similarityAPI.searchSimilarities({
      text: botResponse,
      embeddingsHash: currentContext.emotion_embeddings,
      topK: 1,
    });

    const emotionId = emotionSimilarities.length > 0 ? emotionSimilarities[0].id : '';

    return {
      shouldContextChange,
      emotionId,
      contextId: currentContext.id,
      nextContextId: nextContext.id,
    };
  }

  protected async calculatePrice(input: SBertEmotionInterpreterProps): Promise<number> {
    return 0;
  }

  protected async findContext(contexts: EmotionContext[], currentContextId: string, contextDescriptionsHash: string, completePrompt: string): Promise<{currentContext: EmotionContext, nextContext: EmotionContext, shouldContextChange: boolean}> {
    const context = contexts.find(context => context.id === currentContextId);

    if (!context) {
      throw new Error(`Context ${context} not found`);
    }

    let nextContext = context;

    // figure out if we need to change context
    const { similarities: contextChangeSimilarities } = await this.similarityAPI.searchSimilarities({
      text: completePrompt,
      embeddingsHash: CONTEXT_CHANGE_EMBEDDINGS_HASH,
      topK: 5,
    });

    const shouldContextChange = contextChangeSimilarities.reduce((acc, similarity) => {
      return acc && similarity.score > 0.30;
    }, true);

    // if we need to change context, we need to find the new context
    if (shouldContextChange) {
      const { similarities: contextSimilarities } = await this.similarityAPI.searchSimilarities({
        text: completePrompt,
        embeddingsHash: contextDescriptionsHash,
        topK: 1,
      });
      

      nextContext = contexts.find(context => context.id === contextSimilarities[0].id) || context;
      if (!nextContext) {
        throw new Error(`Context ${nextContext} not found`);
      }
    }

    return {nextContext, shouldContextChange, currentContext: context};
  }
}
