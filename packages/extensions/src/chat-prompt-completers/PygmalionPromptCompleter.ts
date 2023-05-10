import * as Core from "@mikugg/core";
import { InferProps } from "prop-types";
import trim from "lodash.trim";
import { PygmalionServicePropTypes, ServicesNames } from "../services";

const buildTextStops = (_subjects: string[]): string[] => {
  const subjects: string[] = _subjects.map((subject) => `${subject}:`);
  return ["<|endoftext|>", ...subjects];
};

export const hasTextStop = (text: string, _subjects: string[]): boolean => {
  const stops = buildTextStops(_subjects);
  return stops.reduce((prev, cur) => {
    return prev || text.includes(cur);
  }, false);
};

export const parsePygmalionResponse = (
  text: string,
  _botSubject: string,
  _subjects: string[]
): string => {
  const botSubject: string = _botSubject;
  const hasStop = hasTextStop(text, _subjects);
  const removeLineGroups = (text: string): string => {
    return text.replace(/\n\n/g, "\n");
  };
  const removeLastLineBreak = (text: string): string => {
    return text[text.length - 1] === "\n"
      ? text.substring(0, text.length - 1)
      : text;
  };
  text = text.split(`${botSubject}:`).join("");
  text = trim(text);
  text = removeLineGroups(text);
  if (hasStop) {
    const stops = buildTextStops(_subjects);
    text = text.substring(
      0,
      stops.reduce((prev, cur) => {
        const subjectTextIndex = text.indexOf(cur);
        return subjectTextIndex === -1
          ? prev
          : Math.min(prev, subjectTextIndex);
      }, text.length)
    );
    text = removeLastLineBreak(text);
  } else {
    text = trim(text);
    text = removeLastLineBreak(text);
    const firstLineBreak = text.lastIndexOf("\n");
    text = text.substring(
      0,
      firstLineBreak !== -1 ? firstLineBreak : text.length
    );
  }

  text = trim(text);
  while (text.startsWith("!") || text.startsWith("?")) text = text.substring(1);

  text = trim(text);
  return text;
};

type PygmalionPropTypes = InferProps<typeof PygmalionServicePropTypes>;

export interface PygmalionParams
  extends Core.ChatPromptCompleters.ChatPromptCompleterConfig {
  serviceEndpoint: string;
  props: PygmalionPropTypes;
  signer: Core.Services.ServiceQuerySigner;
}

export class PygmalionPromptCompleter extends Core.ChatPromptCompleters
  .ChatPromptCompleter {
  private props: PygmalionPropTypes;
  private service: Core.Services.ServiceClient<PygmalionPropTypes, string>;

  constructor(params: PygmalionParams) {
    super(params);
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<PygmalionPropTypes, string>(
      params.serviceEndpoint,
      params.signer,
      ServicesNames.Pygmalion
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
   * @param settings - The settings to complete the prompt with.
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

  private getProps(): PygmalionPropTypes {
    return this.props;
  }
}
