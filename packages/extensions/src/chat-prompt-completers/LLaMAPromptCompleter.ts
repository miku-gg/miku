import * as Core from "@mikugg/core";
import { InferProps } from "prop-types";
import { LLaMAServicePropTypes, ServicesNames } from "../services";
import {
  hasTextStop,
  parsePygmalionResponse,
} from "./PygmalionPromptCompleter";
type LLaMAPropTypes = InferProps<typeof LLaMAServicePropTypes>;

export interface LLaMAParams
  extends Core.ChatPromptCompleters.ChatPromptCompleterConfig {
  serviceEndpoint: string;
  props: LLaMAPropTypes;
  signer: Core.Services.ServiceQuerySigner;
}

export class LLaMAPromptCompleter extends Core.ChatPromptCompleters
  .ChatPromptCompleter {
  private props: LLaMAPropTypes;
  private service: Core.Services.ServiceClient<LLaMAPropTypes, string>;

  constructor(params: LLaMAParams) {
    super(params);
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<LLaMAPropTypes, string>(
      params.serviceEndpoint,
      params.signer,
      ServicesNames.LLaMA
    );
  }

  public override async getCost(
    prompt: string,
    settings: string
  ): Promise<number> {
    return this.service.getQueryCost({
      ...this.getProps(),
      settings,
      prompt,
    });
  }

  /**
   *
   * @param prompt - The prompt to complete.
   *
   * @returns The completed prompt.
   */
  protected async completePrompt(
    memory: Core.Memory.ShortTermMemory,
    settings: string
  ): Promise<Core.ChatPromptCompleters.ChatPromptResponse> {
    const prompt = memory.buildMemoryPrompt();
    let result = "";
    let isParsedResultSmall = false;
    let tries = 0;

    while (
      (isParsedResultSmall || !hasTextStop(result, memory.getSubjects())) &&
      tries++ < 3
    ) {
      if (isParsedResultSmall) result = "";
      result += await this.service.query(
        {
          ...this.getProps(),
          settings: settings,
          prompt: prompt + result,
        },
        await this.getCost(prompt + result, settings)
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

  protected async handleCompletionOutput(
    output: Core.ChatPromptCompleters.ChatPromptResponse,
    _command: Core.Commands.Command
  ): Promise<Core.OutputListeners.DialogOutputEnvironment> {
    return {
      commandId: _command.commandId,
      text: output.text,
    };
  }

  private getProps(): LLaMAPropTypes {
    return this.props;
  }
}
