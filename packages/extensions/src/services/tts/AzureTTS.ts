import axios from "axios";
import {
  TTSService,
  TTSServiceConfig,
  TTSServicePropTypes,
} from "./TTSService";
import { InferProps } from "prop-types";

interface AzureTTSServiceConfig extends TTSServiceConfig {
  apiKeyEndpoint?: string;
}

export class AzureTTSService extends TTSService {
  private apiKeyEndpoint: string;
  private tempKey: string;

  constructor(config: AzureTTSServiceConfig) {
    super({
      ...config,
      apiEndpoint:
        config.apiEndpoint ||
        "https://westus.tts.speech.microsoft.com/cognitiveservices/v1",
    });
    this.apiKeyEndpoint =
      config.apiKeyEndpoint ||
      "https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken";
    this.tempKey = "";
    this.updateTempKey();
  }

  protected override async computeInput(
    input: InferProps<typeof TTSServicePropTypes>,
    tries = 0
  ): Promise<string> {
    const speakingStyle = input.emotion || "default";
    const langExpression =
      {
        en: "en-US",
        es: "es-CO",
      }[input.language || "en"] || "en-US";

    const tempKey = input.apiKey
      ? await this.getTempKey(input.apiKey)
      : this.tempKey;

    return axios<ArrayBuffer>({
      url: this.apiEndpoint,
      method: "post",
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm",
        Authorization: `Bearer ${tempKey}`,
        "User-Agent": "mikugg",
      },
      data: `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version='1.0' xml:lang='${langExpression}'><voice name='${input.voiceId}'> <mstts:express-as style="${speakingStyle}"> ${input.prompt} </mstts:express-as> </voice></speak>`,
      validateStatus: (status) => status === 200,
    })
      .then((response) => {
        return (
          "data:audio/x-wav;base64," +
          Buffer.from(response.data).toString("base64")
        );
      })
      .catch(async (e) => {
        if (tries > 2) {
          console.error(e);
          return "";
        }
        await this.updateTempKey();
        return this.computeInput(input, tries + 1);
      });
  }

  private async updateTempKey(): Promise<string> {
    const tempKey = await this.getTempKey();
    if (tempKey) this.tempKey = tempKey;
    return this.tempKey;
  }

  private async getTempKey(apiKey = this.apiKey): Promise<string> {
    return axios({
      url: this.apiKeyEndpoint,
      method: "post",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/json",
      },
      data: {},
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return "";
      });
  }
}
