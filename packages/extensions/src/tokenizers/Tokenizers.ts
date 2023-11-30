// Import external tokenizer libraries
import _GPT3Tokenizer from "gpt3-tokenizer";
import * as Guidance from "@mikugg/guidance";

const gptTokenizer = new _GPT3Tokenizer({ type: 'gpt3' });
const llamaTokenizer = new Guidance.Tokenizer.LLaMATokenizer();

abstract class Tokenizer {
  abstract tokenCount(text: string): number;
}

class GPT3Tokenizer extends Tokenizer {
  tokenCount(text: string): number {
    return gptTokenizer.encode(text).bpe.length;
  }
}

class LLaMATokenizer extends Tokenizer {
  tokenCount(text: string): number {
    return llamaTokenizer.encodeString(text).length;
  }
}

export enum TokenizerType {
  GPT3 = 'gpt3',
  LLAMA = 'llama',
}


export class TokenizerFactory {
  static createTokenizer(type: TokenizerType): Tokenizer {
    switch (type) {
      case TokenizerType.GPT3:
        return new GPT3Tokenizer();
      case TokenizerType.LLAMA:
        return new LLaMATokenizer();
      default:
        throw new Error(`Unknown tokenizer type: ${type}`);
    }
  }
}

export function tokenCount(prompt: string, type: TokenizerType): number {
  return TokenizerFactory.createTokenizer(type).tokenCount(prompt);
}