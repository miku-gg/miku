import OpenAI, { ClientOptions } from "openai";
import { CompletionCreateParams } from "openai/resources/completions.mjs";

export abstract class AbstractTokenGenerator<TRequestOptions = undefined> {
  abstract generateTokenLogProgs(
    prompt: string,
    logit_bias: Record<string, number>,
    reqOptions?: TRequestOptions
  ): Promise<Record<string, number>>;
  abstract generateString(
    prompt: string,
    options: Record<string, number | string | string[]>,
    reqOptions?: TRequestOptions
  ): AsyncGenerator<string>;
}
/**
 * OpenAI Token Generator
 *
 */
export class OpenAITokenGenerator extends AbstractTokenGenerator<
  OpenAI.RequestOptions<Record<string, unknown>> | undefined
> {
  private openai: OpenAI;
  private model: string;
  private defaultCompletionParams?: CompletionCreateParams;

  constructor(
    params: {
      apiKey: string;
      model: string;
      baseURL?: string;
    },
    options?: ClientOptions,
    defaultCompletionParams?: CompletionCreateParams
  ) {
    super();
    this.model = params.model;
    this.openai = new OpenAI({
      apiKey: params.apiKey,
      baseURL: params.baseURL,
      ...options,
    });
    this.defaultCompletionParams = defaultCompletionParams;
  }

  override async generateTokenLogProgs(
    prompt: string,
    logit_bias: Record<string, number>,
    reqOptions?: OpenAI.RequestOptions<Record<string, unknown>> | undefined
  ): Promise<Record<string, number>> {
    const result = await this.openai.completions.create(
      {
        stream: false,
        model: this.model,
        prompt,
        logit_bias,
        logprobs: 5,
        max_tokens: 1,
      },
      reqOptions
    );
    const logprobsResult = result.choices[0].logprobs?.top_logprobs || [];
    const top_logprobs: Record<string, number> = logprobsResult
      ? logprobsResult[0]
      : { "2": 0 };
    return top_logprobs;
  }

  override async *generateString(
    prompt: string,
    options: Record<string, string | number | string[]>,
    reqOptions?: OpenAI.RequestOptions<Record<string, unknown>> | undefined
  ): AsyncGenerator<string> {
    const stream = await this.openai.completions.create(
      {
        ...this.defaultCompletionParams,
        ...options,
        model: this.model,
        prompt,
        stream: true,
      },
      reqOptions
    );
    let result = "";
    for await (const chunk of stream) {
      result += chunk.choices[0]?.text;
      yield result;
    }
  }
}
