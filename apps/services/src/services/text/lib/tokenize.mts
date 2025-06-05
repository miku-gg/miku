import * as Guidance from '@mikugg/guidance';

const FRONTEND_TOKENIZER_DB_URL = process.env.FRONTEND_TOKENIZER_DB_URL || 'http://localhost:5173/tokenizers';

export enum TokenizerType {
  LLAMA3 = 'llama3',
  NEMO = 'nemo',
  DEEPSEEK = 'deepseek',
  QWEN3 = 'qwen3',
  QWQ = 'qwq',
  MISTRAL_SMALL = 'mistral-small',
  LLAMA4 = 'llama4',
  GEMMA3 = 'gemma3',
  CLAUDE = 'claude',
}

class LenMLTokenizer extends Guidance.Tokenizer.LenMLTokenizer {
  override decodeString(
    arr: number[],
    skip_special_tokens: boolean = true,
    clean_up_tokenization_spaces: boolean = true,
  ): string {
    return super.decodeString(arr, false, false);
  }
  override encodeString(str: string, add_special_tokens: boolean = true): number[] {
    return super.encodeString(str, false);
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

export const tokenizers = new Map<TokenizerType, Guidance.Tokenizer.AbstractTokenizer>();

export async function loadTokenizer(tokenizerType: TokenizerType): Promise<void> {
  let tokenizer: Guidance.Tokenizer.AbstractTokenizer;
  switch (tokenizerType) {
    case TokenizerType.LLAMA3:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Llama-3.1`);
      break;
    case TokenizerType.NEMO:
      tokenizer = new NemoTokenizer();
      break;
    case TokenizerType.DEEPSEEK:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/DeepSeek-R1-0528`);
      break;
    case TokenizerType.QWEN3:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Qwen3`);
      break;
    case TokenizerType.QWQ:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/QwQ`);
      break;
    case TokenizerType.MISTRAL_SMALL:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Mistral-Small-24B`);
      break;
    case TokenizerType.LLAMA4:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Llama-4`);
      break;
    case TokenizerType.GEMMA3:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Gemma-3`);
      break;
    case TokenizerType.CLAUDE:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Claude`);
      break;
    default:
      console.error(`Tokenizer ${tokenizerType} not found`);
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Llama-3.1`);
      break;
  }
  tokenizers.set(tokenizerType, tokenizer);
  if (tokenizer instanceof LenMLTokenizer) {
    await tokenizer.ready();
  }
}
