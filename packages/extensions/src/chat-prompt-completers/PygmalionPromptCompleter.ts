import * as Core from "@mikugg/core";
import { InferProps } from "prop-types";
import trim from "lodash.trim";
import { KoboldAIsettings, PygmalionServicePropTypes, ServicesNames } from "../services";

const buildTextStops = (_subjects: string[]): string[] => {
  const subjects: string[] = _subjects.map((subject) => `${subject}:`);
  return ["<|endoftext|>", "<START>", "USER:", "\n\n\n", "###", ...subjects];
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
  const removeLastLineBreak = (text: string): string => {
    return text[text.length - 1] === "\n"
      ? text.substring(0, text.length - 1)
      : text;
  };
  const hasEvenQuotes = (text: string): boolean => {
    const amountOfQuotes = text.split('"').length - 1;
    const amountOfAsterisks = text.split("*").length - 1;
    return amountOfQuotes % 2 === 0 && amountOfAsterisks % 2 === 0;
  }

  text = text.split(`${botSubject}:`).join("");
  text = trim(text);
  if (hasStop) {
    const stops = buildTextStops(_subjects);
    const firstStopIndex = stops.reduce((prev, cur) => {
      const subjectTextIndex = text.indexOf(cur);
      return subjectTextIndex === -1
        ? prev
        : Math.min(prev, subjectTextIndex);
    }, text.length);
    if (firstStopIndex !== text.length) {
      text = text.substring(0, firstStopIndex);
      text = removeLastLineBreak(text);
    }
  } else {
    text = trim(text);
    text = removeLastLineBreak(text);
  }

  text = trim(text);
  while (
    text.length > 0 &&
    (![".", "*", '"', "!", "?"].includes(text[text.length - 1]) || !hasEvenQuotes(text))
  ) {
    text = text.substring(0, text.length - 1);
  }

  text = trim(text);
  text = trim(text, '\n');
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
   * @param settings - The settings to complete the prompt with.
   *
   * @returns The completed prompt.
   */
  protected async completePrompt(
    memory: Core.Memory.ShortTermMemory
  ): Promise<Core.ChatPromptCompleters.ChatPromptResponse> {
    const settings: KoboldAIsettings = JSON.parse(this.props.settings || '{}');
    const prompt = memory.buildMemoryPrompt(settings.maxContextLength - settings.maxTokens);
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

  private getProps(): PygmalionPropTypes {
    return this.props;
  }
}
