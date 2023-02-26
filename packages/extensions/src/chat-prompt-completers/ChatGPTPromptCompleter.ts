import * as Core from '@mikugg/core';
import { InferProps } from "prop-types";
import { ChatGPTServicePropTypes } from '../services/openai/ChatGPTService';

type ChatGPTPropTypes = InferProps<typeof ChatGPTServicePropTypes>;

export interface ChatGPTParams extends Core.ChatPromptCompleters.ChatPromptCompleterConfig {
  serviceEndpoint: string;
  props: ChatGPTPropTypes;
  signer: Core.Services.ServiceQuerySigner
}

/**
 * ChatGPTPromptCompleter is a class that receives commands and completes prompts it using ChatGPT.
 * 
 * @method completePrompt - A function that completes a prompt using ChatGPT API.
 * 
 * @property {OpenAIManager} openaiManger - The OpenAIManager.
 */
export class ChatGPTPromptCompleter extends Core.ChatPromptCompleters.ChatPromptCompleter {
  private props: ChatGPTPropTypes;
  private service: Core.Services.ServiceClient<ChatGPTPropTypes, string>;

  constructor(params: ChatGPTParams) {
    super(params);
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<ChatGPTPropTypes, string>(params.serviceEndpoint, params.signer);
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
    let promptResponse = output.text.replace(`\n${this.memory.getBotSubject()}: `, '')
    return {
      text: promptResponse
    };
  }

  private getProps(): ChatGPTPropTypes {
    return {
      ...this.props,
      stop: [
        `${this.memory.getBotSubject()}: `,
        ...this.memory.getSubjects().map(subject => `${subject}: `),
      ]
    };
  }
}