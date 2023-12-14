import * as Core from "@mikugg/core";
import trim from "lodash.trim";
import { AphroditeServiceInput, AphroditeServiceOutput, ServicesNames, AphroditeMessage } from "../services";
import { emotionTemplates } from "../utils/emotions";

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

export const parseLLMResponse = (
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
  let _text = text;
  // remove last a special char is present [".", "*", '"', "!", "?"]
  for (let i = 0; i < text.length; i++) {
    const char = text[text.length - 1 - i];
    if (![".", "*", '"', "!", "?"].includes(char)) {
      _text = _text.substring(0, _text.length - 1);
    } else {
      break;
    }
  }
  if (_text.length > 2) {
    text = _text;
    const lastChar = text[text.length - 1];
    const prevLastChar = text[text.length - 2];
    if (["*", '"'].includes(lastChar) && ["\n", " "].includes(prevLastChar)) {
      text = text.substring(0, text.length - 1);
    }
  }

  text = trim(text);
  text = trim(text, '\n');
  return text;
};

export interface AphroditeParams
  extends Core.ChatPromptCompleters.ChatPromptCompleterConfig {
  serviceEndpoint: string;
  props: AphroditeServiceInput;
}

export class AphroditePromptCompleter extends Core.ChatPromptCompleters
  .ChatPromptCompleter {
  private props: AphroditeServiceInput;
  private service: Core.Services.ServiceClient<AphroditeServiceInput, AphroditeServiceOutput>;
  private swipes: Map<string, number> = new Map();

  constructor(params: AphroditeParams) {
    super(params);
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<AphroditeServiceInput, AphroditeServiceOutput>(
      params.serviceEndpoint,
      ServicesNames.Aphrodite
    );
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
    let ask = '';
    const messages = this.getChatMessages(memory);
    if(messages.length) {
      const lastMessage = messages[messages.length - 1].content || '';
      let swipe = this.swipes.get(lastMessage);
      if (swipe) {
        this.swipes.set(lastMessage, swipe + 1);
      } else {
        this.swipes.set(lastMessage, 1);
      }
      swipe = this.swipes.get(lastMessage);
      if (swipe && swipe > 1) {
        const emotionIds = emotionTemplates[0].emotionIds;
        // select random emotion Id
        const emotionId = emotionIds[Math.floor(Math.random() * emotionIds.length)];
        ask = `\n### Response (Emotion=${emotionId}):`;
      }
    }
    let result = "";
    result = await this.service.query(
      {
        ...this.props,
        ask,
        messages
      }
    );

    const resultParsed = parseLLMResponse(
      result,
      memory.getBotSubject(),
      memory.getSubjects()
    );
    if (hasTextStop(result, memory.getSubjects())) {
      result = resultParsed;
    }
    result = resultParsed;

    return { text: result };
  }


  protected getChatMessages(memory: Core.Memory.ShortTermMemory): AphroditeMessage[] {
    const memoryLines = [
      ...memory.getMemory(),
    ];
    const memorySize = 100;
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
}
