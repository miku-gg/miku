import _Pygmalion6B from './pygmalion-settings/Pygmalion-6B.json';

export interface PygmalionSettings {
	"file_version": number,
	"max_length": number,
	"ikmax": number,
	"genamt": number,
	"ikgen": number,
	"rep_pen": number,
	"rep_pen_slope": number,
	"rep_pen_range": number,
	"temp": number,
	"top_p": number,
	"top_k": number,
	"top_a": number,
	"tfs": number,
	"typical": number,
	"numseqs": number,
	"fp32_model": boolean,
	"modeldim": number,
	"sampler_order": number[]
	"newlinemode": string,
	"lazy_load": boolean,
	"revision": null,
	"selected_preset": string,
	"horde_wait_time": number,
	"horde_queue_position": number,
	"horde_queue_size": number,
	"model": string,
	"model_type": string,
	"url": string,
	"oaiurl": string,
	"oaiengines": string,
	"colaburl": string,
	"apikey": string,
	"oaiapikey": string,
	"configname": string,
	"online_model": string,
	"alt_multi_gen": boolean
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
