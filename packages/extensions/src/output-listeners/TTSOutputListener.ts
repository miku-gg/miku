import * as Core from "@mikugg/core";
import { TTSServiceInput, TTSServiceOutput } from "../services/tts/TTSService";
import { ServicesNames } from "../services";
import trim from "lodash.trim";
import { replaceAll } from "../memory/strategies";

export interface TTSOutputListenerParams {
  serviceEndpoint: string;
  props: TTSServiceInput;
}

export function cleanTTSText(text: string) {
  // sanitize text
  // text = replaceAll(text, /\*(.*?)\*/g, "($1)");
  text = trim(text);
  if (text.startsWith('"') && text.endsWith('"'))
    text = text.substring(1, text.length - 1);
  text = " " + text;

  let cleanText = "";
  let lastOpen: undefined | string = undefined;
  for (let x = 0; x < text.length; x++) {
    const ch = text.charAt(x);
    const spaceBefore = x > 0 && text.charAt(x - 1) == " ";

    // if (lastOpen == '(' && ch == ')') {lastOpen = undefined; continue;}
    if (lastOpen == "[" && ch == "]") {
      lastOpen = undefined;
      continue;
    }
    if (lastOpen == "-" && ch == "-") {
      lastOpen = undefined;
      continue;
    }
    if (lastOpen == "*" && ch == "*") {
      lastOpen = undefined;
      continue;
    }

    // We require a space before these characters to avoid cases like "Oh-oh"
    // Where the character is part of the word.
    if (
      spaceBefore &&
      /*ch == '(' ||*/ (ch == "[" || ch == "-" || ch == "*")
    ) {
      lastOpen = ch;
      continue;
    }

    if (!lastOpen) {
      cleanText += ch;
    }
  }
  cleanText.replace(/ *\([^)]*\) */g, "");

  cleanText = trim(cleanText);

  return cleanText;
}

export class TTSOutputListener extends Core.OutputListeners.OutputListener<
  Core.OutputListeners.DialogOutputEnvironment,
  string
> {
  protected service: Core.Services.ServiceClient<TTSServiceInput, TTSServiceOutput>;
  protected props: TTSServiceInput;
  protected serviceName: string;

  constructor(params: TTSOutputListenerParams, serviceName: ServicesNames) {
    super();
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<TTSServiceInput, TTSServiceOutput>(
      params.serviceEndpoint,
      serviceName
    );
    this.serviceName = serviceName;
  }

  protected override async handleOutput(
    output: Core.OutputListeners.DialogOutputEnvironment
  ): Promise<string> {
    if (this.props.enabled && this.serviceName != "") {      
      const prompt = this.props.readNonSpokenText
      ? replaceAll(output.text, /\*(.*?)\*/g, "($1)")
      : this.cleanText(output.text);
      return this.service.query(
        {
          ...this.props,
          prompt,
        }
      );
    } else {
      return "";
    }
  }

  protected getResultOnError(): string {
    return "";
  }

  private cleanText(text: string) {
    return cleanTTSText(text);
  }
}
