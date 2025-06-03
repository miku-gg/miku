import * as Guidance from '@mikugg/guidance';

const FRONTEND_TOKENIZER_DB_URL = process.env.FRONTEND_TOKENIZER_DB_URL || 'https://interactor.miku.gg/tokenizers';

export enum TokenizerType {
  LLAMA31 = 'llama3.1',
  NEMO = 'nemo',
  DEEPSEEK = 'deepseek',
  QWEN3 = 'qwen3',
  QWQ = 'qwq',
  MISTRAL_SMALL = 'mistral-small',
  LLAMA4 = 'llama4',
  GEMMA3 = 'gemma3',
  CLAUDE = 'claude',
}

export const tokenizers = new Map<TokenizerType, Guidance.Tokenizer.AbstractTokenizer>();

export async function loadTokenizer(tokenizerType: TokenizerType): Promise<void> {
  let tokenizer: Guidance.Tokenizer.LenMLTokenizer;
  switch (tokenizerType) {
    case TokenizerType.LLAMA31:
      tokenizer = new Guidance.Tokenizer.LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Llama-3.1`);
      break;
    case TokenizerType.NEMO:
      tokenizer = new Guidance.Tokenizer.LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Mistral-Nemo`);
      break;
    case TokenizerType.DEEPSEEK:
      tokenizer = new Guidance.Tokenizer.LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/DeepSeek-R1-0528`);
      break;
    case TokenizerType.QWEN3:
      tokenizer = new Guidance.Tokenizer.LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Qwen3`);
      break;
    case TokenizerType.QWQ:
      tokenizer = new Guidance.Tokenizer.LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/QwQ`);
      break;
    case TokenizerType.MISTRAL_SMALL:
      tokenizer = new Guidance.Tokenizer.LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Mistral-Small-24B`);
      break;
    case TokenizerType.LLAMA4:
      tokenizer = new Guidance.Tokenizer.LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Llama-4`);
      break;
    case TokenizerType.GEMMA3:
      tokenizer = new Guidance.Tokenizer.LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Gemma-3`);
      break;
    case TokenizerType.CLAUDE:
      tokenizer = new Guidance.Tokenizer.LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Claude`);
      break;
    default:
      console.error(`Tokenizer ${tokenizerType} not found`);
      tokenizer = new Guidance.Tokenizer.LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/Llama-3.1`);
      break;
  }
  tokenizers.set(tokenizerType, tokenizer);
  await tokenizer.ready();
}
