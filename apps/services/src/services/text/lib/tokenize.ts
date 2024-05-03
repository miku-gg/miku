import { TokenizerLoader } from "@lenml/tokenizers";
import * as Guidance from "@mikugg/guidance";

import LLAMA_2__TOKENIZER from "../data/tokenizers/llama2/tokenizer.json";
import LLAMA_2__TOKENIZER_CONFIG from "../data/tokenizers/llama2/tokenizer_config.json";
import LLAMA_3__TOKENIZER from "../data/tokenizers/llama3/tokenizer.json";
import LLAMA_3__TOKENIZER_CONFIG from "../data/tokenizers/llama3/tokenizer_config.json";
import MISTRAL__TOKENIZER from "../data/tokenizers/mistral/tokenizer.json";
import MISTRAL__TOKENIZER_CONFIG from "../data/tokenizers/mistral/tokenizer_config.json";
import SOLAR__TOKENIZER from "../data/tokenizers/solar/tokenizer.json";
import SOLAR__TOKENIZER_CONFIG from "../data/tokenizers/solar/tokenizer_config.json";
import COHERE__TOKENIZER from "../data/tokenizers/cohere/tokenizer.json";
import COHERE__TOKENIZER_CONFIG from "../data/tokenizers/cohere/tokenizer_config.json";

export enum TokenizerType {
  LLAMA_2 = "LLAMA_2",
  LLAMA_3 = "LLAMA_3",
  MISTRAL = "MISTRAL",
  SOLAR = "SOLAR",
  COHERE = "COHERE",
}

interface ExternalTokenizerClass {
  encode: (text: string) => number[];
  decode: (tokenIds: number[]) => string;
}

class AdapterTokenizerTokenizer extends Guidance.Tokenizer.AbstractTokenizer {
  private tokenizer: ExternalTokenizerClass;
  private eos: string;
  private bos: string;
  constructor(_tokenizer: ExternalTokenizerClass, _eos: string, _bos: string) {
    super();
    this.tokenizer = _tokenizer;
    // console.log("eos", _eos);
    this.eos = _eos;
    this.bos = _bos;
  }
  override encodeString(str: string): number[] {
    if (str.startsWith(this.getBOS() + " ")) {
      str = str.substring(this.getBOS().length + 1);
    }
    if (str.endsWith(this.getEOS())) {
      str = str.substring(0, str.length - this.getEOS().length);
    }
    return this.tokenizer.encode(str);
  }

  override decodeString(arr: number[]): string {
    let result = this.tokenizer.decode(arr);
    if (result.startsWith(this.getBOS() + " ")) {
      result = result.substring(this.getBOS().length + 1);
    }
    if (result.endsWith(this.getEOS())) {
      result = result.substring(0, result.length - this.getEOS().length);
    }
    return result;
  }
  override getEOS(): string {
    return this.eos;
  }

  getBOS(): string {
    return this.bos;
  }
}

export const tokenizers = new Map<TokenizerType, AdapterTokenizerTokenizer>();

export async function loadTokenizer(
  tokenizerType: TokenizerType
): Promise<AdapterTokenizerTokenizer | undefined> {
  switch (tokenizerType) {
    case TokenizerType.LLAMA_2:
      if (!tokenizers.has(TokenizerType.LLAMA_2)) {
        tokenizers.set(
          TokenizerType.LLAMA_2,
          new AdapterTokenizerTokenizer(
            await TokenizerLoader.fromPreTrained({
              tokenizerJSON: LLAMA_2__TOKENIZER,
              tokenizerConfig: LLAMA_2__TOKENIZER_CONFIG,
            }),
            LLAMA_2__TOKENIZER_CONFIG.eos_token as string,
            LLAMA_2__TOKENIZER_CONFIG.bos_token as string
          )
        );
      }
      return tokenizers.get(TokenizerType.LLAMA_2);
    case TokenizerType.LLAMA_3:
      if (!tokenizers.has(TokenizerType.LLAMA_3)) {
        tokenizers.set(
          TokenizerType.LLAMA_3,
          new AdapterTokenizerTokenizer(
            await TokenizerLoader.fromPreTrained({
              tokenizerJSON: LLAMA_3__TOKENIZER,
              tokenizerConfig: LLAMA_3__TOKENIZER_CONFIG,
            }),
            LLAMA_3__TOKENIZER_CONFIG.eos_token as string,
            LLAMA_3__TOKENIZER_CONFIG.bos_token as string
          )
        );
      }
      return tokenizers.get(TokenizerType.LLAMA_3);
    case TokenizerType.MISTRAL:
      if (!tokenizers.has(TokenizerType.MISTRAL)) {
        tokenizers.set(
          TokenizerType.MISTRAL,
          new AdapterTokenizerTokenizer(
            await TokenizerLoader.fromPreTrained({
              tokenizerJSON: MISTRAL__TOKENIZER,
              tokenizerConfig: MISTRAL__TOKENIZER_CONFIG,
            }),
            MISTRAL__TOKENIZER_CONFIG.eos_token as string,
            MISTRAL__TOKENIZER_CONFIG.bos_token as string
          )
        );
      }
      return tokenizers.get(TokenizerType.MISTRAL);
    case TokenizerType.SOLAR:
      if (!tokenizers.has(TokenizerType.SOLAR)) {
        tokenizers.set(
          TokenizerType.SOLAR,
          new AdapterTokenizerTokenizer(
            await TokenizerLoader.fromPreTrained({
              tokenizerJSON: SOLAR__TOKENIZER,
              tokenizerConfig: SOLAR__TOKENIZER_CONFIG,
            }),
            SOLAR__TOKENIZER_CONFIG.eos_token as string,
            SOLAR__TOKENIZER_CONFIG.bos_token as string
          )
        );
      }
      return tokenizers.get(TokenizerType.SOLAR);
    case TokenizerType.COHERE:
      if (!tokenizers.has(TokenizerType.COHERE)) {
        tokenizers.set(
          TokenizerType.COHERE,
          new AdapterTokenizerTokenizer(
            await TokenizerLoader.fromPreTrained({
              tokenizerJSON: COHERE__TOKENIZER,
              tokenizerConfig: COHERE__TOKENIZER_CONFIG,
            }),
            COHERE__TOKENIZER_CONFIG.eos_token as string,
            COHERE__TOKENIZER_CONFIG.bos_token as string
          )
        );
      }
      return tokenizers.get(TokenizerType.COHERE);
  }
}
