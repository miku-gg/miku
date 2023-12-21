import OpenAI, { ClientOptions } from "openai";
import { CompletionCreateParams } from "openai/resources/completions.mjs";

export abstract class AbstractTokenGenerator {
  abstract generateToken(
    prompt: string,
    logit_bias: Record<string, number>
  ): Promise<string>;
  abstract generateString(
    prompt: string,
    options: Record<string, string>
  ): AsyncGenerator<string>;
}
/**
 * OpenAI Token Generator
 *
 */
export class OpenAITokenGenerator extends AbstractTokenGenerator {
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

  override async generateToken(
    prompt: string,
    logit_bias: Record<string, number>
  ): Promise<string> {
    const result = await this.openai.completions.create({
      ...this.defaultCompletionParams,
      stream: false,
      model: this.model,
      prompt,
      logit_bias,
      logprobs: 10,
      max_tokens: 1,
    });
    const logprobsResult = result.choices[0].logprobs?.top_logprobs || [];
    const top_logprobs: Record<string, number> = logprobsResult
      ? logprobsResult[0]
      : { "2": 0 };

    // get max top_logpobs that is in logit_bias
    let max = -Infinity;
    let max_key = "";
    for (const key in top_logprobs) {
      if (top_logprobs[key] > max && key in logit_bias) {
        max = top_logprobs[key];
        max_key = key;
      }
    }

    // if no key in logit_bias, get max top_logprobs
    if (max_key === "") {
      // no key in logit_bias
      max = -Infinity;
      for (const key in top_logprobs) {
        if (top_logprobs[key] > max) {
          max = top_logprobs[key];
          max_key = key;
        }
      }
    }

    return max_key;
  }

  override async *generateString(
    prompt: string,
    options: Record<string, string>
  ): AsyncGenerator<string> {
    const stream = await this.openai.completions.create({
      ...this.defaultCompletionParams,
      ...options,
      model: this.model,
      prompt,
      stream: true,
    });
    let result = "";
    for await (const chunk of stream) {
      result += chunk.choices[0]?.text;
      yield result;
    }
  }
}
