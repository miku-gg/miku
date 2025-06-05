export interface InstructTemplate {
  BOS: string;
  SYSTEM_START: string;
  SYSTEM_END: string;
  INPUT_START: string;
  INPUT_END: string;
  OUTPUT_START: string;
  OUTPUT_END: string;
  EOS: string;
  STOPS: string[];
}

export const instructTemplateSlugs = [
  'alpaca',
  'metharme',
  'mistral',
  'vicuna',
  'llama3',
  'chatml',
  'lyra',
  'gemma3',
  'deepseek',
  'danchat2',
] as const;
export type InstructTemplateSlug = (typeof instructTemplateSlugs)[number];
export function isInstructTemplateSlug(slug: string | undefined): slug is InstructTemplateSlug {
  return typeof slug === typeof undefined ? false : (instructTemplateSlugs as readonly string[]).includes(slug!);
}

const templates = new Map<InstructTemplateSlug, InstructTemplate>([
  [
    'alpaca',
    {
      BOS: '',
      SYSTEM_START: '',
      SYSTEM_END: '\n',
      INPUT_START: '### Instruction:\n',
      INPUT_END: '\n',
      OUTPUT_START: '### Response:\n',
      OUTPUT_END: '\n',
      EOS: '',
      STOPS: ['###', '\n\n\n'],
    },
  ],
  [
    'metharme',
    {
      BOS: '',
      SYSTEM_START: '<|system|>',
      SYSTEM_END: '',
      INPUT_START: '<|user|>',
      INPUT_END: '',
      OUTPUT_START: '<|model|>',
      OUTPUT_END: '',
      EOS: '<|end_of_text|>',
      STOPS: ['<|system|>', '<|user|>', '<|model|>', '<|end_of_text|>'],
    },
  ],
  [
    'llama3',
    {
      BOS: '<|begin_of_text|>',
      SYSTEM_START: '<|start_header_id|>system<|end_header_id|>\n',
      SYSTEM_END: '<|eot_id|>\n',
      INPUT_START: '<|start_header_id|>user<|end_header_id|>\n',
      INPUT_END: '<|eot_id|>',
      OUTPUT_START: '<|start_header_id|>assistant<|end_header_id|>\n',
      OUTPUT_END: '<|eot_id|>',
      EOS: '<|end_of_text|>',
      STOPS: ['<|start_header_id|>', '<|end_header_id|>', '<|eot_id|>', '<|end_of_text|>'],
    },
  ],
  [
    'vicuna',
    {
      BOS: '',
      SYSTEM_START: '',
      SYSTEM_END: '',
      INPUT_START: '\nUSER:\n',
      INPUT_END: '',
      OUTPUT_START: '\nASSISTANT:\n',
      OUTPUT_END: '',
      EOS: '</s>',
      STOPS: ['USER:', 'ASSISTANT:', '</s>'],
    },
  ],
  [
    'mistral',
    {
      BOS: '<s>',
      SYSTEM_START: '[INST]',
      SYSTEM_END: '[/INST]',
      INPUT_START: '[INST]',
      INPUT_END: '[/INST]',
      OUTPUT_START: '',
      OUTPUT_END: '</s>',
      EOS: '</s>',
      STOPS: ['INST', '/INST', '<|end_of_text|>', '</s>'],
    },
  ],
  [
    'chatml',
    {
      BOS: '',
      SYSTEM_START: '<|im_start|>system\n',
      SYSTEM_END: '<|im_end|>\n',
      INPUT_START: '<|im_start|>user\n',
      INPUT_END: '<|im_end|>\n',
      OUTPUT_START: '<|im_start|>assistant\n',
      OUTPUT_END: '<|im_end|>\n',
      EOS: '<|end_of_text|>',
      STOPS: ['<|im_start|>', '<|im_end|>', '<|end_of_text|>'],
    },
  ],
  [
    'lyra',
    {
      BOS: '',
      SYSTEM_START: '<|im_start|>system\n',
      SYSTEM_END: '<|im_end|>\n',
      INPUT_START: '<|im_start|>user\n',
      INPUT_END: '<|im_end|>\n',
      OUTPUT_START: '<|im_start|>assistant\n',
      OUTPUT_END: '<|im_end|>\n',
      EOS: '</s>',
      STOPS: ['INST', '/INST', '<|im_end|>', '</s>', '<s>', '<|im_start|>', '<|im_end|>', '<|end_of_text|>'],
    },
  ],
  [
    'gemma3',
    {
      BOS: '<bos>',
      SYSTEM_START: '<start_of_turn>user',
      SYSTEM_END: '<end_of_turn>',
      INPUT_START: '<start_of_turn>user',
      INPUT_END: '<end_of_turn>',
      OUTPUT_START: '<start_of_turn>assistant',
      OUTPUT_END: '<end_of_turn>',
      EOS: '<eos>',
      STOPS: ['<start_of_turn>', '<end_of_turn>', '<bos>', '<eos>'],
    },
  ],
  [
    'deepseek',
    {
      BOS: '',
      SYSTEM_START: '',
      SYSTEM_END: '',
      INPUT_START: '<｜User｜>',
      INPUT_END: '',
      OUTPUT_START: '<｜Assistant｜>',
      OUTPUT_END: '',
      EOS: '',
      STOPS: ['<|', '<｜', '<｜User｜>', '<｜Assistant｜>'],
    },
  ],
  [
    'danchat2',
    {
      BOS: '',
      SYSTEM_START: '<|system|>',
      SYSTEM_END: '<|endoftext|>',
      INPUT_START: '<|user|>',
      INPUT_END: '<|endoftext|>',
      OUTPUT_START: '<|assistant|>',
      OUTPUT_END: '<|endoftext|>',
      EOS: '<|endoftext|>',
      STOPS: ['<|system|>', '<|user|>', '<|assistant|>', '<|endoftext|>'],
    },
  ],
]);

export const getInstructTemplateFromSlug = (slug: InstructTemplateSlug): InstructTemplate => {
  if (!templates.has(slug)) {
    throw new Error(`Invalid instruct template slug: ${slug}`);
  }
  return templates.get(slug)!;
};
