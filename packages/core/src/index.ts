import * as ChatPromptCompleters from './chat-prompt-completers';
import * as CommandGenerators from './command-generators';
import * as Commands from './commands';
import * as OutputListeners from './output-listeners';
import * as Memory from './memory';

export * as ChatPromptCompleters from './chat-prompt-completers';
export * as APIs from './apis';
export * as CommandGenerators from './command-generators';
export * as Commands from './commands';
export * as OutputListeners from './output-listeners';
export * as Memory from './memory';
export * as Services from './services';

/**
 * ChatBotParams type
 * 
 * @property {ChatPromptCompleter} promptCompleter - The prompt completer to use.
 * @property {CommandGenerator<any>[]} commandGenerators - An array of command generators.
 * @property {OutputListener<DialogOutputEnvironment>[]} outputListeners.dialogOutputListeners - An array of dialog output listeners.
 * @property {OutputListener<ActionOutputEnvironment>[]} outputListeners.actionOutputListeners - An array of action output listeners.
 * @property {OutputListener<ContextOutputEnvironment>[]} outputListeners.contextOutputListeners - An array of context output listeners.
 * @property {OutputListener<OptionsOutputEnvironment>[]} outputListeners.optionsOutputListeners - An array of options output listeners.
 */
export interface ChatBotParams {
  promptCompleter: ChatPromptCompleters.ChatPromptCompleter;
  commandGenerators: CommandGenerators.CommandGenerator<any>[];
  outputListeners: {
    dialogOutputListeners?: OutputListeners.OutputListener<OutputListeners.DialogOutputEnvironment, any>[];
    actionOutputListeners?: OutputListeners.OutputListener<OutputListeners.ActionOutputEnvironment, any>[];
    contextOutputListeners?: OutputListeners.OutputListener<OutputListeners.ContextOutputEnvironment, any>[];
    optionsOutputListeners?: OutputListeners.OutputListener<OutputListeners.OptionsOutputEnvironment, any>[];
  };
}

/**
 * ChatBot class
 * This class is the main class of the library of the chatbot.
 * 
 * @property {ChatPromptCompleter} promptCompleter - The prompt completer to use.
 * @property {CommandGenerator<any>[]} commandGenerators - An array of command generators.
 * @property {OutputListener<DialogOutputEnvironment>[]} outputListeners.dialogOutputListeners - An array of dialog output listeners.
 * @property {OutputListener<ActionOutputEnvironment>[]} outputListeners.actionOutputListeners - An array of action output listeners.
 * @property {OutputListener<ContextOutputEnvironment>[]} outputListeners.contextOutputListeners - An array of context output listeners.
 * @property {OutputListener<OptionsOutputEnvironment>[]} outputListeners.optionsOutputListeners - An array of options output listeners.
 */
export class ChatBot {
  private promptCompleter: ChatPromptCompleters.ChatPromptCompleter;
  private commandGenerators: CommandGenerators.CommandGenerator<unknown>[];
  private outputListeners: {
    dialogOutputListeners?: OutputListeners.OutputListener<OutputListeners.DialogOutputEnvironment, any>[];
    actionOutputListeners?: OutputListeners.OutputListener<OutputListeners.ActionOutputEnvironment, any>[];
    contextOutputListeners?: OutputListeners.OutputListener<OutputListeners.ContextOutputEnvironment, any>[];
    optionsOutputListeners?: OutputListeners.OutputListener<OutputListeners.OptionsOutputEnvironment, any>[];
  };

  constructor(params: ChatBotParams) {
    this.promptCompleter = params.promptCompleter;
    this.commandGenerators = params.commandGenerators;
    this.outputListeners = params.outputListeners;

    this.commandGenerators.forEach(
      (commandGenerator) => commandGenerator.subscribe(
        async (command) => {
          const output = await this.promptCompleter.processCommand(command);

          switch (command.type) {
            case Commands.CommandType.DIALOG:
              this.outputListeners.dialogOutputListeners?.map((e) => {
                e.sendOutput(output as OutputListeners.DialogOutputEnvironment, this.promptCompleter.memory)
              });
            case Commands.CommandType.CONTEXT:
              this.outputListeners.contextOutputListeners?.map((e) => {
                e.sendOutput(output as OutputListeners.ContextOutputEnvironment, this.promptCompleter.memory)
              });
            case Commands.CommandType.ACTION:
              this.outputListeners.actionOutputListeners?.map((e) => {
                e.sendOutput(output as OutputListeners.ActionOutputEnvironment, this.promptCompleter.memory)
              });
            case Commands.CommandType.OPTIONS:
              this.outputListeners.optionsOutputListeners?.map((e) => {
                e.sendOutput(output as OutputListeners.OptionsOutputEnvironment, this.promptCompleter.memory)
              });
          }
        }
      )
    )
  }
}