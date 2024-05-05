// import * as transformers from "@xenova/transformers";
import * as Guidance from "@mikugg/guidance";
// import { fileURLToPath } from "url";
// import path, { dirname } from "path";

// import LLAMA_2__TOKENIZER from "../data/tokenizers/llama2/tokenizer.json";
// import LLAMA_2__TOKENIZER_CONFIG from "../data/tokenizers/llama2/tokenizer_config.json" assert { type: "json" };
// import LLAMA_3__TOKENIZER from "../data/tokenizers/llama3/tokenizer.json";
// import LLAMA_3__TOKENIZER_CONFIG from "../data/tokenizers/llama3/tokenizer_config.json" assert { type: "json" };
// import MISTRAL__TOKENIZER from "../data/tokenizers/mistral/tokenizer.json";
// import MISTRAL__TOKENIZER_CONFIG from "../data/tokenizers/mistral/tokenizer_config.json" assert { type: "json" };
// import WIZARDLM2__TOKENIZER from "../data/tokenizers/wizardlm-2/tokenizer.json";
// import WIZARDLM2__TOKENIZER_CONFIG from "../data/tokenizers/wizardlm-2/tokenizer_config.json" assert { type: "json" };
// import SOLAR__TOKENIZER from "../data/tokenizers/solar/tokenizer.json";
// import SOLAR__TOKENIZER_CONFIG from "../data/tokenizers/solar/tokenizer_config.json" assert { type: "json" };
// import COHERE__TOKENIZER from "../data/tokenizers/cohere/tokenizer.json";
// import COHERE__TOKENIZER_CONFIG from "../data/tokenizers/cohere/tokenizer_config.json" assert { type: "json" };

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// transformers.env.localModelPath = path.join(__dirname, "../data/tokenizers");
// transformers.env.allowRemoteModels = false;

export enum TokenizerType {
  LLAMA_2 = "LLAMA_2",
  LLAMA_3 = "LLAMA_3",
  MISTRAL = "MISTRAL",
  SOLAR = "SOLAR",
  COHERE = "COHERE",
  WIZARDLM2 = "WIZARDLM2",
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

export const tokenizers = new Map<
  TokenizerType,
  Guidance.Tokenizer.AbstractTokenizer
>();

export async function loadTokenizer(
  tokenizerType: TokenizerType
): Promise<Guidance.Tokenizer.AbstractTokenizer | undefined> {
  switch (tokenizerType) {
    case TokenizerType.LLAMA_2:
      if (!tokenizers.has(TokenizerType.LLAMA_2)) {
        tokenizers.set(
          TokenizerType.LLAMA_2,
          new Guidance.Tokenizer.LLaMATokenizer()
        );
      }
      return tokenizers.get(TokenizerType.LLAMA_2);
    case TokenizerType.LLAMA_3:
      if (!tokenizers.has(TokenizerType.LLAMA_3)) {
        tokenizers.set(
          TokenizerType.LLAMA_3,
          new Guidance.Tokenizer.LLaMATokenizer()
        );
      }
      return tokenizers.get(TokenizerType.LLAMA_3);
    case TokenizerType.MISTRAL:
      if (!tokenizers.has(TokenizerType.MISTRAL)) {
        tokenizers.set(
          TokenizerType.MISTRAL,
          new Guidance.Tokenizer.MistralTokenizer()
        );
      }
      return tokenizers.get(TokenizerType.MISTRAL);
    case TokenizerType.SOLAR:
      if (!tokenizers.has(TokenizerType.SOLAR)) {
        tokenizers.set(
          TokenizerType.SOLAR,
          new Guidance.Tokenizer.LLaMATokenizer()
        );
      }
      return tokenizers.get(TokenizerType.SOLAR);
    case TokenizerType.COHERE:
      if (!tokenizers.has(TokenizerType.COHERE)) {
        tokenizers.set(
          TokenizerType.COHERE,
          new Guidance.Tokenizer.LLaMATokenizer()
        );
      }
      return tokenizers.get(TokenizerType.COHERE);
    case TokenizerType.WIZARDLM2:
      if (!tokenizers.has(TokenizerType.WIZARDLM2)) {
        tokenizers.set(
          TokenizerType.WIZARDLM2,
          new Guidance.Tokenizer.LLaMATokenizer()
        );
      }
      return tokenizers.get(TokenizerType.WIZARDLM2);
  }
}
