

import * as  Core from '@mikugg/core';
import { SBertSimilarityAPIClient } from './SBertEmbeddingsAPI';
import { EmotionGuidanceServicePropTypes, EmotionGuidanceServiceProps } from '..';

//Standard emotions
//QmXqKJ5RALQ2RFEHVxGQ5jEwr6Lwaj3GpT6s6SL32taYhj
//Lewd emotions
//QmVTv5EvHm6k1T6RbLK9FnVnAGRR16W46m9yZCViXuwQQZ

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

export class SBertEmotionInterpreterService extends Core.Services.Service<string> {
  private similarityAPI: SBertSimilarityAPIClient;
  protected defaultProps: EmotionGuidanceServiceProps = {
    emotions: [],
    messages: [],
    query: '',
  };

  constructor(config: SBertEmotionInterpreterServiceConfig) {
    super(config);
    this.similarityAPI = new SBertSimilarityAPIClient({
      url: config.sbertSimilarityAPIUrl,
      authToken: config.sbertSimilarityAPIToken,
    });
  }

  protected getPropTypes() {
    return EmotionGuidanceServicePropTypes;
  }

  protected async computeInput(input: EmotionGuidanceServiceProps): Promise<string> {
    const { emotions, query } = input;
    // standard
    let embeddingsHash = 'Qmdr5ooTdADLFZA6dCvTE28neq1S7aQwZyma7266weGJZV'
    // lewd
    if (emotions?.includes('desire')) {
      embeddingsHash = 'QmPNrWHqQJK4Uj1ZsBMTUT6RAPrVRTF6ngdydm8cQZe71C'
    }

    const { similarities: emotionSimilarities } = await this.similarityAPI.searchSimilarities({
      text: query || '',
      embeddingsHash,
      topK: 1,
    });

    const emotionId = emotionSimilarities.length > 0 ? emotionSimilarities[0].id : '';

    return emotionId;
  }

  protected async calculatePrice(): Promise<number> {
    return 0;
  }
}
