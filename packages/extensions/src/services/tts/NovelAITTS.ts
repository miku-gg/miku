import axios, { ParamsSerializerOptions } from "axios";
import {
  TTSService,
  TTSServiceConfig,
  TTSServicePropTypes,
} from "./TTSService";
import { InferProps } from "prop-types";

interface NovelAITTSConfig extends TTSServiceConfig {}

export class NovelAITTSService extends TTSService {
  constructor(config: NovelAITTSConfig) {
    super({
      ...config,
      apiEndpoint: "https://api.novelai.net/ai/generate-voice",
    });
  }

  protected override async computeInput(
    input: InferProps<typeof TTSServicePropTypes>,
    tries = 0
  ): Promise<string> {
    const settings = JSON.parse(input.settings!);
    const speakPrompt = settings.readNonSpokenText
      ? input.prompt
      : input.prompt?.replace(/\([^)]*[^)]*\)/g, "");
    const voiceSeed = settings.voiceId || "Anananan"; // default unisex voice seed
    return axios<ArrayBuffer>({
      url: this.apiEndpoint,
      method: "get",
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "User-Agent": "mikugg",
      },
      params: {
        text: speakPrompt,
        seed: voiceSeed,
        opus: false, // mp3 is supported in more browsers
        voice: -1, // always -1 for v2
        version: "v2",
      },
      validateStatus: (status) => status === 200,
    })
      .then((response) => {
        return (
          "data:audio/mpeg;base64," +
          Buffer.from(response.data).toString("base64")
        );
      })
      .catch((err) => {
        console.log("Error: ", err);
        return "";
      });
  }
}
