import { MemoryLine } from "../memory";

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
  settings: string;
  subject: string;
}

/**
 * _CommandRaw type
 *
 * @property {CommandType} type - The type of the command.
 * @property {CommandHandlerInput} input - The input of the command.
 */
export interface _CommandRaw {
  type: CommandType;
  input: CommandHandlerInput;
}

/**
 * Command type
 *
 * @property {string} commandId - The id of the command.
 */
export interface Command extends _CommandRaw {
  commandId: string;
}

export const commandToMemoryLine = (command: Command): MemoryLine => {
  return {
    subject: command.input.subject,
    text: command.input.text,
    settings: command.input.settings,
    type: command.type,
  };
};
