import { Configuration, OpenAIApi } from "openai";
import * as Core from '@mikugg/core';

interface OpenAIManagerConfig {

  /**
   * The API key for the OpenAI API.
   */
  apiKey: string;

  /**
   * The stop words for the OpenAI API.
   */
  stop: string[]
}

/**
 * OpenAIManager is a class that interacts with the OpenAI API.
 * 
 * @method createCompletion - A function that creates a completion.
 * 
 * @property {OpenAIManagerConfig} config - The configuration for the OpenAIManager.
 * @property {OpenAIApi} openai - The OpenAI API.
 * 
 * @see https://beta.openai.com/docs/api-reference/completions/create
 */
class OpenAIManager {
  private config: OpenAIManagerConfig;
  private openai: OpenAIApi;

  /**
   * 
   * @param config - The configuration for the OpenAIManager.
   */
  constructor(config: OpenAIManagerConfig) {
    this.config = config;
    const configuration = new Configuration({
      apiKey: this.config.apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  /**
   * 
   * @param prompt - The prompt for the completion.
   * 
   * @returns The completion.
   */
  async createCompletion(prompt: string, useStop = true): Promise<string> {
    const completion = await this.openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: useStop ? this.config.stop : [],
      
    });
    const choices = completion?.data?.choices || [];

    return choices.length ? (choices[0].text || '') : '';
  }
}

export interface ChatGPTParams extends Core.ChatPromptCompleters.ChatPromptCompleterParams {
  /**
   * The OpenAI API key.
   */
  openAIKey: string
}

/**
 * ChatGPTPromptCompleter is a class that receives commands and completes prompts it using ChatGPT.
 * 
 * @method completePrompt - A function that completes a prompt using ChatGPT API.
 * 
 * @property {OpenAIManager} openaiManger - The OpenAIManager.
 */
export class ChatGPTPromptCompleter extends Core.ChatPromptCompleters.ChatPromptCompleter {
  private openaiManger: OpenAIManager;

  constructor(params: ChatGPTParams) {
    super(params);
    this.openaiManger = new OpenAIManager({
      apiKey: params.openAIKey,
      stop: [
        `${params.botSubject}: `,
        ...params.subjects.map(subject => `${subject}: `),
      ]
    })
  }

  /**
   * 
   * @param prompt - The prompt to complete.
   * 
   * @returns The completed prompt.
   */
  protected async completePrompt(prompt: Core.ChatPromptCompleters.ChatPrompt): Promise<Core.ChatPromptCompleters.ChatPromptResponse> {
    const result = await this.openaiManger.createCompletion(prompt.text);
    return {text: result};
  }

  /**
   * 
   * @returns The prompt templates.
   */
  getPromptTemplates(): Core.ChatPromptCompleters.PromptTemplates {
    return {
      describeContext: () => 'Please describe the current place and scene, using keywords sepparated by commas:',
      options: {
        context: () => 'List of possible events after this conversation:',
        action: (subject: string) => `List of possible actions for ${subject} to do:`,
        dialog: (subject: string) => `List of possible responses for ${subject} to say:`,
      },
      describeMoods: (botSubject: string) => `Sentences from ${botSubject} contain the mood at the end.\n
      The possible moods are: ${Core.OutputListeners.moods.join(', ')}.\n
      Examples:\n
      ${botSubject}: Hello! Nice to see you! *happy*\n
      ${botSubject}: Oh, I'm so sorry.*sad*\n`,
    }
  }
}