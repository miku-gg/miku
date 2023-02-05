import Queue from 'better-queue';
import * as Commands from '../commands'; 
import { OutputEnvironment } from '../output-listeners';

export type Language = 'en' | 'es';

export interface PromptTemplates {
  describeContext: () => string
  options: {
    context: () => string
    action: (subject: string) => string
    dialog: (subject: string) => string
  }
  describeMoods: (botSubject: string) => string;
}

/**
 * ChatPromptCompleterParams is an interface for the parameters of a ChatPromptCompleter.
 * 
 * @property {string} basePrompt - The base prompt for the chatbot.
 * @property {Language} language - The language of the prompt.
 * @property {string[]} subjects - The names of the subjects that interact with the chatbot.
 * @property {string} botSubject - The name of the chatbot.
 */
export interface ChatPromptCompleterParams {
  basePrompt: string;
  language: Language;
  subjects: string[];
  botSubject: string;
}

/**
 * ChatConfig is an interface for the configuration of a ChatPromptCompleter.
 * 
 * @property {string} currentPrompt - The current prompt for the chatbot.
 * @property {string} localHistory - The local history of the chatbot.
 * @property {string} basePrompt - The base prompt for the chatbot.
 * @property {Language} language - The language of the prompt.
 * @property {string[]} subjects - The names of the subjects that interact with the chatbot.
 * @property {string} botSubject - The name of the chatbot.
 */
export interface ChatConfig extends ChatPromptCompleterParams {
  currentPrompt: string;
  localHistory: string;
}

/**
 * ChatPrompt is an interface for a prompt.
 * 
 * @property {string} text - The text of the prompt.
 */
export interface ChatPrompt {
  text: string;
  expectsDialogBack: boolean
  ignoreCompletion?: boolean
}

/**
 * ChatPromptResponse is an interface for a prompt response.
 * 
 * @property {string} text - The text of the prompt response.
 */
export interface ChatPromptResponse {
  text: string;
}

/**
 * ChatPromptCompleter is an abstract class interface for prompts completers.
 * It receives commands and returns prompts.
 * 
 * @method completePrompt - A function that completes a prompt.
 * @method getCommandHandler - A function that returns a CommandHandler for a given command type.
 * @method processCommand - A function that processes a command.
 * 
 * @property {ChatConfig} chatConfig - The configuration for the chatbot.
 * @property {Queue} commandQueue - A queue that processes commands.
 * 
 * @abstract
 * @class
 * @category Chat
 * @subcategory ChatPromptCompleter
 */
export abstract class ChatPromptCompleter {
  protected chatConfig: ChatConfig;
  private commandQueue: Queue<Commands.Command>;

  /**
   * 
   * @param params - The parameters for the ChatPromptCompleter.
   */
  constructor(params: ChatPromptCompleterParams) {
    this.chatConfig = {
      ...params,
      currentPrompt: params.basePrompt + this.getPromptTemplates().describeMoods(params.botSubject),
      localHistory: '',
    };

    this.commandQueue = new Queue<Commands.Command>(async (input: Commands.Command, cb) => {
      const result = await this._processCommand(input)
      cb(null, result);
    });
  }

  /**
   * 
   * @param prompt - The prompt to complete.
   * @returns A promise that resolves to the prompt response.
   * @abstract
   */
  protected abstract completePrompt(prompt: ChatPrompt): Promise<ChatPromptResponse>;

  protected abstract getPromptTemplates(): PromptTemplates;

  /**
   * 
   * @param commandType - The type of the command.
   * @returns A CommandHandler for the given command type.
   */
  protected getCommandHandler(commandType: Commands.CommandType): Commands.CommandHandler<any> {
    switch (commandType) {
      case Commands.CommandType.DIALOG:
        return new Commands.DialogCommandHandler();
      case Commands.CommandType.CONTEXT:
        return new Commands.ContextCommandHandler();
      case Commands.CommandType.ACTION:
        return new Commands.ActionCommandHandler();
      case Commands.CommandType.OPTIONS:
        return new Commands.OptionsCommandHandler();
      default:
        throw new Error(`Command type ${commandType} not supported`);
    }
  }

  /**
   * _processCommand is a private function that processes a command.
   * 
   * @param command - The command to process.
   * @param commandType - The type of the command.
   * @returns A promise that resolves to the prompt responses.
   */
  private async _processCommand(
    command: Commands.Command
  ): Promise<OutputEnvironment> {
    const commandHandler = this.getCommandHandler(command.type);
    
    const { prompts, newPromptIndex, outputProcessor } = await commandHandler.getPrompts(command.input, this.chatConfig, this.getPromptTemplates.bind(this));

    const promptsResults = prompts.map((prompt: ChatPrompt): Promise<ChatPromptResponse> => {
      if (prompt.ignoreCompletion) return new Promise((resolve) => resolve({ text: prompt.text }));
      else return this.completePrompt(prompt);
    });

    promptsResults[newPromptIndex as number].then(
      (promptResponse: ChatPromptResponse) => {
        this.chatConfig.currentPrompt += promptResponse.text;
        this.chatConfig.localHistory += promptResponse.text;
      }
    );
    const promptsCompletionResults = await Promise.all(promptsResults);

    return outputProcessor(promptsCompletionResults as unknown as typeof commandHandler.responseType);
  }


  /**
   * processCommand is a function that processes a command using a queue.
   * 
   * @param command - The command to process.
   * @param commandType - The type of the command.
   * @returns A promise that resolves to the prompt responses.
   */
  public async processCommand(
    command: Commands.Command,
  ): Promise<OutputEnvironment> {
    return new Promise((resolve, reject) => {
      this.commandQueue
        .push(command)
        .on('finish', (result: Promise<OutputEnvironment>) => {
          resolve(result);
        })
        .on('failed', (err: Error) => {
          reject(err);
        })
    });
  }

  /**
   * 
   * @param newPrompt - The new current prompt.
   * @returns void
   * @description Sets the current prompt.
   */
  public setCurrentPrompt(newPrompt: string): void {
    this.chatConfig.currentPrompt = newPrompt;
  }

  /**
   * 
   * @returns The current prompt.
   */
  public getCurrentPrompt(): string {
    return this.chatConfig.currentPrompt;
  }

  /**
   * 
   * @returns The local history.
   */
  public getLocalHistory(): string {
    return this.chatConfig.localHistory;
  }
}