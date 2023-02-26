import * as Core from '@mikugg/core';
import { InferProps } from "prop-types";
import trim from 'lodash.trim';
import { PygmalionServicePropTypes } from '../services';

type PygmalionPropTypes = InferProps<typeof PygmalionServicePropTypes>;

export interface PygmalionParams extends Core.ChatPromptCompleters.ChatPromptCompleterConfig {
  serviceEndpoint: string;
  props: PygmalionPropTypes;
  signer: Core.Services.ServiceQuerySigner
}

export class PygmalionPromptCompleter extends Core.ChatPromptCompleters.ChatPromptCompleter {
  private props: PygmalionPropTypes;
  private service: Core.Services.ServiceClient<PygmalionPropTypes, string>;

  constructor(params: PygmalionParams) {
    super(params);
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<PygmalionPropTypes, string>(params.serviceEndpoint, params.signer);
  }
  
  public override async getCost(prompt: string): Promise<number> {
    return this.service.getQueryCost({
      ...this.getProps(),
      prompt
    });
  }

  /**
   * 
   * @param prompt - The prompt to complete.
   * 
   * @returns The completed prompt.
   */
  protected async completePrompt(prompt: string): Promise<Core.ChatPromptCompleters.ChatPromptResponse> {
    const result = await this.service.query({
      ...this.getProps(),
      prompt
    }, await this.getCost(prompt));
    return {text: result};
  }

  protected async handleCompletionOutput(output: Core.ChatPromptCompleters.ChatPromptResponse): Promise<Core.OutputListeners.DialogOutputEnvironment> {
    let text: string = trim(output.text);
    const botSubject: string = this.memory.getBotSubject();
    const subjects: string[] = this.memory.getSubjects();
    const stops = ['<|endoftext|>', ...subjects];
   
    const isCleanResponse = stops.reduce((prev, cur) => {
      return prev && !text.includes(cur);
    }, true);
    
    if (!isCleanResponse) {
      text = text.substring(
        0,
        stops.reduce((prev, cur) => {
          let subjectTextIndex = text.indexOf(`${cur}:`);
          return (subjectTextIndex === -1) ? prev : Math.min(prev, subjectTextIndex);
        }, text.length)
      );
    }
    text = text.replace(`${botSubject}:`, '');
    return {
      text
    };
  }

  private getProps(): PygmalionPropTypes {
    return this.props;
  }
}