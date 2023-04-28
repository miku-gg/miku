import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import GPT3Tokenizer from "gpt3-tokenizer";
import axios from "axios";

export interface LLaMaServiceConfig extends Miku.Services.ServiceConfig {
  gradioEndpoint: string;
}

export const LLaMAServicePropTypes = {
  settings: PropTypes.string,
  prompt: PropTypes.string,
  gradioEndpoint: PropTypes.string,
};

export class LLaMAService extends Miku.Services.Service {
  private tokenizer: GPT3Tokenizer;
  private gradioEndpoint: string;
  protected defaultProps: InferProps<typeof LLaMAServicePropTypes> = {
    prompt: "",
    gradioEndpoint: "",
  };

  protected getPropTypes(): PropTypes.ValidationMap<any> {
    return LLaMAServicePropTypes;
  }

  constructor(config: LLaMaServiceConfig) {
    super(config);
    this.gradioEndpoint = config.gradioEndpoint;
    this.tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  }

  protected async computeInput(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<string> {
    const modelSettings = JSON.parse(input.settings);
    if (!modelSettings) return "";
    let gradioEndpoint = this.gradioEndpoint;
    if (input.gradioEndpoint) gradioEndpoint = input.gradioEndpoint;
    const completion = await axios.post<{ results: { text: string }[] }>(
      `${gradioEndpoint}/run/textgen`,
      {
        prompt: input.prompt,
        max_new_tokens: modelSettings.maxTokens,
        do_sample: modelSettings.doSample,
        temperature: modelSettings.temp,
        top_p: modelSettings.topP,
        typical_p: modelSettings.typicalP,
        repetition_penalty: modelSettings.repetitionPenalty,
        top_k: modelSettings.topK,
        min_length: modelSettings.minLength,
        no_repeat_ngram_size: modelSettings.noRepeatNgramSize,
        num_beams: modelSettings.numBeams,
        penalty_alpha: modelSettings.penaltyAlpha,
        length_penalty: modelSettings.lengthPenalty,
        early_stopping: modelSettings.earlyStopping,
        seed: modelSettings.seed,
        add_bos_token: modelSettings.addBosToken,
        truncation_length: modelSettings.truncateLength,
        ban_eos_token: modelSettings.banEosToken,
        skip_special_tokens: modelSettings.skipSpecialTokens,
        stopping_strings: modelSettings.stoppingStrings.split(","),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return (
      (completion?.data?.results[0].text || [""])[0].replace(
        input.prompt,
        ""
      ) || ""
    );
  }

  protected async calculatePrice(
    input: InferProps<typeof this.propTypesRequired>
  ): Promise<number> {
    const modelSettings = JSON.parse(input.settings);
    const gptTokens = this.tokenizer.encode(input.prompt).bpe.length;
    return gptTokens + (modelSettings.maxTokens || 0);
  }
}
