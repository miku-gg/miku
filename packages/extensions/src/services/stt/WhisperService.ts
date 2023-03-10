import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';

const HEX_STRING_REGEX = /[0-9A-Fa-f]{6}/g;

export const WhisperServicePropTypes = {
  apiKey: PropTypes.string,
  language: PropTypes.oneOf(['en', 'es', 'ko']),
  file: PropTypes.string,
  model: PropTypes.string,
};

export interface WhisperServiceConfig extends Miku.Services.ServiceConfig {
  costPerRequest: number;
  apiKey?: string;
  audioFilePath?: string;
}

export class WhisperService extends Miku.Services.Service<string> {
  protected defaultProps: InferProps<typeof WhisperServicePropTypes>  = {
    apiKey: '',
    language: 'en',
    model: 'whisper-1'
  };
  protected costPerRequest: number;
  protected apiKey: string;
  protected audioFilePath: string;
  private openai: OpenAIApi;

  constructor(config: WhisperServiceConfig) {
    super(config);
    this.apiKey = config.apiKey || '';
    this.costPerRequest = config.costPerRequest;
    this.audioFilePath = config.audioFilePath || '';
    this.openai = new OpenAIApi(new Configuration({
      apiKey: this.apiKey,
    }));
  }

  protected override getPropTypes(): PropTypes.ValidationMap<any> {
    return WhisperServicePropTypes;
  }

  protected override async calculatePrice(input: PropTypes.InferProps<PropTypes.ValidationMap<any>>): Promise<number> {
    return this.costPerRequest;
  }

  protected async computeInput(input: InferProps<typeof WhisperServicePropTypes>): Promise<string> {
    if (!input.file || !HEX_STRING_REGEX.test(input.file.split('.')[0])) return '';
    const stream = fs.createReadStream(this.audioFilePath + '/' + input.file);
    const resp = await this.openai.createTranscription(
      // @ts-ignore
      stream,
      "whisper-1",
    ).catch(e => console.error(e));

    return resp?.data?.text || '';
  };
}