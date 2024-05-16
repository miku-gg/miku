import * as Guidance from "@mikugg/guidance";
import llama3Tokenizer from "llama3-tokenizer-js";
import { LlamaTokenizer as RawLlamaTokenizer } from "llama-tokenizer-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const solarCustomVocab = fs
  .readFileSync(
    path.join(__dirname, "../data/tokenizers/solar/vocab_base64.txt")
  )
  .toString();
const solarMergesBinary = fs
  .readFileSync(
    path.join(__dirname, "../data/tokenizers/solar/merges_binary.bin")
  )
  .toString();

export enum TokenizerType {
  LLAMA_2 = "LLAMA_2",
  LLAMA_3 = "LLAMA_3",
  MISTRAL = "MISTRAL",
  SOLAR = "SOLAR",
  COHERE = "COHERE",
  WIZARDLM2 = "WIZARDLM2",
}

const solarRawTokenizer = new RawLlamaTokenizer(
  solarCustomVocab,
  solarMergesBinary
);

export class SolarTokenizer extends Guidance.Tokenizer.AbstractTokenizer {
  override encodeString(
    str: string,
    add_bos_token?: boolean,
    add_preceding_space?: boolean,
    log_performance?: boolean
  ): number[] {
    if (str.endsWith(this.getEOS())) {
      str = str.substring(0, str.length - this.getEOS().length);
      return [
        ...solarRawTokenizer.encode(
          str,
          add_bos_token,
          add_preceding_space,
          log_performance
        ),
        2, // EOS
      ];
    }
    return solarRawTokenizer.encode(
      str,
      add_bos_token,
      add_preceding_space,
      log_performance
    );
  }

  override decodeString(
    arr: number[],
    add_bos_token?: boolean,
    add_preceding_space?: boolean
  ): string {
    if (arr[arr.length - 1] === 2) {
      arr = arr.slice(0, arr.length - 1);
      return (
        solarRawTokenizer.decode(arr, add_bos_token, add_preceding_space) +
        this.getEOS()
      );
    }
    return solarRawTokenizer.decode(arr, add_bos_token, add_preceding_space);
  }

  override getEOS(): string {
    return "</s>";
  }
}

export class LLaMA3Tokenizer extends Guidance.Tokenizer.AbstractTokenizer {
  override encodeString(str: string): number[] {
    if (str.startsWith(this.getBOS())) {
      str = str.substring(this.getBOS().length);
    }
    if (str.endsWith(this.getEOS())) {
      str = str.substring(0, str.length - this.getEOS().length);
    }
    let result = llama3Tokenizer.encode(str);
    if (result[result.length - 1] === 128001) {
      result = result.slice(0, result.length - 1);
    }
    return result;
  }

  override decodeString(arr: number[]): string {
    let result = llama3Tokenizer.decode([...arr, 128001]);
    if (result.startsWith(this.getBOS())) {
      result = result.substring(this.getBOS().length);
    }
    if (result.endsWith(this.getEOS())) {
      result = result.substring(0, result.length - this.getEOS().length);
    }
    return result;
  }
  override getEOS(): string {
    return "<|end_of_text|>";
  }

  getBOS(): string {
    return "<|begin_of_text|>";
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
        tokenizers.set(TokenizerType.LLAMA_3, new LLaMA3Tokenizer());
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
        tokenizers.set(TokenizerType.SOLAR, new SolarTokenizer());
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
          new Guidance.Tokenizer.MistralTokenizer()
        );
      }
      return tokenizers.get(TokenizerType.WIZARDLM2);
  }
}
