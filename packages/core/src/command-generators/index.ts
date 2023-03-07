import { Command, _CommandRaw } from "../commands";
import { v4 } from "uuid";

/**
 * CommandGenerator is an abstract class that is used to generate commands from inputs.
 * 
 * @typeparam GeneratorInputType - The type of the input used to generate a command.
 */
export abstract class CommandGenerator<GeneratorInputType> {
  private subscriptions: Set<(command: Command) => any> = new Set();

  /**
   * Generate a command from an input.
   * 
   * @param input - The input to generate a command from.
   * @returns A promise that resolves with the generated command.
   */
  protected abstract generate(input: GeneratorInputType): Promise<_CommandRaw>;

  /** 
   * Subscribe to the command generator.
   * 
   * @param fn - The function to call when a command is generated.
   * @returns A function that unsubscribes the function from the command generator.
   */
  public subscribe(fn: (command: Command) => void): () => void {
    this.subscriptions.add(fn);
    return () => this.subscriptions.delete(fn);
  }

  /**
   * Emit a command from an input. This will call all subscribed functions.
   * 
   * @param input - The input to generate a command from.
   * @returns A promise that resolves when the command is emitted.
   */
  public emit(input: GeneratorInputType): {
    wait: Promise<void[]>,
    commandId: string,
  } {
    const commandId = v4();
    const wait = this.generate(input).then(command => {
      const pendings: Promise<any>[] = [];
      this.subscriptions.forEach(fn => pendings.push(fn({
        ...command,
        commandId
      })));
      return Promise.all(pendings);
    });

    return {
      wait,
      commandId,
    }
  }
}

/**
 * TextCommandGenerator generates commands from text
 */
export class TextCommandGenerator extends CommandGenerator<_CommandRaw> {
  public async generate(input: _CommandRaw): Promise<_CommandRaw> {
    return input;
  }
}

/**
 * APICommandGeneratorProps is the props for the APICommandGenerator.
 * 
 * @property apiEndpoint - The endpoint of the API.
 * @property apiKey - The API key.
 */
export interface APICommandGeneratorProps {
  apiEndpoint: string,
  apiKey: string,
}
/**
 * APICommandGenerator is an abstract class that is used to generate commands from inputs using an API.
 * 
 * @typeparam GeneratorInputType - The type of the input used to generate a command.
 * @property apiEndpoint - The endpoint of the API.
 * @property apiKey - The API key.
 */
export abstract class APICommandGenerator<T> extends CommandGenerator<T> {
  protected apiEndpoint: string;
  protected apiKey: string;

  constructor(props: APICommandGeneratorProps) {
    super();
    this.apiEndpoint = props.apiEndpoint;
    this.apiKey = props.apiKey;
  }
}
