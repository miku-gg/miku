import * as Core from '@mikugg/core';
import { TTSServicePropTypes } from '../services/tts/TTSService';
import { InferProps } from 'prop-types';

type TTSServiceProps = InferProps<typeof TTSServicePropTypes>

export interface TTSOutputListenerParams {
  serviceEndpoint: string;
  props: TTSServiceProps;
  signer: Core.Services.ServiceQuerySigner;
}

export class TTSOutputListener extends Core.OutputListeners.OutputListener<Core.OutputListeners.DialogOutputEnvironment, string> {
  protected service: Core.Services.ServiceClient<TTSServiceProps, string>;
  protected props: TTSServiceProps;

  constructor(params: TTSOutputListenerParams) {
    super();
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<TTSServiceProps, string>(params.serviceEndpoint, params.signer);
  }

  protected override async handleOutput(output: Core.OutputListeners.DialogOutputEnvironment): Promise<string> {
    return this.service.query({
      ...this.props,
      prompt: this.cleanText(output.text)
    }, await this.service.getQueryCost(this.props));
  }

  public override async getCost(): Promise<number> {
    return this.service.getQueryCost(this.props);
  }

  private cleanText(text: string) {
    let cleanText = "";
    let lastOpen: undefined | string = undefined;
    for (let x = 0; x < text.length; x++)
    {
        const ch = text.charAt(x);

        if (lastOpen == '(' && ch == ')') {lastOpen = undefined; continue;}
        if (lastOpen == '[' && ch == ']') {lastOpen = undefined; continue;}
        if (lastOpen == '-' && ch == '-') {lastOpen = undefined; continue;}
        if (lastOpen == '*' && ch == '*') {lastOpen = undefined; continue;}

        if (ch == '(' || ch == '[' || ch == '-' || ch == "*") {
          lastOpen = ch;
          continue;
        }

        if (!lastOpen) {
          cleanText += ch;
        }

        
    }
    cleanText.replace(/ *\([^)]*\) */g, "");

    return cleanText;
  }
}