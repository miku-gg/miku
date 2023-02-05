import { ChatConfig, ChatPrompt, ChatPromptResponse, PromptTemplates } from "../chat-prompt-completers";
import { singleton } from '@keenondrums/singleton'
import { ContextOutputEnvironment, DialogOutputEnvironment, OptionsOutputEnvironment, ActionOutputEnvironment, OutputEnvironment, moods, Mood } from "../output-listeners";

/**
 * CommandType is an enum that indicates the type of command.
 * 
 * @property {number} CONTEXT - Indicates a context change to the ai character.
 * @property {number} DIALOG - Indicates a text reponse to the ai character.
 * @property {number} ACTION - Indicates an action to be performed by the subject.
 * @property {number} OPTIONS - Ask for a list of options to choose from.
 */
export enum CommandType {
  CONTEXT,
  DIALOG,
  ACTION,
  OPTIONS,
}

/**
 * CommandHandlerInput type
 * 
 * @property {string} text - The text of the prompt.
 * @property {string} subject - The subject whose the prompt is related to.
 */
export interface CommandHandlerInput {
  text: string;
  subject: string;
}

/**
 * Command type
 * 
 * @property {CommandType} type - The type of the command.
 * @property {CommandHandlerInput} input - The input of the command.
 */
export interface Command {
  type: CommandType;
  input: CommandHandlerInput;
}

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' |  'unshift'
export type FixedLengthArray<T, L extends number, TObj = [T, ...Array<T>]> =
  Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>>
  & {
    readonly length: L 
    [ I : number ] : T
    [Symbol.iterator]: () => IterableIterator<T>   
  }
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>
type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

/**
 * CommandHandlerOutput type
 * 
 * @template T - number of prompts
 * 
 * @property {FixedLengthArray<{prompt: ChatPrompt; outputHandler?: (promptResponse: ChatPromptResponse) => void}, T>} prompts - An array of prompts and output handlers.
 * @property {IntRange<0, T>} newPromptIndex - The index of the prompt that replace the current prompt.
 * */
export interface CommandHandlerOutput<T extends number> {
  prompts: FixedLengthArray<ChatPrompt, T>,
  newPromptIndex: IntRange<0, T>;
  outputProcessor: (promptResponse: FixedLengthArray<ChatPromptResponse, T>) => OutputEnvironment
}

/**
 * CommandHandler is an abstract class that is used to create prompts for commands.
 * 
 * @template T - number of prompts
 * 
 * @property {CommandType} type - The type of command that the builder is used for.
 * 
 * @method getPrompts - A function that returns prompts a ChatPromptCompleter.
 */
export abstract class CommandHandler<T extends number> {
  public static type: CommandType;

  //@ts-ignore
  public responseType: FixedLengthArray<ChatPromptResponse, T>;

  public abstract getPrompts(promptInput: CommandHandlerInput, chatConfig: Readonly<ChatConfig>, getPromptTemplates?: () => PromptTemplates): Promise<CommandHandlerOutput<T>>;
}

/**
 * DialogCommandHandler is used to create prompts for commands of type CommandType.DIALOG
 */
@singleton
export class DialogCommandHandler extends CommandHandler<1> {
  public static type = CommandType.DIALOG;

  protected parseDialogResult(dialogResult: string, botSubject: string): DialogOutputEnvironment {
    let promptResponse = dialogResult.replace(`\n${botSubject}: `, '')
    const mood: Mood = moods.find((mood) => promptResponse.includes(`*${mood}*`)) || 'neutral';
    promptResponse = promptResponse.replace(` *${mood}*`, '');
    return {
      text: promptResponse,
      mood
    };
  }

  /**
   * getPrompts is a function that returns prompts a ChatPromptCompleter.
   * It is used to create prompts for commands of type CommandType.DIALOG.
   * 
   * @param {CommandHandlerInput} input - Input data used to generate prompts.
   * @param {ChatConfig} chatConfig - Configuration for the chatbot.
   * 
   * @returns {Promise<CommandHandlerOutput<1>>} A promise that resolves with the generated prompts.
   */
  public async getPrompts(
    input: CommandHandlerInput,
    chatConfig: Readonly<ChatConfig>,
  ): Promise<CommandHandlerOutput<1>> {
    const newline = `\n${input.subject}: ${input.text}\n${chatConfig.botSubject}:`;
    const prompt = chatConfig.currentPrompt + newline;
    return {
      prompts: [
        {
          text: prompt,
          expectsDialogBack: true,
        }
      ],
      newPromptIndex: 0,
      outputProcessor: (_promptResponse: FixedLengthArray<ChatPromptResponse, 1>): DialogOutputEnvironment => {
        return this.parseDialogResult(_promptResponse[0].text, chatConfig.botSubject);
      }
    };
  }
}
/**
 * ContextCommandHandler is used to create prompts for commands of type CommandType.CONTEXT.
 */
@singleton
export class ContextCommandHandler extends CommandHandler<2> {
  public static type = CommandType.CONTEXT;
  /**
   * getPrompts is a function that returns prompts a ChatPromptCompleter.
   * It is used to create prompts for commands of type CommandType.CONTEXT.
   * 
   * @param {CommandHandlerInput} input - Input data used to generate prompts.
   * @param {ChatConfig} chatConfig - Configuration for the chatbot.
   * 
   * @returns {Promise<CommandHandlerOutput<2>>} A promise that resolves with the generated prompts.
   */
  public async getPrompts(
    input: CommandHandlerInput,
    chatConfig: Readonly<ChatConfig>,
    getPromptTemplates: () => PromptTemplates
  ): Promise<CommandHandlerOutput<2>> {
    return {
      prompts: [
        {
          text: chatConfig.currentPrompt +`\n\n$${input.text}\n\n${input.subject}:`,
          expectsDialogBack: false,
          ignoreCompletion: true,
        },
        {
          text: chatConfig.currentPrompt +`\n\n${input.text}\n\n${getPromptTemplates().describeContext()}`,
          expectsDialogBack: false,
        },
      ],
      newPromptIndex: 0,
      outputProcessor: (_promptResponse: FixedLengthArray<ChatPromptResponse, 2>): ContextOutputEnvironment => {
        const promptResponse = _promptResponse[0].text.replace(`\n${chatConfig.botSubject}: `, '')
        const promptSceneDescription = _promptResponse[1].text
        return {
          text: promptResponse,
          description: input.text,
          keywords: promptSceneDescription,
        };
      }
    };
  }
}

/**
 * ActionCommandHandler is used to create prompts for commands of type CommandType.ACTION.
 */
@singleton
export class ActionCommandHandler extends DialogCommandHandler {
  public static type = CommandType.ACTION;

  /**
   * getPrompts is a function that returns prompts a ChatPromptCompleter.
   * It is used to create prompts for commands of type CommandType.ACTION.
   * 
   * @param {CommandHandlerInput} input - Input data used to generate prompts.
   * @param {ChatConfig} chatConfig - Configuration for the chatbot.
   * 
   * @returns {Promise<CommandHandlerOutput<1>>} A promise that resolves with the generated prompts.
   */
  public async getPrompts(
    input: CommandHandlerInput,
    chatConfig: Readonly<ChatConfig>,
  ): Promise<CommandHandlerOutput<1>> {
    const newline = `\n${input.subject}: ${input.text}\n${chatConfig.botSubject}:`;
    const prompt = chatConfig.currentPrompt + newline;
    return {
      prompts: [
        {
          text: prompt,
          expectsDialogBack: true,
        }
      ],
      newPromptIndex: 0,
      outputProcessor: (_promptResponse: FixedLengthArray<ChatPromptResponse, 1>): ActionOutputEnvironment => {
        return this.parseDialogResult(_promptResponse[0].text, chatConfig.botSubject);
      }
    };
  }
}

/**
 * OptionsCommandHandlerInput type
 * 
 * @property {'context' | 'action' | 'dialog'} text - The text to be displayed in the prompt.
 */
export interface OptionsCommandHandlerInput extends CommandHandlerInput {
  text: 'context' | 'action' | 'dialog';
}
/**
 * OptionsCommandHandler is used to create prompts for commands of type CommandType.OPTIONS.
 */
@singleton
export class OptionsCommandHandler extends CommandHandler<2> {
  public static type = CommandType.OPTIONS;

  /**
   * getPrompts is a function that returns prompts a ChatPromptCompleter.
   * It is used to create prompts for commands of type CommandType.OPTIONS.
   * 
   * @param {OptionsCommandHandlerInput} input - Input data used to generate prompts.
   * @param {ChatConfig} chatConfig - Configuration for the chatbot.
   * 
   * @returns {Promise<CommandHandlerOutput<2>>} A promise that resolves with the generated prompts.
   */
  public async getPrompts(
    input: OptionsCommandHandlerInput,
    chatConfig: Readonly<ChatConfig>,
    getPromptTemplates: () => PromptTemplates
  ): Promise<CommandHandlerOutput<2>> {
    const promptTemplates = getPromptTemplates();
    let newline = '';
    switch(input.text) {
      case 'context':
        newline = `\n\n${promptTemplates.options.context()}\n`;
        break;
      case 'action':
        newline = `\n\n${promptTemplates.options.action(input.subject)}\n`;
        break;
      case 'dialog':
        newline = `\n\n${promptTemplates.options.dialog(input.subject)}\n`;
        break;
    }
    const prompt = chatConfig.currentPrompt + newline;
    return {
      prompts: [
        {
          text: prompt,
          expectsDialogBack: false,
        },
        {
          text: chatConfig.currentPrompt,
          expectsDialogBack: false,
        }
      ],
      newPromptIndex: 1,
      outputProcessor: (_promptResponse: FixedLengthArray<ChatPromptResponse, 2>): OptionsOutputEnvironment => {
        const promptResponse = _promptResponse[0].text;
        return {
          options: promptResponse.split('\n'),
          text: input.text,
        };
      }
    };
  }
}