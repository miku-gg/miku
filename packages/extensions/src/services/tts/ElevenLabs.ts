import axios from "axios";
import {
  TTSService,
  TTSServiceConfig,
  TTSServiceInput,
  TTSServiceOutput,
} from "./TTSService";

export class ElevenLabsService extends TTSService {
  constructor(config: TTSServiceConfig) {
    super({
      ...config,
      apiEndpoint:
        config.apiEndpoint || "https://api.elevenlabs.io/v1/text-to-speech",
    });
  }

  protected override async computeInput(
    input: TTSServiceInput
  ): Promise<TTSServiceOutput> {
    const requestUrl = `${this.apiEndpoint}/${input.voiceId}`;
    return axios
      .post<ArrayBuffer>(
        requestUrl,
        {
          text: input.prompt,
        },
        {
          headers: {
            Accept: "audio/mpeg",
            "xi-api-key": input.apiKey || this.apiKey,
          },
          responseType: "arraybuffer",
        }
      )
      .then((response) => {
        return (
          "data:audio/x-wav;base64," +
          Buffer.from(response.data).toString("base64")
        );
      })
      .catch((err) => {
        console.log("Error: ", err);
        return "";
      });
  }
}
