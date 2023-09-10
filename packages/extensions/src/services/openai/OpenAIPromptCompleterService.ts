import * as Miku from "@mikugg/core";
import OpenAI from "openai";
import PropTypes, { InferProps } from "prop-types";
import GPT3Tokenizer from "gpt3-tokenizer";

export interface OpenAIPromptCompleterServiceConfig
  extends Miku.Services.ServiceConfig {
  apiKey: string;
}

const OpenAIMessagePropType = {
  role: PropTypes.oneOf(["user", "assistant", "system"]),
  content: PropTypes.string,
};

export const OpenAISimpleModels = ["text-davinci-003"];
export const OpenAIChatModels = ["gpt-3.5-turbo", "gpt-4"];

export type OpenAIMessage = PropTypes.InferProps<typeof OpenAIMessagePropType>;

export const OpenAIPromptCompleterServicePropTypes = {
  openai_key: PropTypes.string,
  settings: PropTypes.string,
  prompt: PropTypes.string,
  messages: PropTypes.arrayOf(
    PropTypes.shape(OpenAIMessagePropType).isRequired
  ),
  stop: PropTypes.arrayOf(PropTypes.string.isRequired),
};

export class OpenAIPromptCompleterService extends Miku.Services.Service {
  private tokenizer: GPT3Tokenizer;
  private openai: OpenAI;
  protected defaultProps: InferProps<
    typeof OpenAIPromptCompleterServicePropTypes
  > = {
    openai_key: "",
    settings: "",
    prompt: "",
    messages: [],
    stop: [] as string[],
  };

  protected getPropTypes(): PropTypes.ValidationMap<any> {
    return OpenAIPromptCompleterServicePropTypes;
  }

  constructor(config: OpenAIPromptCompleterServiceConfig) {
    super(config);
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'http://localhost:8000/v1'
    });
    this.tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  }

  protected async computeInput(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<string> {
    let openai = this.openai;

    if (input.openai_key) {
      openai = new OpenAI({
        apiKey: input.openai_key,
        baseURL: 'http://localhost:8000/v1'
      });
    }

    const completion = OpenAIChatModels.includes(
      'EleutherAI/pythia-70m'
    )
      ? await this.chatCompletion(openai, input)
      : await this.simpleCompletion(openai, input);

    return completion;
  }

  protected async simpleCompletion(
    openai: OpenAI,
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<string> {
    const modelSettings = JSON.parse(input.settings);
    const response = await openai.completions.create({
      model: 'EleutherAI/pythia-70m',
      temperature: modelSettings.temp,
      max_tokens: 100,
      top_p: modelSettings.topP,
      frequency_penalty: modelSettings.frequencyPenalty,
      presence_penalty: modelSettings.presencePenalty,
      prompt: input.prompt,
      stop: input.stop.length ? input.stop : undefined,
    });
    const choices = response?.choices || [];

    return choices.length ? choices[0].text || "" : "";
  }

  protected async chatCompletion(
    openai: OpenAI,
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<string> {
    const modelSettings = JSON.parse(input.settings);
    const response = await openai.chat.completions.create({
      model: modelSettings.oaiModel,
      temperature: modelSettings.temp,
      max_tokens: modelSettings.maxTokens,
      top_p: modelSettings.topP,
      frequency_penalty: modelSettings.frequencyPenalty,
      presence_penalty: modelSettings.presencePenalty,
      messages: input.messages,
      stop: input.stop.length ? input.stop : undefined, // this makes all the models return empty msg idk y
    });
    const choices = response?.choices || [];
    const completion = choices.length ? choices[0].message?.content || "" : "";

    return completion.replace(/"+/g, '"');
  }

  protected async calculatePrice(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<number> {
    const modelSettings = JSON.parse(input.settings);
    const gptTokens = this.tokenizer.encode(input.prompt).bpe.length;
    return (
      gptTokens + (modelSettings.maxTokens * Math.max(1, input.best_of) || 0)
    );
  }
}
