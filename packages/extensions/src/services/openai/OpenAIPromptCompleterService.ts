import * as Miku from "@mikugg/core";
import { Configuration, OpenAIApi } from "openai";
import PropTypes, { InferProps } from "prop-types";
import GPT3Tokenizer from 'gpt3-tokenizer';

export interface OpenAIPromptCompleterServiceConfig extends Miku.Services.ServiceConfig {
  apiKey: string;
}

export const OpenAIPromptCompleterServicePropTypes = {
  "openai_key": PropTypes.string,
  "model": PropTypes.oneOf(['text-davinci-003']),
  "temperature": PropTypes.number,
  "top_p": PropTypes.number,
  "max_tokens": PropTypes.number,
  "best_of": PropTypes.number,
  "prompt": PropTypes.string,
  "stop": PropTypes.arrayOf(PropTypes.string.isRequired),
}

export class OpenAIPromptCompleterService extends Miku.Services.Service {
  private tokenizer: GPT3Tokenizer;
  private openai: OpenAIApi;
  protected defaultProps: InferProps<typeof OpenAIPromptCompleterServicePropTypes>  = {
    "openai_key": "",
    "model": 'text-davinci-003',
    "temperature": 0.9,
    "top_p": 1,
    "max_tokens": 150,
    "best_of": 1,
    "prompt": '',
    "stop": [] as string[],
  };

  protected getPropTypes(): PropTypes.ValidationMap<any> {
    return OpenAIPromptCompleterServicePropTypes;
  }

  constructor(config: OpenAIPromptCompleterServiceConfig) {
    super(config);
    this.openai = new OpenAIApi(new Configuration({
      apiKey: config.apiKey,
    }));
    this.tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  }

  protected async computeInput(input: InferProps<typeof this.propTypesRequired>): Promise<string> {
    let openai = this.openai;
    if (input.openai_key) {
      openai = new OpenAIApi(new Configuration({
        apiKey: input.openai_key,
      }));
    }
    const completion = await openai.createCompletion({
      model: input.model,
      temperature: input.temperature,
      max_tokens: input.max_tokens,
      top_p: input.top_p,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      prompt: input.prompt,
      stop: input.stop.length ? input.stop : undefined,
    });
    const choices = completion?.data?.choices || [];

    return choices.length ? (choices[0].text || '') : '';
  }

  protected async calculatePrice(input: InferProps<typeof this.propTypesRequired>): Promise<number> {
    const gptTokens = this.tokenizer.encode(input.prompt).bpe.length;
    return gptTokens + input.max_tokens * Math.max(1, input.best_of);
  }
}