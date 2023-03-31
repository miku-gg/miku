import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import GPT3Tokenizer from 'gpt3-tokenizer';
import { getLLaMAModelSettings, llamaModels } from "./LLaMASettings";
import axios from "axios";

export interface LLaMaServiceConfig extends Miku.Services.ServiceConfig {
  gradioEndpoint: string;
}

export const LLaMAServicePropTypes = {
  "model": PropTypes.oneOf(llamaModels),
  "prompt": PropTypes.string
}

export class LLaMAService extends Miku.Services.Service {
  private tokenizer: GPT3Tokenizer;
  private gradioEndpoint: string;
  protected defaultProps: InferProps<typeof LLaMAServicePropTypes>  = {
    "model": 'llama-30b',
    "prompt": ''
  };

  protected getPropTypes(): PropTypes.ValidationMap<any> {
    return LLaMAServicePropTypes;
  }

  constructor(config: LLaMaServiceConfig) {
    super(config);
    this.gradioEndpoint = config.gradioEndpoint;
    this.tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  }

  protected async computeInput(input: InferProps<typeof this.propTypesRequired>): Promise<string> {
    const modelSettings = getLLaMAModelSettings(input.model);
    if (!modelSettings) return '';
    const completion = await axios.post<{data: string}>(`${this.gradioEndpoint}/run/textgen`, {
      data: [
        input.prompt,
        modelSettings.max_new_tokens,
        modelSettings.do_sample,
        modelSettings.temperature,
        modelSettings.top_p,
        modelSettings.typical_p,
        modelSettings.repetition_penalty,
        modelSettings.encoder_repetition_penalty,
        modelSettings.top_k,
        modelSettings.min_length,
        modelSettings.no_repeat_ngram_size,
        modelSettings.num_beams,
        modelSettings.penalty_alpha,
        modelSettings.length_penalty,
        modelSettings.early_stopping,
        modelSettings.seed
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return (completion?.data?.data || [''])[0].replace(input.prompt, '') || '';
  }

  protected async calculatePrice(input: InferProps<typeof this.propTypesRequired>): Promise<number> {
    const modelSettings = getLLaMAModelSettings(input.model);
    const gptTokens = this.tokenizer.encode(input.prompt).bpe.length;
    return gptTokens + (modelSettings?.max_new_tokens || 0);
  }
}