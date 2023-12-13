import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import OpenAI from 'openai';
import fs from 'fs';

export const WhisperServicePropTypes = {
  openai_key: PropTypes.string,
  language: PropTypes.oneOf(['en', 'es', 'ko']),
  file: PropTypes.string,
  model: PropTypes.string,
};
export type WhisperServiceInput = InferProps<typeof WhisperServicePropTypes>;
export type WhisperServiceOutput = string;

export interface WhisperServiceConfig extends Miku.Services.ServiceConfig<WhisperServiceInput, string> {
  costPerRequest: number;
  apiKey?: string;
  audioFilePath?: string;
}

export class WhisperService extends Miku.Services.Service<WhisperServiceInput, string> {
  protected costPerRequest: number;
  protected apiKey: string;
  protected audioFilePath: string;
  private openai: OpenAI;

  constructor(config: WhisperServiceConfig) {
    super(config);
    this.apiKey = config.apiKey || '';
    this.costPerRequest = config.costPerRequest;
    this.audioFilePath = config.audioFilePath || '';
    this.openai = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  protected async computeInput(input: WhisperServiceInput): Promise<string> {
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
        openai = new OpenAI({
          apiKey: input.openai_key,
        });
      }
      const stream = fs.createReadStream(filePath);
      const resp = await openai.audio.transcriptions.create(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
    return resp?.text || '';
    } catch (e) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    return '';
    }
  }

  protected override getDefaultInput(): WhisperServiceInput {
    return {
      openai_key: '',
      language: 'en',
      model: 'whisper-1'
    };
  }

  protected override getDefaultOutput(): string {
    return '';
  }

  protected override validateInput(input: WhisperServiceInput): void {
    PropTypes.checkPropTypes(WhisperServicePropTypes, input, 'input', 'WhisperService');
  }
}