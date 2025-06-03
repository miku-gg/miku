import * as Guidance from '@mikugg/guidance';

const FRONTEND_TOKENIZER_DB_URL = process.env.FRONTEND_TOKENIZER_DB_URL || 'https://interactor.miku.gg/tokenizers';

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
}

export const tokenizers = new Map<TokenizerType, Guidance.Tokenizer.AbstractTokenizer>();

export async function loadTokenizer(tokenizerType: TokenizerType): Promise<void> {
  let tokenizer: Guidance.Tokenizer.LenMLTokenizer;
  switch (tokenizerType) {
    case TokenizerType.LLAMA3:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Llama-3.1`);
      break;
    case TokenizerType.NEMO:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Mistral-Nemo`);
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
  await tokenizer.ready();
}
