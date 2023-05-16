export const validModels = [ 'gpt-3.5-turbo', 'pygmalion-6b', 'llama-30b' ] as const;
export type Model = typeof validModels[number]

export const models: Record<Model, { label: string; price: 'cheap' | 'normal' | 'expensive'; description: string }> = {
  'llama-30b': {
    label: 'LLaMA',
    price: 'normal',
    description: 'Any variant of LLaMA running in oobabooga/text-generation-webui. Self hosted.',
  },
  'gpt-3.5-turbo': {
    label: 'GPT-3.5 Turbo',
    price: 'normal',
    description: 'A powerful model with a balance of capabilities and affordability. Censored, cloud hosted.',
  },
  'pygmalion-6b': {
    label: 'Pygmalion 6B (KoboldAI)',
    price: 'cheap',
    description: 'An economical model suitable for simpler tasks and understanding basic prompts. Uses a self-hosted KoboldAI API.',
  }
};
