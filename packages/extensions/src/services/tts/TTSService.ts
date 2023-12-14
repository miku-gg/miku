import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";

export const TTSServicePropTypes = {
  apiKey: PropTypes.string,
  language: PropTypes.oneOf(["en", "es"]),
  emotion: PropTypes.string,
  prompt: PropTypes.string,
  voiceId: PropTypes.string,
  readNonSpokenText: PropTypes.bool,
  enabled: PropTypes.bool,
};
export type TTSServiceInput = InferProps<typeof TTSServicePropTypes>;
export type TTSServiceOutput = string;

export interface TTSServiceConfig extends Miku.Services.ServiceConfig<TTSServiceInput, TTSServiceOutput> {
  costPerRequest: number;
  apiKey?: string;
  apiEndpoint?: string;
}

export abstract class TTSService extends Miku.Services.Service<TTSServiceInput, TTSServiceOutput> {
  protected costPerRequest: number;
  protected apiKey: string;
  protected apiEndpoint: string;

  constructor(config: TTSServiceConfig) {
    super(config);
    this.apiKey = config.apiKey || "";
    this.apiEndpoint = config.apiEndpoint || "";
    this.costPerRequest = config.costPerRequest;
  }

  protected override getDefaultInput(): TTSServiceInput {
    return {
      apiKey: "",
      language: "en",
      emotion: "default",
      prompt: "",
      voiceId: "",
    };
  }

  protected override getDefaultOutput(): TTSServiceOutput {
    return "";
  }

  protected override validateInput(input: TTSServiceInput): void {
    PropTypes.checkPropTypes(TTSServicePropTypes, input, "input", "TTSService");
  }
}
