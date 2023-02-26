import PropTypes, { InferProps } from 'prop-types';
import * as Core from '@mikugg/core';
import { Emotion, EmotionInterpreterOutput, EmotionInterpreterPropTypes, EmotionInterpreterProps } from '../services';

export interface EmotionRendererParams {
  serviceEndpoint: string;
  signer: Core.Services.ServiceQuerySigner;
  props: InferProps<typeof EmotionInterpreterPropTypes>;
}

export type EmotionRendererOutput = Core.OutputListeners.DialogOutputEnvironment & {emotion: string, imgHash: string};

export class EmotionRenderer extends Core.OutputListeners.SimpleListener<EmotionRendererOutput> {
  private props: InferProps<typeof EmotionInterpreterPropTypes>
protected service: Core.Services.ServiceClient<EmotionInterpreterProps, EmotionInterpreterOutput>;

  constructor(params: EmotionRendererParams) {
    super();
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<EmotionInterpreterProps, EmotionInterpreterOutput>(params.serviceEndpoint, params.signer);
  }

  protected override async handleOutput(output: Core.OutputListeners.DialogOutputEnvironment): Promise<EmotionRendererOutput> {
    try {
      const result = await this.service.query({
        prompt: output.text,
        openai_key: this.props.openai_key || '',
        emotionConfigHash: this.props.emotionConfigHash || '',
      }, await this.getCost());

      if (!result.success) throw result.error;

      return {
        ...output,
        emotion: result.emotion,
        imgHash: this.props.images ? this.props.images[result.emotion] || this.props.images["neutral"] || '' : ''
      }
    } catch (e) {
      console.error(e);
      return {
        ...output,
        emotion: 'neutral',
        imgHash: this.props.images ? this.props.images['neutral'] || '' : ''
      };
    }
  }

  public override async getCost(): Promise<number> {
    return this.service.getQueryCost({
      emotionConfigHash: this.props.emotionConfigHash || '',
      prompt: ''
    });
  }
}