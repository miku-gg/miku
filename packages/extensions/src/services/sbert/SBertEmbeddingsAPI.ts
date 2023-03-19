import * as  Core from '@mikugg/core';
import axios from 'axios';

export interface SBertSimilarityParams {
  text: string,
  embeddingsHash: string,
  topK: number
}

export interface SBertEmbedderParams {
  textsToEmbedd: {
    id: string
    text: string
  }[]
}

interface EmbeddingAPIEndpoint {
  url: string
  authToken: string
}

interface SimilarityResult {
  id: string,
  score: number
}

export class SBertSimilarityAPIClient {
  private similiartySearchEndpoint: EmbeddingAPIEndpoint

  constructor(similiartySearchEndpoint: EmbeddingAPIEndpoint) {
    this.similiartySearchEndpoint = similiartySearchEndpoint;
  }

  async searchSimilarities(input: SBertSimilarityParams): Promise<{ similarities: SimilarityResult[] }> {
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
}

export class SBertEmbedderAPIClient {
  private sentenceEmbedderEndpoint : EmbeddingAPIEndpoint

  constructor(sentenceEmbedderEndpoint: EmbeddingAPIEndpoint) {
    this.sentenceEmbedderEndpoint = sentenceEmbedderEndpoint;
  }

  // TODO
  async embeddCSV(input: SBertEmbedderParams): Promise<{ embeddingsHash: string }> {
    const { sentenceEmbedderEndpoint } = this;
    const { textsToEmbedd } = input;

    // Creates csv file with texts
    const csvContentHeader = 'id,text\n';
    const csvContent = csvContentHeader + textsToEmbedd.map(({ id, text }) => `"${id}","${text}"`).join('\n');
    const csvFile = new File([csvContent], 'texts.csv', { type: 'text/csv' });

    // Sends csv file to the API
    const formData = new FormData();
    formData.append('file', csvFile);
    // the api returns a file
    const { data: embeddingsFile } = await axios.post(`${sentenceEmbedderEndpoint.url}/embedd`, formData, {
      headers: {
        Authorization: `Bearer ${sentenceEmbedderEndpoint.authToken}`,
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'blob'
    });

    // upload embeddingsFile to the bot directory
    return { embeddingsHash: '' };
  }
}