export const validModels = [ 'davinci', 'gpt3.5-turbo', 'pygmalion-6b', 'llama-30b' ] as const;
export type Model = typeof validModels[number]

export const models: Record<Model, { label: string; price: 'cheap' | 'normal' | 'expensive'; description: string }> = {
  'llama-30b': {
    label: 'LLaMA-30B',
    price: 'expensive',
    description: 'Powerful chat model. Self-hosted, uncensored.',
  },
  'davinci': {
    label: 'Davinci',
    price: 'expensive',
    description: 'An advanced model, capable of understanding complex prompts and generating detailed responses. Censored, cloud hosted.',
  },
  'gpt3.5-turbo': {
    label: 'GPT-3.5 Turbo',
    price: 'normal',
    description: 'A powerful model with a balance of capabilities and affordability. Censored, cloud hosted.',
  },
  'pygmalion-6b': {
    label: 'Pygmalion',
    price: 'cheap',
    description: 'An economical model suitable for simpler tasks and understanding basic prompts. Uses a self-hosted KoboldAI API.',
  }
};
