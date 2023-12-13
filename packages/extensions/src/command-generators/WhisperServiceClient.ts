import * as Core from '@mikugg/core';
import { Services } from '..';
import axios from 'axios';
import { WhisperServiceInput, WhisperServiceOutput } from '../services';

export class WhisperServiceClient {
  private serviceClient: Core.Services.ServiceClient<WhisperServiceInput, WhisperServiceOutput>;
  private fileUploadEndpoint: string;
  private openai_key: string

  constructor(
    fileUploadEndpoint: string,
    whisperServiceEndpoint: string,
    openai_key: string
  ) {
    this.fileUploadEndpoint = fileUploadEndpoint;
    this.serviceClient = new Core.Services.ServiceClient<WhisperServiceInput, WhisperServiceOutput>(
      whisperServiceEndpoint,
      Services.ServicesNames.WhisperSTT,
    );
    this.openai_key = openai_key;
  }

  public async query(file: Blob): Promise<string> {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file, file.name);

    const { data: filename } = await axios.post<FormData, {data: string}>(this.fileUploadEndpoint, bodyFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    const result = await this.serviceClient.query({
      file: filename,
      openai_key: this.openai_key
    });

    return result;
  }
}