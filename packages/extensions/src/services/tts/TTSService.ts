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

export interface TTSServiceConfig extends Miku.Services.ServiceConfig {
  costPerRequest: number;
  apiKey?: string;
  apiEndpoint?: string;
}

export abstract class TTSService extends Miku.Services.Service {
  protected defaultProps: InferProps<typeof TTSServicePropTypes> = {
    apiKey: "",
    language: "en",
    emotion: "default",
    prompt: "",
    voiceId: "",
  };
  protected costPerRequest: number;
  protected apiKey: string;
  protected apiEndpoint: string;

  constructor(config: TTSServiceConfig) {
    super(config);
    this.apiKey = config.apiKey || "";
    this.apiEndpoint = config.apiEndpoint || "";
    this.costPerRequest = config.costPerRequest;
  }

  protected override getPropTypes(): PropTypes.ValidationMap<any> {
    return TTSServicePropTypes;
  }

  protected override async calculatePrice(
    input: PropTypes.InferProps<PropTypes.ValidationMap<any>>
  ): Promise<number> {
    return this.costPerRequest;
  }
}
