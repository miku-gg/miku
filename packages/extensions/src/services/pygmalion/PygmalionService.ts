import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import GPT3Tokenizer from "gpt3-tokenizer";
import axios from "axios";

export interface PygmalionServiceConfig extends Miku.Services.ServiceConfig {
  koboldEndpoint: string;
}

export const PygmalionServicePropTypes = {
  settings: PropTypes.string,
  prompt: PropTypes.string,
};

export class PygmalionService extends Miku.Services.Service {
  private tokenizer: GPT3Tokenizer;
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
    this.tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  }

  protected async computeInput(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<string> {
    const modelSettings = JSON.parse(input.settings);
    if (!modelSettings) return "";
    const completion = await axios.post<{ results: { text: string }[] }>(
      `${this.koboldEndpoint}/v1/generate`,
      {
        use_story: false,
        use_memory: false,
        use_authors_note: false,
        use_world_info: false,
        max_context_length: modelSettings.max_context_length,
        max_length: modelSettings.maxTokens,
        temperature: modelSettings.temp,
        top_p: modelSettings.topP,
        top_k: modelSettings.topK,
        top_a: modelSettings.topA,
        tfs: modelSettings.tailFreeSampling,
        typical: modelSettings.typicalP,
        rep_pen: modelSettings.repetitionPenalty,
        rep_pen_range: modelSettings.repetitionPenaltyRange,
        rep_pen_slope: modelSettings.repetitionPenaltySlope,
        sampler_order: modelSettings.order,
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
    const gptTokens = this.tokenizer.encode(input.prompt).bpe.length;
    return gptTokens + (modelSettings.maxTokens || 0);
  }
}
