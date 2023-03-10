import * as Core from '@mikugg/core';
import { Services } from '..';
import axios from 'axios';

interface SpeechToTextInput {
  file: string;  
}

export class WhisperServiceClient {
  private serviceClient: Core.Services.ServiceClient<SpeechToTextInput, string>;
  private fileUploadEndpoint: string;

  constructor(fileUploadEndpoint: string, whisperServiceEndpoint: string, signer: Core.Services.ServiceQuerySigner) {
    this.fileUploadEndpoint = fileUploadEndpoint;
    this.serviceClient = new Core.Services.ServiceClient<SpeechToTextInput, string>(
      whisperServiceEndpoint,
      signer,
      Services.ServicesNames.WhisperSTT,
    );
  }

  public async query(file: Blob): Promise<string> {
    let bodyFormData = new FormData();
    bodyFormData.append('file', file, file.name);

    const { data: filename } = await axios.post<FormData, {data: string}>(this.fileUploadEndpoint, bodyFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    const tokenLimit = await this.serviceClient.getQueryCost({
      file: filename,
    })

    const result = await this.serviceClient.query({
      file: filename,
    }, tokenLimit);

    return result;
  }
}