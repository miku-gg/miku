import * as  Core from '@mikugg/core';
import OpenAI from 'openai';
import PropTypes, { InferProps } from 'prop-types';
import GPT3Tokenizer from 'gpt3-tokenizer';
import cosineSimilarity from 'compute-cosine-similarity';
import axios from 'axios';
import { assert } from 'console';
const Hash = require('ipfs-only-hash');

// Based on QmWLtYCXoDXEjw2nuXfkoXv9T7J8umcnF6CyyRjtFuW1UE
// Migrate to <any> emotion set
const Emotions = [
  "angry",
  "sad",
  "happy",
  "disgusted",
  "begging",
  "scared",
  "excited",
  "hopeful",
  "longing",
  "proud",
  "neutral",
  "rage",
  "scorn",
  "blushed",
  "pleasure",
  "lustful",
  "shocked",
  "confused",
  "disappointed",
  "embarrassed",
  "guilt",
  "shy",
  "frustrated",
  "annoyed",
  "exhausted",
  "tired",
  "curious",
  "intrigued",
  "amused"
] as const;
export type Emotion = typeof Emotions[number];

export const Emotion2ImgProps = {
  "angry": PropTypes.string,
  "sad": PropTypes.string,
  "happy": PropTypes.string,
  "disgusted": PropTypes.string,
  "begging": PropTypes.string,
  "scared": PropTypes.string,
  "excited": PropTypes.string,
  "hopeful": PropTypes.string,
  "longing": PropTypes.string,
  "proud": PropTypes.string,
  "neutral": PropTypes.string,
  "rage": PropTypes.string,
  "scorn": PropTypes.string,
  "blushed": PropTypes.string,
  "pleasure": PropTypes.string,
  "lustful": PropTypes.string,
  "shocked": PropTypes.string,
  "confused": PropTypes.string,
  "disappointed": PropTypes.string,
  "embarrassed": PropTypes.string,
  "guilt": PropTypes.string,
  "shy": PropTypes.string,
  "frustrated": PropTypes.string,
  "annoyed": PropTypes.string,
  "exhausted": PropTypes.string,
  "tired": PropTypes.string,
  "curious": PropTypes.string,
  "intrigued": PropTypes.string,
  "amused": PropTypes.string,
}

export type OpenAIEmotionConfig = {embedding: number[], emotion: string}[];

export const EmotionInterpreterPropTypes = {
  prompt: PropTypes.string,
  openai_key: PropTypes.string,
  emotionConfigHash: PropTypes.string,
  images: PropTypes.shape(Emotion2ImgProps)
}
export type EmotionInterpreterProps = InferProps<typeof EmotionInterpreterPropTypes>;

export interface OpenAIEmotionInterpreterConfig extends Core.Services.ServiceConfig {
  apiKey: string;
  emotionConfigsEndpoint: string
  defaultConfigHash: string
}

export interface EmotionInterpreterOutput {
  success: boolean;
  error: string;
  emotion: Emotion;
}

export class OpenAIEmotionInterpreter extends Core.Services.Service<EmotionInterpreterOutput> {
  protected override propTypes: PropTypes.ValidationMap<any> = EmotionInterpreterPropTypes;
  protected override getPropTypes(): PropTypes.ValidationMap<any> {
    return EmotionInterpreterPropTypes;
  }
  protected override defaultProps: InferProps<typeof EmotionInterpreterPropTypes> = {
    openai_key: '',
    prompt: '',
    emotionConfigHash: '',
    images: {
      angry: '',
      sad: '',
      happy: '',
      disgusted: '',
      begging: '',
      scared: '',
      excited: '',
      hopeful: '',
      longing: '',
      proud: '',
      neutral: '',
      rage: '',
      scorn: '',
      blushed: '',
      pleasure: '',
      lustful: '',
      shocked: '',
      confused: '',
      disappointed: '',
      embarrassed: '',
      guilt: '',
      shy: '',
      frustrated: '',
      annoyed: '',
      exhausted: '',
      tired: '',
      curious: '',
      intrigued: '',
      amused: ''
    },
  };

  private apiKey: string;
  private emotionConfigsEndpoint: string;
  private tokenizer: GPT3Tokenizer;
  private openai: OpenAI;
  private loadedEmotionConfigs: Map<string, OpenAIEmotionConfig> = new Map();
  private defaultConfigHash: string;

  constructor(config: OpenAIEmotionInterpreterConfig) {
    super(config);
    this.apiKey = config.apiKey || '';
    this.emotionConfigsEndpoint = config.emotionConfigsEndpoint || '';
    this.tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
    this.openai = new OpenAI({
      apiKey: this.apiKey,
    });
    this.defaultConfigHash = config.defaultConfigHash;
  }

  async calculatePrice(): Promise<number> {
    return 100;
  }

  async computeInput(input: InferProps<typeof EmotionInterpreterPropTypes>): Promise<EmotionInterpreterOutput> {
    let openai = this.openai;
    if (input.openai_key) {
      openai = new OpenAI({
        apiKey: input.openai_key,
      });
    }
    const [embeddingInput, emotionConfig] = await Promise.all([
      openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: input.prompt || '',
      }).then(result => result.data[0].embedding).catch(() => []),
      this.getEmotionConfig(input.emotionConfigHash || this.defaultConfigHash)
    ]);

    let similarities: {emotion: Emotion, similarity: number}[] = [];

    if (embeddingInput.length) {
      similarities = emotionConfig.emotionConfig.map(({embedding, emotion}) => {
        return {emotion: emotion as Emotion, similarity: cosineSimilarity(embedding, embeddingInput)};
      }).sort((a, b) => b.similarity - a.similarity);  
    }

    return {
      success: embeddingInput && emotionConfig.success,
      error: emotionConfig.error || (embeddingInput.length ? '' : 'could not embed prompt'),
      emotion: similarities.length ? similarities[0].emotion : 'neutral'
    };
  }

  private async getEmotionConfig(emotionConfigHash: string): Promise<{success: boolean, error: string, emotionConfig: OpenAIEmotionConfig}> {
    if (!this.loadedEmotionConfigs.has(emotionConfigHash)) {
      try {
        const emotionConfigAPIResult = await axios.get(`${this.emotionConfigsEndpoint}/${emotionConfigHash}`, {responseType: 'text'}).catch(_ => {
          throw 'emotion config not found';
        });
        const emotionConfigRaw = await emotionConfigAPIResult.data;
        const _emotionConfigHash = await Hash.of(emotionConfigRaw) as string;
        const _emotionConfig = JSON.parse(emotionConfigRaw);

        assert(_emotionConfigHash === emotionConfigHash, `emotion config hash mismatch`);
        const INVALID_FORMAT_ERROR = 'emotion config invalid format';
        _emotionConfig.forEach(({embedding, emotion}: {embedding: number[], emotion: string}) => {
          assert(embedding.length, INVALID_FORMAT_ERROR);
          assert(typeof emotion === 'string' && emotion.length, INVALID_FORMAT_ERROR);
          embedding.forEach(item => assert(typeof item === 'number', INVALID_FORMAT_ERROR));
        });

        this.loadedEmotionConfigs.set(emotionConfigHash, _emotionConfig);
      } catch (error) {
        return {
          success: false,
          error: (error || 'unknown error') as string,
          emotionConfig: []
        };
      }
    }
    return {
      success: true,
      error: '',
      emotionConfig: this.loadedEmotionConfigs.get(emotionConfigHash) || [],
    };
  }
}