import * as  Core from '@mikugg/core';
import PropTypes, { InferProps } from 'prop-types';
import axios from 'axios';

export const SBertEmbeddingsPropTypes = {
  text: PropTypes.string.isRequired,
  embeddingsHash: PropTypes.string.isRequired,
  topK: PropTypes.number.isRequired,
}
export type SBertEmbeddingsProps = InferProps<typeof SBertEmbeddingsPropTypes>;

interface EmbeddingAPIEndpoint {
  url: string
  authToken: string
}

export interface SBertEmbeddingsServiceConfig extends Core.Services.ServiceConfig {
  sentenceEmbedderEndpoint: EmbeddingAPIEndpoint
  similiartySearchEndpoint: EmbeddingAPIEndpoint
}

interface SimilarityResult {
  id: string,
  score: number
}

export interface SBertEmbeddingsServiceOutput {
  similarities: SimilarityResult[]
}

export class SBertEmbeddingsService extends Core.Services.Service<SBertEmbeddingsServiceOutput> {
  private sentenceEmbedderEndpoint: EmbeddingAPIEndpoint;
  private similiartySearchEndpoint: EmbeddingAPIEndpoint;
  static propTypes = SBertEmbeddingsPropTypes;

  protected defaultProps = {
    text: '',
    embeddingsHash: '',
    topK: 3,
  };

  protected getPropTypes(): typeof SBertEmbeddingsPropTypes {
    return SBertEmbeddingsPropTypes;
  }

  constructor(config: SBertEmbeddingsServiceConfig) {
    super(config);
    this.sentenceEmbedderEndpoint = config.sentenceEmbedderEndpoint;
    this.similiartySearchEndpoint = config.similiartySearchEndpoint;
  }

  protected async computeInput(input: SBertEmbeddingsProps): Promise<SBertEmbeddingsServiceOutput> {
    const { similiartySearchEndpoint } = this;
    const { embeddingsHash, text, topK } = input;

    const { data: similarities } = await axios.post<SimilarityResult[]>(`${similiartySearchEndpoint.url}/search`, {
      text,
      embeddings_file_hash: embeddingsHash,
      limit: topK
    }, { headers: { 'Authorization': `Bearer ${similiartySearchEndpoint.authToken}` } });

    return {
      similarities: similarities || []
    };
  }

  protected async calculatePrice(input: SBertEmbeddingsProps): Promise<number> {
    return 20 * input.topK;
  }
}
