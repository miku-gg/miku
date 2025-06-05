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

export class LenMLTokenizer extends Guidance.Tokenizer.LenMLTokenizer {
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

export class Qwen3Tokenizer extends Guidance.Tokenizer.AbstractTokenizer {
  private cache: Map<string, number[]> = new Map<string, number[]>([
    [' Yes', [1, 7414]],
    [' No', [1, 2308]],
    [' angry', [1, 18514]],
    [' sad', [1, 12421]],
    [' happy', [1, 6247]],
    [' disgusted', [1, 90074]],
    [' begging', [1, 59106]],
    [' scared', [1, 26115]],
    [' excited', [1, 12035]],
    [' hopeful', [1, 37550]],
    [' longing', [1, 78322]],
    [' proud', [1, 12409]],
    [' neutral', [1, 20628]],
    [' rage', [1, 32949]],
    [' scorn', [1, 87006]],
    [' blushed', [1, 1501, 51978]],
    [' pleasure', [1, 16656]],
    [' lustful', [1, 40102, 1262]],
    [' shocked', [1, 26620]],
    [' confused', [1, 21815]],
    [' disappointed', [1, 24402]],
    [' embarrassed', [1, 48130]],
    [' guilty', [1, 16007]],
    [' shy', [1, 32294]],
    [' frustrated', [1, 32530]],
    [' annoyed', [1, 56030]],
    [' exhausted', [1, 37919]],
    [' tired', [1, 19227]],
    [' curious', [1, 22208]],
    [' intrigued', [1, 68018]],
    [' amused', [1, 85224]],
    [' angry', [1, 18514]],
    [' sad', [1, 12421]],
    [' happy', [1, 6247]],
    [' disgusted', [1, 90074]],
    [' scared', [1, 26115]],
    [' embarrased', [1, 7967, 1118, 1475]],
    [' surprised', [1, 14453]],
    [' neutral', [1, 20628]],
    [' confused', [1, 21815]],
    [' desire', [1, 12591]],
    [' pleasure', [1, 16656]],
    [' anticipation', [1, 49819]],
    [' condescension', [1, 390, 8614, 2645]],
    [' arousal', [1, 86817]],
    [' ecstasy', [1, 92563]],
    [' relief', [1, 15957]],
    [' release', [1, 4879]],
    [' intensity', [1, 20612]],
    [' comfort', [1, 6838]],
    [' humiliation', [1, 71718]],
    [' discomfort', [1, 43676]],
    [' submission', [1, 20503]],
    [' pain', [1, 6646]],
    [' teasing', [1, 70363]],
    [' arrogant', [1, 65368]],
  ]);
  private cache2: Map<string, string> = new Map<string, string>([
    ['1,7414', ' Yes'],
    ['1,2308', ' No'],
    ['1,18514', ' angry'],
    ['1,12421', ' sad'],
    ['1,6247', ' happy'],
    ['1,90074', ' disgusted'],
    ['1,59106', ' begging'],
    ['1,26115', ' scared'],
    ['1,12035', ' excited'],
    ['1,37550', ' hopeful'],
    ['1,78322', ' longing'],
    ['1,12409', ' proud'],
    ['1,20628', ' neutral'],
    ['1,32949', ' rage'],
    ['1,87006', ' scorn'],
    ['1,1501,51978', ' blushed'],
    ['1,16656', ' pleasure'],
    ['1,40102,1262', ' lustful'],
    ['1,26620', ' shocked'],
    ['1,21815', ' confused'],
    ['1,24402', ' disappointed'],
    ['1,48130', ' embarrassed'],
    ['1,16007', ' guilty'],
    ['1,32294', ' shy'],
    ['1,32530', ' frustrated'],
    ['1,56030', ' annoyed'],
    ['1,37919', ' exhausted'],
    ['1,19227', ' tired'],
    ['1,22208', ' curious'],
    ['1,68018', ' intrigued'],
    ['1,85224', ' amused'],
    ['1,18514', ' angry'],
    ['1,12421', ' sad'],
    ['1,6247', ' happy'],
    ['1,90074', ' disgusted'],
    ['1,26115', ' scared'],
    ['1,7967,1118,1475', ' embarrased'],
    ['1,14453', ' surprised'],
    ['1,20628', ' neutral'],
    ['1,21815', ' confused'],
    ['1,12591', ' desire'],
    ['1,16656', ' pleasure'],
    ['1,49819', ' anticipation'],
    ['1,390,8614,2645', ' condescension'],
    ['1,86817', ' arousal'],
    ['1,92563', ' ecstasy'],
    ['1,15957', ' relief'],
    ['1,4879', ' release'],
    ['1,20612', ' intensity'],
    ['1,6838', ' comfort'],
    ['1,71718', ' humiliation'],
    ['1,43676', ' discomfort'],
    ['1,20503', ' submission'],
    ['1,6646', ' pain'],
    ['1,70363', ' teasing'],
    ['1,65368', ' arrogant'],
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
    return '<|end_of_text|>';
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
      tokenizer = new Qwen3Tokenizer();
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
