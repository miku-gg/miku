import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import axios from "axios";
import { TokenizerType, tokenCount } from "../../tokenizers/Tokenizers";
import { AphroditeConfig } from "..";

export interface OobaboogaServiceConfig extends Miku.Services.ServiceConfig {
  gradioEndpoint: string;
  apiKey: string;
}

export const OobaboogaServicePropTypes = {
  settings: PropTypes.string,
  prompt: PropTypes.string,
  gradioEndpoint: PropTypes.string,
};

export type OobaboogaSettings = {
  temp: number;
  maxTokens: number;
  topP: number;
  topK: number;
  typicalP: number;
  repetitionPenalty: number;
  encoderRepitionPenalty: number;
  noRepeatNgramSize: number;
  minLength: number;
  doSample: boolean;
  seed: number;
  penaltyAlpha: number;
  numBeams: number;
  lengthPenalty: number;
  earlyStopping: boolean;
  addBosToken: boolean;
  banEosToken: boolean;
  truncateLength: number;
  stoppingStrings: string;
  skipSpecialTokens: boolean;
};

export class OobaboogaService extends Miku.Services.Service {
  private gradioEndpoint: string;
  private apiKey: string;
  protected defaultProps: InferProps<typeof OobaboogaServicePropTypes> = {
    prompt: "",
    gradioEndpoint: "",
  };

  protected getPropTypes(): PropTypes.ValidationMap<any> {
    return OobaboogaServicePropTypes;
  }

  constructor(config: OobaboogaServiceConfig) {
    super(config);
    this.gradioEndpoint = config.gradioEndpoint;
    this.apiKey = config.apiKey || '';
  }

  protected async computeInput(
    input: InferProps<typeof OobaboogaServicePropTypes>
  ): Promise<string> {
    const modelSettings: OobaboogaSettings = JSON.parse(input.settings || '{}');
    if (!modelSettings) return "";
    const tokens = tokenCount(input.prompt || '', TokenizerType.LLAMA);
    const maxTokens = Math.min(modelSettings.maxTokens || 100, modelSettings.truncateLength - tokens)
    if (maxTokens <= 0) return "";

    let gradioEndpoint = this.gradioEndpoint;
    let apiKey = this.apiKey;
    if (input.gradioEndpoint) {
      gradioEndpoint = input.gradioEndpoint;
      apiKey = '';
    }
    const completionConfig: AphroditeConfig = {
      n: 1,
      max_tokens: modelSettings.maxTokens,
      temperature: modelSettings.temp,
      top_p: modelSettings.topP,
      typical_p: modelSettings.typicalP,
      repetition_penalty: modelSettings.repetitionPenalty,
      top_k: modelSettings.topK,
      presence_penalty: modelSettings.penaltyAlpha,
      length_penalty: modelSettings.lengthPenalty,
      early_stopping: modelSettings.earlyStopping,
      truncation_length: modelSettings.truncateLength,
      skip_special_tokens: modelSettings.skipSpecialTokens,
      stop: modelSettings.stoppingStrings
        ? modelSettings.stoppingStrings.split(",")
        : [],
    }
    const completion = await axios.post(
      `${gradioEndpoint}/completions`,
      {
        ...completionConfig,
        model: 'default',
        prompt: input.prompt,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": 'Bearer ' + apiKey,
        },
      }
    );

    const choices = completion?.data?.choices || [];
    const result = choices.length ? choices[0].text || "" : "";
    return result || '';
  }

  protected async calculatePrice(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<number> {
    const modelSettings = JSON.parse(input.settings);
    const tokens = tokenCount(input.prompt, TokenizerType.LLAMA);
    return tokens + (modelSettings.maxTokens || 0);
  }
}

