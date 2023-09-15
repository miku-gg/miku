

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
    audio: PropTypes.string,
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
    const { botResponse, currentContextId, contexts } = input;

    // TODO: implement shouldContextChange detection
    // const {currentContext, nextContext, shouldContextChange} = await this.findContext(contexts, currentContextId, contextDescriptionsHash, completePrompt);
    const currentContext = contexts.find(context => context.id === currentContextId);
    if (!currentContext) {
      throw new Error(`Context ${currentContext} not found`);
    }


    const { similarities: emotionSimilarities } = await this.similarityAPI.searchSimilarities({
      text: botResponse,
      embeddingsHash: currentContext.emotion_embeddings,
      topK: 1,
    });

    const emotionId = emotionSimilarities.length > 0 ? emotionSimilarities[0].id : '';

    return {
      shouldContextChange: false,
      emotionId,
      contextId: currentContext.id,
      nextContextId: currentContext.id,
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
    let shouldContextChange = false;

    // figure out if we need to change context
    if (contexts.length > 1) {
      const { similarities: contextChangeSimilarities } = await this.similarityAPI.searchSimilarities({
        text: completePrompt,
        embeddingsHash: CONTEXT_CHANGE_EMBEDDINGS_HASH,
        topK: 5,
      });
  
      shouldContextChange =  contextChangeSimilarities.slice(0, 5).reduce((acc, similarity) => {
        return acc && similarity.score > 0.28;
      }, true);
    }

    // if we need to change context, we need to find the new context
    if (shouldContextChange) {
      const { similarities: contextSimilarities } = await this.similarityAPI.searchSimilarities({
        text: completePrompt,
        embeddingsHash: contextDescriptionsHash,
        topK: 2,
      });

      const fstContextOptionId = contextSimilarities.length && contextSimilarities[0].id || context.id;
      const sndContextOptionId = contextSimilarities.length > 1 && contextSimilarities[1].id  || context.id;

      const nextContextId = fstContextOptionId === context.id ? sndContextOptionId : fstContextOptionId;

      nextContext = contexts.find(context => context.id === nextContextId) || context;
      if (!nextContext) {
        throw new Error(`Context ${nextContext} not found`);
      }
    }

    return {nextContext, shouldContextChange, currentContext: context};
  }
}
