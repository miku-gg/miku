import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';

export const WhisperServicePropTypes = {
  openai_key: PropTypes.string,
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
    openai_key: '',
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
    const filePath = this.audioFilePath + '/' + input.file;
    try {
      const [_filename, _fileextension] = input.file?.split('.') || ['',''];
      if (!input.file || isNaN(Number(_filename)) || _fileextension !== 'wav') {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
        return ''
      }
  
      let openai = this.openai;
      if (input.openai_key) {
        openai = new OpenAIApi(new Configuration({
          apiKey: input.openai_key,
        }));
      }
      const stream = fs.createReadStream(filePath);
      const resp = await openai.createTranscription(
        // @ts-ignore
        stream,
        "whisper-1",
      ).catch(e => {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
      });
  
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    return resp?.data?.text || '';
    } catch (e) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    return '';
    }
  };
}