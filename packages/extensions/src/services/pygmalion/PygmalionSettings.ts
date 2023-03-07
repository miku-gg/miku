import _Pygmalion6B from './pygmalion-settings/Pygmalion-6B.json';

export interface PygmalionSettings {
	"max_context_length": number,
	"max_length": number,
	"rep_pen": number,
	"rep_pen_range": number,
	"rep_pen_slope": number,
	"temperature": number,
	"tfs": number,
	"top_a": number,
	"top_k": number,
	"top_p": number,
	"typical": number,
	"sampler_order": number[]
}

export const pygmalionModels = ['pygmalion-6b'];
export type PygmalionModel = typeof pygmalionModels[number];

export function getPygmalionModelSettings(model: PygmalionModel): PygmalionSettings | null {
	switch (model) {
		case 'pygmalion-6b':
			return _Pygmalion6B;
		default:
			return null;
	}
}
