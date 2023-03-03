import * as Core from '@mikugg/core';
import { InferProps } from "prop-types";
import { OpenAIChatModels, OpenAIMessage, OpenAIPromptCompleterServicePropTypes } from '../services/openai/OpenAIPromptCompleterService';
import { ShortTermMemory } from '@mikugg/core/dist/memory';

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
    const props = this.getProps();
    const stop = OpenAIChatModels.includes(props.model || '') ?
      props.stop?.filter((_stop: string) => _stop != `${this.memory.getBotSubject()}: `) :
      props.stop;
    const result = await this.service.query({
      ...this.getProps(),
      stop,
      messages: this.getChatMessages(memory),
      prompt
    }, await this.getCost(prompt));
    return {text: result.replace(`${this.memory.getBotSubject()}: `, ``)};
  }

  protected getChatMessages(memory: ShortTermMemory): OpenAIMessage[] {
    const basePrompt = memory.getContextPrompt() + memory.getInitiatorPrompt();
    const memoryLines = memory.getMemory();
    const memorySize = this.memory.memorySize;
    return [
      { role: 'system', content: basePrompt },
      ...memoryLines.filter((_, index) => memoryLines.length - memorySize < index  ).map(message => ({
        role: (message.subject == memory.getBotSubject()) ? 'assistant' : 'user',
        content: `${message.subject}: ${message.text}`
      }))
    ];
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