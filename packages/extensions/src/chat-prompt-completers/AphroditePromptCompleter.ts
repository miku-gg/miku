import * as Core from "@mikugg/core";
import { InferProps } from "prop-types";
import { AphroditePromptCompleterServicePropTypes, ServicesNames, AphroditeMessage } from "../services";
import {
  hasTextStop,
  parsePygmalionResponse,
} from "./PygmalionPromptCompleter";
type AphroditePropTypes = InferProps<typeof AphroditePromptCompleterServicePropTypes>;

export interface AphroditeParams
  extends Core.ChatPromptCompleters.ChatPromptCompleterConfig {
  serviceEndpoint: string;
  props: AphroditePropTypes;
  signer: Core.Services.ServiceQuerySigner;
}

export class AphroditePromptCompleter extends Core.ChatPromptCompleters
  .ChatPromptCompleter {
  private props: AphroditePropTypes;
  private service: Core.Services.ServiceClient<AphroditePropTypes, string>;

  constructor(params: AphroditeParams) {
    super(params);
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<AphroditePropTypes, string>(
      params.serviceEndpoint,
      params.signer,
      ServicesNames.Aphrodite
    );
  }

  public override async getCost(
    prompt: string,
  ): Promise<number> {
    return this.service.getQueryCost({
      ...this.getProps(),
    });
  }

  /**
   *
   * @param prompt - The prompt to complete.
   *
   * @returns The completed prompt.
   */
  protected async completePrompt(
    memory: Core.Memory.ShortTermMemory
  ): Promise<Core.ChatPromptCompleters.ChatPromptResponse> {
    let result = "";
    let isParsedResultSmall = false;
    let tries = 0;

    while (
      (isParsedResultSmall || !hasTextStop(result, memory.getSubjects())) &&
      tries++ < 2
    ) {
      if (isParsedResultSmall) result = "";
      result += await this.service.query(
        {
          ...this.getProps(),
          userName: 'Anon',
          messages: this.getChatMessages(memory)
        },
        await this.getCost('')
      );

      const resultParsed = parsePygmalionResponse(
        result,
        memory.getBotSubject(),
        memory.getSubjects()
      );
      isParsedResultSmall = resultParsed.length < 4;
      if (hasTextStop(result, memory.getSubjects()) && !isParsedResultSmall) {
        result = resultParsed;
        break;
      }
      result = resultParsed;
    }

    return { text: result };
  }


  protected getChatMessages(memory: Core.Memory.ShortTermMemory): AphroditeMessage[] {
    const memoryLines = [
      ...memory.getMemory(),
    ];
    const memorySize = this.memory.memorySize;
    return [
      // { role: "system", content: basePrompt },
      ...memoryLines
        .filter((_, index) => memoryLines.length - memorySize < index)
        .map((message) => ({
          role:
            message.subject == memory.getBotSubject() || !message.subject
              ? "assistant"
              : "user",
          content: message.subject
            ? message.text
            : message.text,
        })),
    ];
  }

  protected async handleCompletionOutput(
    output: Core.ChatPromptCompleters.ChatPromptResponse,
    _command: Core.Commands.Command
  ): Promise<Core.OutputListeners.DialogOutputEnvironment> {
    return {
      commandId: _command.commandId,
      text: output.text,
    };
  }

  private getProps(): AphroditePropTypes {
    return this.props;
  }
}
