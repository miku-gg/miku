import * as Miku from "@mikugg/core";
import OpenAI from "openai";
import PropTypes, { InferProps } from "prop-types";
import GPT3Tokenizer from "gpt3-tokenizer";
import { GPTShortTermMemoryV2  } from "../../memory/GPTMemoryV2";
import BotCardConnector, { parseAttributes, parseExampleMessages } from "./BotCardConnector";
import { S3ClientConfig } from "@aws-sdk/client-s3";

const APHRODITE_ENDPOINT = "http://localhost:8000/v1";
const REQUEST_CONFIG = {
  model: 'EleutherAI/pythia-70m',
  temperature: 0.7,
  max_tokens: 100,
  top_p: 0.1,
  frequency_penalty: 1.18,
  presence_penalty: 0,
  stop: ["</s>", "<|", "\n#", "\n*{{user}} ", "\n\n\n"],
}

const AphroditeMessagePropType = {
  role: PropTypes.oneOf(["user", "assistant", "system"]),
  content: PropTypes.string,
};

export type AphroditeMessage = PropTypes.InferProps<typeof AphroditeMessagePropType>;

export const AphroditePromptCompleterServicePropTypes = {
  botHash: PropTypes.string,
  userName: PropTypes.string,
  messages: PropTypes.arrayOf(
    PropTypes.shape(AphroditeMessagePropType)
  ),
};

export interface AphroditePromptCompleterServiceConfig extends Miku.Services.ServiceConfig {
  s3Bucket: string;
  s3Config: S3ClientConfig;
}

export class AphroditePromptCompleterService extends Miku.Services.Service {
  private tokenizer: GPT3Tokenizer;
  private openai: OpenAI;
  private botCardConnector: BotCardConnector;
  protected defaultProps: InferProps<
    typeof AphroditePromptCompleterServicePropTypes
  > = {
    userName: 'Anon',
    botHash: '',
    messages: [],
  };

  protected getPropTypes(): PropTypes.ValidationMap<any> {
    return AphroditePromptCompleterServicePropTypes;
  }

  constructor(config: AphroditePromptCompleterServiceConfig) {
    super(config);
    this.openai = new OpenAI({
      baseURL: APHRODITE_ENDPOINT
    });
    this.tokenizer = new GPT3Tokenizer({ type: "gpt3" });
    this.botCardConnector = new BotCardConnector(config.s3Bucket, config.s3Config);
  }

  protected async computeInput(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<string> {
    const prompt = await this.generatePrompt(input);
    const completion = await this.simpleCompletion(prompt);
    return completion;
  }

  protected async generatePrompt(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<string> {
    const card = await this.botCardConnector.getBotCard(input.botHash);

    const memory = new GPTShortTermMemoryV2({
      prompt_context: "",
      prompt_initiator: "",
      language: "en",
      subjects: [
        input.userName
      ],
      botSubject: card.data.name,
      buildStrategySlug: "alpaca",
      parts: {
        "persona": card.data.description,
        "attributes": parseAttributes(card.data.personality),
        "sampleChat": parseExampleMessages(card.data.mes_example),
        "scenario": card.data.scenario,
        "greeting": card.data.first_mes,
        "botSubject": card.data.name
      }
    });

    input.messages.forEach((message: AphroditeMessage) => {
      memory.pushMemory({
        text: message.content || '',
        subject: message.role || '',
        type: message.role === 'system' ? Miku.Commands.CommandType.CONTEXT : Miku.Commands.CommandType.DIALOG
      });
    })

    return memory.buildMemoryPrompt();
  }

  protected async simpleCompletion(
    prompt: string
  ): Promise<string> {
    const response = await this.openai.completions.create({
      prompt,
      ...REQUEST_CONFIG
    });
    const choices = response?.choices || [];

    return choices.length ? choices[0].text || "" : "";
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
