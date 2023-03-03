import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import GPT3Tokenizer from 'gpt3-tokenizer';
import { getPygmalionModelSettings, pygmalionModels } from "./PygmalionSettings";
import axios from "axios";

export interface PygmalionServiceConfig extends Miku.Services.ServiceConfig {
  koboldEndpoint: string;
}

export const PygmalionServicePropTypes = {
  "model": PropTypes.oneOf(pygmalionModels),
  "prompt": PropTypes.string
}

export class PygmalionService extends Miku.Services.Service {
  private tokenizer: GPT3Tokenizer;
  private koboldEndpoint: string;
  protected defaultProps: InferProps<typeof PygmalionServicePropTypes>  = {
    "model": 'pygmalion-6b',
    "prompt": ''
  };

  protected getPropTypes(): PropTypes.ValidationMap<any> {
    return PygmalionServicePropTypes;
  }

  constructor(config: PygmalionServiceConfig) {
    super(config);
    this.koboldEndpoint = config.koboldEndpoint;
    this.tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  }

  protected async computeInput(input: InferProps<typeof this.propTypesRequired>): Promise<string> {
    const modelSettings = getPygmalionModelSettings(input.model);
    if (!modelSettings) return '';
    const completion = await axios.post<{results: {text: string}[]}>(`${this.koboldEndpoint}/v1/generate`, {
      "use_story": false,
      "use_memory": false,
      "use_authors_note": false,
      "use_world_info": false,
      "max_context_length": modelSettings.max_length,
      "max_length": 2048,
      "rep_pen": modelSettings.rep_pen,
      "rep_pen_range": modelSettings.rep_pen_range,
      "rep_pen_slope": modelSettings.rep_pen_slope,
      "temperature": modelSettings.temp,
      "tfs": modelSettings.tfs,
      "top_a": modelSettings.top_a,
      "top_k": modelSettings.top_k,
      "top_p": modelSettings.top_p,
      "typical": modelSettings.typical,
      "sampler_order": modelSettings.sampler_order,
      prompt: input.prompt,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return completion.data.results.length ? completion.data.results[0].text : '';
  }

  protected async calculatePrice(input: InferProps<typeof this.propTypesRequired>): Promise<number> {
    const modelSettings = getPygmalionModelSettings(input.model);
    const gptTokens = this.tokenizer.encode(input.prompt).bpe.length;
    return gptTokens + (modelSettings?.max_length || 0) * Math.max(1, modelSettings?.numseqs || 1);
  }
}