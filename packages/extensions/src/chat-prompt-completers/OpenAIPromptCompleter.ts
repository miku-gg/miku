import * as Core from "@mikugg/core";
import { InferProps } from "prop-types";
import {
  OpenAIChatModels,
  OpenAIMessage,
  OpenAIPromptCompleterServicePropTypes,
} from "../services/openai/OpenAIPromptCompleterService";
import { ServicesNames } from "../services";
import trim from "lodash.trim";

type OpenAIPropTypes = InferProps<typeof OpenAIPromptCompleterServicePropTypes>;

export interface OpenAIParams
  extends Core.ChatPromptCompleters.ChatPromptCompleterConfig {
  serviceEndpoint: string;
  props: OpenAIPropTypes;
  signer: Core.Services.ServiceQuerySigner;
}

/**
 * OpenAIPromptCompleter is a class that receives commands and completes prompts it using OpenAI.
 *
 * @method completePrompt - A function that completes a prompt using OpenAI API.
 *
 * @property {OpenAIManager} openaiManger - The OpenAIManager.
 */
export class OpenAIPromptCompleter extends Core.ChatPromptCompleters
  .ChatPromptCompleter {
  private props: OpenAIPropTypes;
  private service: Core.Services.ServiceClient<OpenAIPropTypes, string>;

  constructor(params: OpenAIParams) {
    super(params);
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<OpenAIPropTypes, string>(
      params.serviceEndpoint,
      params.signer,
      ServicesNames.OpenAI
    );
  }

  public override async getCost(
    prompt: string
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
    const prompt = memory.buildMemoryPrompt();
    const props = this.getProps();
    const stop = OpenAIChatModels.includes(
      props.settings ? JSON.parse(props.settings).oaiModel : ""
    )
      ? props.stop?.filter(
          (_stop: string) => _stop != `${this.memory.getBotSubject()}: `
        )
      : props.stop;
    const result = await this.service.query(
      {
        ...this.getProps(),
        stop,
        messages: this.getChatMessages(memory),
        prompt
      },
      await this.getCost(prompt)
    );
    return { text: result.replace(`${this.memory.getBotSubject()}: `, ``) };
  }

  protected getChatMessages(memory: Core.Memory.ShortTermMemory): OpenAIMessage[] {
    const basePrompt = memory.getContextPrompt();
    const memoryLines = [
      ...this.getInitiatorPromptAsMemories(memory),
      ...memory.getMemory(),
    ];
    const memorySize = this.memory.memorySize;
    return [
      { role: "system", content: basePrompt },
      ...memoryLines
        .filter((_, index) => memoryLines.length - memorySize < index)
        .map((message) => ({
          role:
            message.subject == memory.getBotSubject() || !message.subject
              ? "assistant"
              : "user",
          content: message.subject
            ? `${message.subject}: "${message.text}"`
            : message.text,
        })),
    ];
  }

  protected async handleCompletionOutput(
    output: Core.ChatPromptCompleters.ChatPromptResponse,
    _command: Core.Commands.Command
  ): Promise<Core.OutputListeners.DialogOutputEnvironment> {
    const promptResponse = output.text.replace(
      `\n${this.memory.getBotSubject()}: `,
      ""
    );
    return {
      commandId: _command.commandId,
      text: promptResponse,
    };
  }

  private getInitiatorPromptAsMemories(
    memory: Core.Memory.ShortTermMemory
  ): Core.Memory.MemoryLine[] {
    const initiatorPromptLines = memory.getInitiatorPrompt().split("\n");
    const subjects = memory.getSubjects() || [];
    const botSubject = memory.getBotSubject();
    const _subject = subjects[0] || "You";

    return initiatorPromptLines
      .map((line, index) => {
        let subject = _subject;
        if (!line.startsWith(`${subject}:`)) {
          subject = trim(line).startsWith(`${botSubject}:`) ? botSubject : "";
        }

        return {
          text: trim(line.replace(`${subject}:`, "")),
          subject: subject,
          type: Core.Commands.CommandType.DIALOG,
        };
      })
      .filter((line) => trim(line.text));
  }

  private getProps(): OpenAIPropTypes {
    return {
      ...this.props,
      stop: [
        `${this.memory.getBotSubject()}: `,
        ...this.memory.getSubjects().map((subject) => `${subject}: `),
      ],
    };
  }
}
