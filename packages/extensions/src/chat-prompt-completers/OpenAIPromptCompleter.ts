import * as Core from '@mikugg/core';
import { InferProps } from "prop-types";
import { OpenAIPromptCompleterServicePropTypes } from '../services/openai/OpenAIPromptCompleterService';

type OpenAIPropTypes = InferProps<typeof OpenAIPromptCompleterServicePropTypes>;

export interface OpenAIParams extends Core.ChatPromptCompleters.ChatPromptCompleterConfig {
  serviceEndpoint: string;
  props: OpenAIPropTypes;
  signer: Core.Services.ServiceQuerySigner
}

/**
 * OpenAIPromptCompleter is a class that receives commands and completes prompts it using OpenAI.
 * 
 * @method completePrompt - A function that completes a prompt using OpenAI API.
 * 
 * @property {OpenAIManager} openaiManger - The OpenAIManager.
 */
export class OpenAIPromptCompleter extends Core.ChatPromptCompleters.ChatPromptCompleter {
  private props: OpenAIPropTypes;
  private service: Core.Services.ServiceClient<OpenAIPropTypes, string>;

  constructor(params: OpenAIParams) {
    super(params);
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<OpenAIPropTypes, string>(params.serviceEndpoint, params.signer);
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
  protected async completePrompt(memory: Core.Memory.ShortTermMemory): Promise<Core.ChatPromptCompleters.ChatPromptResponse> {
    const prompt = memory.buildMemoryPrompt();
    const result = await this.service.query({
      ...this.getProps(),
      prompt
    }, await this.getCost(prompt));
    return {text: result};
  }


  protected async handleCompletionOutput(output: Core.ChatPromptCompleters.ChatPromptResponse): Promise<Core.OutputListeners.DialogOutputEnvironment> {
    let promptResponse = output.text.replace(`\n${this.memory.getBotSubject()}: `, '')
    return {
      text: promptResponse
    };
  }

  private getProps(): OpenAIPropTypes {
    return {
      ...this.props,
      stop: [
        `${this.memory.getBotSubject()}: `,
        ...this.memory.getSubjects().map(subject => `${subject}: `),
      ]
    };
  }
}