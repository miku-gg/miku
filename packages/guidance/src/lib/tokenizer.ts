import llamaTokenizer from './_llama-tokenizer';
import { encode, decode } from 'gpt-tokenizer';
import mistralTokenizer from './_mistral-tokenizer';
import { TokenizerLoader } from '@lenml/tokenizers';
export abstract class AbstractTokenizer {
  public name: string = 'abstract';
  abstract encodeString(str: string): number[];
  abstract decodeString(arr: number[]): string;
  abstract getEOS(): string;
}

export class LLaMATokenizer extends AbstractTokenizer {
  override encodeString(
    str: string,
    add_bos_token?: boolean,
    add_preceding_space?: boolean,
    log_performance?: boolean,
  ): number[] {
    if (str.endsWith(this.getEOS())) {
      str = str.substring(0, str.length - this.getEOS().length);
      return [
        ...llamaTokenizer.encode(str, add_bos_token, add_preceding_space, log_performance),
        2, // EOS
      ];
    }
    return llamaTokenizer.encode(str, add_bos_token, add_preceding_space, log_performance);
  }

  override decodeString(arr: number[], add_bos_token?: boolean, add_preceding_space?: boolean): string {
    if (arr[arr.length - 1] === 2) {
      arr = arr.slice(0, arr.length - 1);
      return llamaTokenizer.decode(arr, add_bos_token, add_preceding_space) + this.getEOS();
    }
    return llamaTokenizer.decode(arr, add_bos_token, add_preceding_space);
  }

  override getEOS(): string {
    return '</s>';
  }
}

export class GTPTokenizer extends AbstractTokenizer {
  override encodeString(str: string): number[] {
    return encode(str, {
      allowedSpecial: new Set([this.getEOS()]),
    });
  }

  override decodeString(arr: number[]): string {
    return decode(arr);
  }

  override getEOS(): string {
    return '<|endoftext|>';
  }
}

export class MistralTokenizer extends AbstractTokenizer {
  override encodeString(
    str: string,
    add_bos_token?: boolean,
    add_preceding_space?: boolean,
    log_performance?: boolean,
  ): number[] {
    if (str.endsWith(this.getEOS())) {
      str = str.substring(0, str.length - this.getEOS().length);
      return [
        ...mistralTokenizer.encode(str, add_bos_token, add_preceding_space, log_performance),
        2, // EOS
      ];
    }
    return mistralTokenizer.encode(str, add_bos_token, add_preceding_space, log_performance);
  }

  override decodeString(arr: number[], add_bos_token?: boolean, add_preceding_space?: boolean): string {
    if (arr[arr.length - 1] === 2) {
      arr = arr.slice(0, arr.length - 1);
      return mistralTokenizer.decode(arr, add_bos_token, add_preceding_space) + this.getEOS();
    }
    return mistralTokenizer.decode(arr, add_bos_token, add_preceding_space);
  }

  override getEOS(): string {
    return '</s>';
  }
}

export class LenMLTokenizer extends AbstractTokenizer {
  private tokenizer: {
    encode: (
      str: string,
      options?: { add_special_tokens?: boolean; return_token_type_ids?: boolean; text_pair?: string },
    ) => number[];
    decode: (
      arr: number[],
      options?: { skip_special_tokens?: boolean | undefined; clean_up_tokenization_spaces?: boolean | undefined },
    ) => string;
    eos_token: string | null;
    bos_token: string | null;
  } | null = null;

  private tokenizerPromise: Promise<void>;

  constructor(baseUrl: string) {
    super();
    const sourceUrls = {
      tokenizerJSON: `${baseUrl}/tokenizer.json?download=true`,
      tokenizerConfig: `${baseUrl}/tokenizer_config.json?download=true`,
    };
    this.tokenizerPromise = TokenizerLoader.fromPreTrainedUrls(sourceUrls).then((tokenizer) => {
      this.tokenizer = tokenizer;
    });
  }

  async ready(): Promise<void> {
    return this.tokenizerPromise;
  }

  override encodeString(str: string, add_special_tokens: boolean = true): number[] {
    return (
      this.tokenizer?.encode(str, {
        add_special_tokens,
      }) || []
    );
  }

  override decodeString(
    arr: number[],
    skip_special_tokens: boolean = true,
    clean_up_tokenization_spaces: boolean = true,
  ): string {
    return (
      this.tokenizer?.decode(arr, {
        skip_special_tokens,
        clean_up_tokenization_spaces,
      }) || ''
    );
  }

  override getEOS(): string {
    return this.tokenizer?.eos_token || '';
  }
}
