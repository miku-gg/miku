import Queue from "queue";
import * as Commands from "../commands";
import { OutputEnvironment } from "../output-listeners";
import { ShortTermMemory } from "../memory";

export type Language = "en" | "es";

/**
 * ChatPromptCompleterParams is an interface for the parameters of a ChatPromptCompleter.
 *
 * @property {ShortTermMemory} memory - The short term memory of the chatbot.
 */
export interface ChatPromptCompleterConfig {
  memory: ShortTermMemory;
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
 * @method handleCompletionOutput - A function that handles the output of the prompt completion.
 *
 *
 * @property {string} settings - The short term memory of the chatbot.
 * @property {ShortTermMemory} memory - The short term memory of the chatbot.
 * @property {Queue} commandQueue - A queue that processes commands.
 *
 * @abstract
 * @class
 * @category Chat
 * @subcategory ChatPromptCompleter
 */
export abstract class ChatPromptCompleter {
  public memory: ShortTermMemory;
  private commandQueue: Queue;

  /**
   *
   * @param params - The parameters for the ChatPromptCompleter.
   */
  constructor(params: ChatPromptCompleterConfig) {
    this.memory = params.memory;
    this.commandQueue = Queue({ results: [], autostart: true });
  }

  /**
   *
   * @param prompt - The prompt to complete.
   * @returns A promise that resolves to the cost of the prompt completion.
   * @abstract
   */
  public async getCost(prompt: string): Promise<number> {
    return 0;
  }

  /**
   *
   * @param prompt - The prompt to complete.
   * @returns A promise that resolves to the prompt response.
   * @abstract
   */
  protected abstract completePrompt(
    memory: ShortTermMemory
  ): Promise<ChatPromptResponse>;

  /**
   *
   * @param output - The output of the prompt completion.
   * @returns A promise that resolves to the output environment.
   */
  protected abstract handleCompletionOutput(
    output: ChatPromptResponse,
    _command: Commands.Command
  ): Promise<OutputEnvironment>;

  /**
   * _processCommand is a private function that processes a command.
   *
   * @param command - The command to process.
   * @returns A promise that resolves to the prompt response.
   */
  private async _processCommand(
    command: Commands.Command
  ): Promise<OutputEnvironment> {
    this.memory.pushMemory(Commands.commandToMemoryLine(command));

    try {
      const promptResult = await this.completePrompt(
        this.memory
      );
      const output = await this.handleCompletionOutput(promptResult, command);
      this.memory.pushMemory({
        type: Commands.CommandType.DIALOG,
        text: output.text,
        subject: this.memory.getBotSubject(),
        id: command.commandId,
      });
      return output;
    } catch (error) {
      const memories = this.memory.getMemory();
      this.memory.clearMemories();
      memories.forEach((memory, index) => {
        if (index < memories.length - 1) {
          this.memory.pushMemory(memory);
        }
      });
      throw error;
    }
  }

  /**
   * processCommand is a function that processes a command using a queue.
   *
   * @param command - The command to process.
   * @returns A promise that resolves to the prompt responses.
   */
  public async processCommand(
    command: Commands.Command
  ): Promise<OutputEnvironment> {
    return new Promise((resolve, reject) => {
      this.commandQueue.push(async (cb) => {
        this._processCommand(command)
          .then((result) => {
            resolve({
              ...result,
              commandId: command.commandId,
            });
            cb && cb();
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  }
}
