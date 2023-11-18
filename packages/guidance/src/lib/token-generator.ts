import OpenAI, { ClientOptions } from 'openai'

export abstract class AbstractTokenGenerator {
  abstract generateToken(prompt: string, logit_bias: Record<string, number>): Promise<string>;
  abstract generateString(prompt: string, options: Record<string, string>): Promise<string>;
}
/**
 * OpenAI Token Generator
 * 
 */
export class OpenAITokenGenerator extends AbstractTokenGenerator {
  private openai: OpenAI;
  private model: string;

  constructor(params: {
    apiKey: string;
    model: string;
    baseURL?: string;
  }, options?: ClientOptions) {
    super();
    this.model = params.model;
    this.openai = new OpenAI({
      apiKey: params.apiKey,
      baseURL: params.baseURL,
      ...options
    });
  }

  override async generateToken(prompt: string, logit_bias: Record<string, number>): Promise<string> {
    const result = await this.openai.completions.create({
      model: this.model,
      prompt,
      logit_bias,
      logprobs: 10,
      max_tokens: 1,
    });
    const logprobsResult = result.choices[0].logprobs?.top_logprobs || [];
    const top_logprobs: Record<string, number> = logprobsResult ? logprobsResult[0] : { '2' : 0 }

    // get max top_logpobs that is in logit_bias
    let max = -Infinity;
    let max_key = '';
    for (const key in top_logprobs) {
      if (top_logprobs[key] > max && key in logit_bias) {
        max = top_logprobs[key];
        max_key = key;
      }
    }

    // if no key in logit_bias, get max top_logprobs
    if (max_key === '') {
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

  override async generateString(prompt: string, options: Record<string, string>): Promise<string> {

    const result = await this.openai.completions.create({
      model: this.model,
      prompt,
      ...options
    });
    return result.choices[0].text;
  }
}
