import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import tokenizer, { LLaMATokenizer } from '../../tokenizers/LLaMATokenizer';
import axios from "axios";

export interface PygmalionServiceConfig extends Miku.Services.ServiceConfig {
  koboldEndpoint: string;
}

export type KoboldAIsettings = {
  maxContextLength: number;
  maxTokens: number;
  temp: number;
  topP: number;
  topK: number;
  topA: number;
  tailFreeSampling: number;
  typicalP: number;
  repetitionPenalty: number;
  repetitionPenaltyRange: number;
  repetitionPenaltySlope: number;
  order: number[];
};

export const PygmalionServicePropTypes = {
  settings: PropTypes.string,
  prompt: PropTypes.string,
};

export class PygmalionService extends Miku.Services.Service {
  private tokenizer: LLaMATokenizer;
  private koboldEndpoint: string;
  protected defaultProps: InferProps<typeof PygmalionServicePropTypes> = {
    settings: "",
    prompt: "",
  };

  protected getPropTypes(): PropTypes.ValidationMap<any> {
    return PygmalionServicePropTypes;
  }

  constructor(config: PygmalionServiceConfig) {
    super(config);
    this.koboldEndpoint = config.koboldEndpoint;
    this.tokenizer = tokenizer;
  }

  protected async computeInput(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<string> {
    const modelSettings: KoboldAIsettings = JSON.parse(input.settings);
    if (!modelSettings) return "";
    const completion = await axios.post<{ results: { text: string }[] }>(
      `${this.koboldEndpoint}/v1/generate`,
      {
        // use_story: false,
        // use_memory: false,
        // use_authors_note: false,
        // use_world_info: false,
        // max_context_length: modelSettings.max_context_length,
        // max_length: modelSettings.maxTokens,
        temperature: modelSettings.temp,
        top_p: modelSettings.topP,
        // top_k: modelSettings.topK,
        // top_a: modelSettings.topA,
        // tfs: modelSettings.tailFreeSampling,
        // typical: modelSettings.typicalP,
        // rep_pen: modelSettings.repetitionPenalty,
        // rep_pen_range: modelSettings.repetitionPenaltyRange,
        // rep_pen_slope: modelSettings.repetitionPenaltySlope,
        // sampler_order: modelSettings.order,
        prompt: input.prompt,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return completion.data.results.length
      ? completion.data.results[0].text
      : "";
  }

  protected async calculatePrice(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<number> {
    const modelSettings = JSON.parse(input.settings);
    const gptTokens = this.tokenizer.encode(input.prompt).length;
    return gptTokens + (modelSettings.maxTokens || 0);
  }
}
