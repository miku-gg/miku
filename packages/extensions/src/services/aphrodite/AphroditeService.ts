import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import GPT3Tokenizer from "gpt3-tokenizer";
import axios from "axios";
import { GPTShortTermMemoryV2  } from "../../memory/GPTMemoryV2";
import BotCardConnector, { parseAttributes, parseExampleMessages } from "./BotCardConnector";
import { S3ClientConfig } from "@aws-sdk/client-s3";

export interface AphroditeConfig {
  max_new_tokens: number,
  do_sample: boolean,
  temperature: number,
  top_p: number,
  typical_p: number,
  repetition_penalty: number,
  repetition_penalty_range: number,
  encoder_repetition_penalty: number,
  top_k: number,
  min_length: number,
  no_repeat_ngram_size: number,
  num_beams: number,
  penalty_alpha: number,
  length_penalty: number,
  early_stopping: boolean,
  seed: number,
  add_bos_token: boolean,
  stopping_strings: string[],
  truncation_length: number,
  ban_eos_token: boolean,
  skip_special_tokens: boolean,
  top_a: number,
  tfs: number,
  epsilon_cutoff: number,
  eta_cutoff: number,
  mirostat_mode: number,
  mirostat_tau: number,
  mirostat_eta: number,
  use_mancer: boolean
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
  aphroditeEndpoint: string;
  aphroditeApiKey: string;
  aphoditeConfig: AphroditeConfig
}

export class AphroditePromptCompleterService extends Miku.Services.Service {
  private tokenizer: GPT3Tokenizer;
  private botCardConnector: BotCardConnector;
  private aphroditeEndpoint: string;
  private aphroditeApiKey: string;
  private aphroditeConfig: AphroditeConfig;
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
    this.aphroditeEndpoint = config.aphroditeEndpoint;
    this.aphroditeApiKey = config.aphroditeApiKey;
    this.aphroditeConfig = config.aphoditeConfig;
    this.tokenizer = new GPT3Tokenizer({ type: "gpt3" });
    this.botCardConnector = new BotCardConnector(config.s3Bucket, config.s3Config);
  }

  protected async computeInput(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<string> {
    const prompt = await this.generatePrompt(input);
    const gptTokens = this.tokenizer.encode(input.prompt).bpe.length;
    if (gptTokens > 3800) return "";
    const completion = await this.simpleCompletion(prompt, input.userName);
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
    prompt: string,
    userName: string
  ): Promise<string> {
    const completion = await axios.post(
      `${this.aphroditeEndpoint}/v1/generate`,
      {
        ...this.aphroditeConfig,
        stopping_strings: [
          ...this.aphroditeConfig.stopping_strings,
          `\n${userName}:`,
          `\n*${userName} `,
        ],
        prompt,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": this.aphroditeApiKey,
        },
      }
    );
    const result = completion?.data?.results?.length ? completion?.data?.results[0].text : '';
    return result || '';
  }

  protected async calculatePrice(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<number> {
    return 0;
  }
}
