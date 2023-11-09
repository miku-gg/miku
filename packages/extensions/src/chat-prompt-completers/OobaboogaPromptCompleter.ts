import * as Core from "@mikugg/core";
import { InferProps } from "prop-types";
import { OobaboogaServicePropTypes, OobaboogaSettings, ServicesNames } from "../services";
import {
  hasTextStop,
  parsePygmalionResponse,
} from "./PygmalionPromptCompleter";
type OobaboogaPropTypes = InferProps<typeof OobaboogaServicePropTypes>;

export interface OobaboogaParams
  extends Core.ChatPromptCompleters.ChatPromptCompleterConfig {
  serviceEndpoint: string;
  props: OobaboogaPropTypes;
  signer: Core.Services.ServiceQuerySigner;
}

export class OobaboogaPromptCompleter extends Core.ChatPromptCompleters
  .ChatPromptCompleter {
  private props: OobaboogaPropTypes;
  private service: Core.Services.ServiceClient<OobaboogaPropTypes, string>;

  constructor(params: OobaboogaParams) {
    super(params);
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<OobaboogaPropTypes, string>(
      params.serviceEndpoint,
      params.signer,
      ServicesNames.Oobabooga
    );
  }

  public override async getCost(
    prompt: string,
  ): Promise<number> {
    return this.service.getQueryCost({
      ...this.getProps(),
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
    memory: Core.Memory.ShortTermMemory
  ): Promise<Core.ChatPromptCompleters.ChatPromptResponse> {
    const settings: OobaboogaSettings = JSON.parse(this.props.settings || '{}');
    const prompt = memory.buildMemoryPrompt(settings.truncateLength - settings.maxTokens);
    let result = "";
    let isParsedResultSmall = false;
    let tries = 0;

    while (
      (isParsedResultSmall || !hasTextStop(result, memory.getSubjects())) &&
      tries++ < 1
    ) {
      if (isParsedResultSmall) result = "";
      result += await this.service.query(
        {
          ...this.getProps(),
          prompt: prompt + result,
        },
        await this.getCost(prompt + result)
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

  private getProps(): OobaboogaPropTypes {
    return this.props;
  }
}
