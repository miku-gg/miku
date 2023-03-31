import _LLaMA_default from './llama-settings/default.json';

export interface LLaMASettings {
	"max_new_tokens": number,
	"do_sample": boolean,
	"temperature": number,
	"top_p": number,
	"typical_p": number,
	"repetition_penalty": number,
	"encoder_repetition_penalty": number,
	"top_k": number,
	"min_length": number,
	"no_repeat_ngram_size": number,
	"num_beams": number,
	"penalty_alpha": number,
	"length_penalty": number,
	"early_stopping": boolean,
	"seed": number
}

export const llamaModels = [
  'llama-7b',
  'llama-13b',
  'llama-30b',
  'llama-65b',
  'alpaca-7b',
  'alpaca-13b',
  'gpt4all-13b',
] as const;
export type LLaMAModel = typeof llamaModels[number];

export function getLLaMAModelSettings(model: LLaMAModel): LLaMASettings | null {
	switch (model) {
		default:
			return _LLaMA_default;
	}
}
