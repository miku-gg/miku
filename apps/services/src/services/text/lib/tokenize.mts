import * as Guidance from '@mikugg/guidance';
import llama3Tokenizer from 'llama3-tokenizer-js';
import { LlamaTokenizer as RawLlamaTokenizer } from 'llama-tokenizer-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const solarCustomVocab = fs.readFileSync(path.join(__dirname, '../data/tokenizers/solar/vocab_base64.txt')).toString();
const solarMergesBinary = fs
  .readFileSync(path.join(__dirname, '../data/tokenizers/solar/merges_binary.bin'))
  .toString();

export enum TokenizerType {
  LLAMA_2 = 'LLAMA_2',
  LLAMA_3 = 'LLAMA_3',
  MISTRAL = 'MISTRAL',
  SOLAR = 'SOLAR',
  COHERE = 'COHERE',
  WIZARDLM2 = 'WIZARDLM2',
  NEMO = 'NEMO',
}

const solarRawTokenizer = new RawLlamaTokenizer(solarCustomVocab, solarMergesBinary);

export class SolarTokenizer extends Guidance.Tokenizer.AbstractTokenizer {
  override encodeString(
    str: string,
    add_bos_token?: boolean,
    add_preceding_space?: boolean,
    log_performance?: boolean,
  ): number[] {
    if (str.endsWith(this.getEOS())) {
      str = str.substring(0, str.length - this.getEOS().length);
      return [
        ...solarRawTokenizer.encode(str, add_bos_token, add_preceding_space, log_performance),
        2, // EOS
      ];
    }
    return solarRawTokenizer.encode(str, add_bos_token, add_preceding_space, log_performance);
  }

  override decodeString(arr: number[], add_bos_token?: boolean, add_preceding_space?: boolean): string {
    if (arr[arr.length - 1] === 2) {
      arr = arr.slice(0, arr.length - 1);
      return solarRawTokenizer.decode(arr, add_bos_token, add_preceding_space) + this.getEOS();
    }
    return solarRawTokenizer.decode(arr, add_bos_token, add_preceding_space);
  }

  override getEOS(): string {
    return '</s>';
  }
}

export class NemoTokenizer extends Guidance.Tokenizer.AbstractTokenizer {
  private cache: Map<string, number[]> = new Map<string, number[]>([
    [' Yes', [1, 13830]],
    [' No', [1, 3501]],
    [' angry', [1, 30693]],
    [' sad', [1, 22245]],
    [' happy', [1, 15015]],
    [' disgusted', [1, 44528, 49603]],
    [' begging', [1, 103217]],
    [' scared', [1, 46007]],
    [' excited', [1, 29101]],
    [' hopeful', [1, 107941]],
    [' longing', [1, 2730, 1302]],
    [' proud', [1, 30564]],
    [' neutral', [1, 16318]],
    [' rage', [1, 44368]],
    [' scorn', [1, 2058, 3257]],
    [' blushed', [1, 2326, 12249]],
    [' pleasure', [1, 26765]],
    [' lustful', [1, 85986, 2902]],
    [' shocked', [1, 52186]],
    [' confused', [1, 27166]],
    [' disappointed', [1, 59716]],
    [' embarrassed', [1, 79135]],
    [' guilty', [1, 35600]],
    [' shy', [1, 77490]],
    [' frustrated', [1, 68557]],
    [' annoyed', [1, 90024]],
    [' exhausted', [1, 52200]],
    [' tired', [1, 32772]],
    [' curious', [1, 38462]],
    [' intrigued', [1, 60208, 1286]],
    [' amused', [1, 109231]],
    [' angry', [1, 30693]],
    [' sad', [1, 22245]],
    [' happy', [1, 15015]],
    [' disgusted', [1, 44528, 49603]],
    [' scared', [1, 46007]],
    [' embarrased', [1, 4047, 3638, 2289]],
    [' surprised', [1, 25127]],
    [' neutral', [1, 16318]],
    [' confused', [1, 27166]],
    [' desire', [1, 19147]],
    [' pleasure', [1, 26765]],
    [' anticipation', [1, 70731]],
    [' condescension', [1, 3328, 16078, 4574]],
    [' arousal', [1, 85054]],
    [' ecstasy', [1, 15670, 127073]],
    [' relief', [1, 20081]],
    [' release', [1, 8021]],
    [' intensity', [1, 14208]],
    [' comfort', [1, 15710]],
    [' humiliation', [1, 126531]],
    [' discomfort', [1, 63425]],
    [' submission', [1, 44153]],
    [' pain', [1, 6890]],
    [' teasing', [1, 100116]],
    [' arrogant', [1, 106202]],
  ]);
  private cache2: Map<string, string> = new Map<string, string>([
    ['1,13830', ' Yes'],
    ['1,3501', ' No'],
    ['1,30693', ' angry'],
    ['1,22245', ' sad'],
    ['1,15015', ' happy'],
    ['1,44528,49603', ' disgusted'],
    ['1,103217', ' begging'],
    ['1,46007', ' scared'],
    ['1,29101', ' excited'],
    ['1,107941', ' hopeful'],
    ['1,2730,1302', ' longing'],
    ['1,30564', ' proud'],
    ['1,16318', ' neutral'],
    ['1,44368', ' rage'],
    ['1,2058,3257', ' scorn'],
    ['1,2326,12249', ' blushed'],
    ['1,26765', ' pleasure'],
    ['1,85986,2902', ' lustful'],
    ['1,52186', ' shocked'],
    ['1,27166', ' confused'],
    ['1,59716', ' disappointed'],
    ['1,79135', ' embarrassed'],
    ['1,35600', ' guilty'],
    ['1,77490', ' shy'],
    ['1,68557', ' frustrated'],
    ['1,90024', ' annoyed'],
    ['1,52200', ' exhausted'],
    ['1,32772', ' tired'],
    ['1,38462', ' curious'],
    ['1,60208,1286', ' intrigued'],
    ['1,109231', ' amused'],
    ['1,30693', ' angry'],
    ['1,22245', ' sad'],
    ['1,15015', ' happy'],
    ['1,44528,49603', ' disgusted'],
    ['1,46007', ' scared'],
    ['1,4047,3638,2289', ' embarrased'],
    ['1,25127', ' surprised'],
    ['1,16318', ' neutral'],
    ['1,27166', ' confused'],
    ['1,19147', ' desire'],
    ['1,26765', ' pleasure'],
    ['1,70731', ' anticipation'],
    ['1,3328,16078,4574', ' condescension'],
    ['1,85054', ' arousal'],
    ['1,15670,127073', ' ecstasy'],
    ['1,20081', ' relief'],
    ['1,8021', ' release'],
    ['1,14208', ' intensity'],
    ['1,15710', ' comfort'],
    ['1,126531', ' humiliation'],
    ['1,63425', ' discomfort'],
    ['1,44153', ' submission'],
    ['1,6890', ' pain'],
    ['1,100116', ' teasing'],
    ['1,106202', ' arrogant'],
  ]);

  public name: string = 'nemo';
  override encodeString(
    str: string,
    add_bos_token?: boolean,
    add_preceding_space?: boolean,
    log_performance?: boolean,
  ): number[] {
    return [...(this.cache.get(str) || [])];
  }

  override decodeString(arr: number[], add_bos_token?: boolean, add_preceding_space?: boolean): string {
    const arrString = arr.join(',');
    return this.cache2.get(arrString) || '';
  }

  override getEOS(): string {
    return '</s>';
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
    return '<|end_of_text|>';
  }

  getBOS(): string {
    return '<|begin_of_text|>';
  }
}

export const tokenizers = new Map<TokenizerType, Guidance.Tokenizer.AbstractTokenizer>();

export async function loadTokenizer(
  tokenizerType: TokenizerType,
): Promise<Guidance.Tokenizer.AbstractTokenizer | undefined> {
  switch (tokenizerType) {
    case TokenizerType.LLAMA_2:
      if (!tokenizers.has(TokenizerType.LLAMA_2)) {
        tokenizers.set(TokenizerType.LLAMA_2, new Guidance.Tokenizer.LLaMATokenizer());
      }
      return tokenizers.get(TokenizerType.LLAMA_2);
    case TokenizerType.LLAMA_3:
      if (!tokenizers.has(TokenizerType.LLAMA_3)) {
        tokenizers.set(TokenizerType.LLAMA_3, new LLaMA3Tokenizer());
      }
      return tokenizers.get(TokenizerType.LLAMA_3);
    case TokenizerType.MISTRAL:
      if (!tokenizers.has(TokenizerType.MISTRAL)) {
        tokenizers.set(TokenizerType.MISTRAL, new Guidance.Tokenizer.MistralTokenizer());
      }
      return tokenizers.get(TokenizerType.MISTRAL);
    case TokenizerType.SOLAR:
      if (!tokenizers.has(TokenizerType.SOLAR)) {
        tokenizers.set(TokenizerType.SOLAR, new SolarTokenizer());
      }
      return tokenizers.get(TokenizerType.SOLAR);
    case TokenizerType.NEMO:
      if (!tokenizers.has(TokenizerType.NEMO)) {
        tokenizers.set(TokenizerType.NEMO, new NemoTokenizer());
      }
      return tokenizers.get(TokenizerType.NEMO);
    case TokenizerType.COHERE:
      if (!tokenizers.has(TokenizerType.COHERE)) {
        tokenizers.set(TokenizerType.COHERE, new Guidance.Tokenizer.LLaMATokenizer());
      }
      return tokenizers.get(TokenizerType.COHERE);
    case TokenizerType.WIZARDLM2:
      if (!tokenizers.has(TokenizerType.WIZARDLM2)) {
        tokenizers.set(TokenizerType.WIZARDLM2, new Guidance.Tokenizer.MistralTokenizer());
      }
      return tokenizers.get(TokenizerType.WIZARDLM2);
  }
}
