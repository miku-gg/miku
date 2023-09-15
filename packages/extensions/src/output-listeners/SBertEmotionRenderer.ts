import * as Core from '@mikugg/core';
import { ServicesNames, SBertEmotionInterpreterProps, SbertEmotionInterpreterOutput } from '../services';

export interface SBertEmotionRendererParams {
  serviceEndpoint: string;
  signer: Core.Services.ServiceQuerySigner;
  props: SBertEmotionInterpreterProps;
}

export type SBertEmotionRendererOutput = Core.OutputListeners.DialogOutputEnvironment & {emotion: string, imgHash: string, nextContextId: string, shouldContextChange: boolean, audio?: string};


export class SBertEmotionRenderer extends Core.OutputListeners.SimpleListener<SBertEmotionRendererOutput> {
  private props: SBertEmotionInterpreterProps;
  protected service: Core.Services.ServiceClient<SBertEmotionInterpreterProps, SbertEmotionInterpreterOutput>;
  private currentContextId: string;
  public contextIds: string[];

  constructor(params: SBertEmotionRendererParams) {
    super();
    this.props = params.props;
    this.service = new Core.Services.ServiceClient<SBertEmotionInterpreterProps, SbertEmotionInterpreterOutput>(
      params.serviceEndpoint,
      params.signer,
      ServicesNames.SBertEmotionInterpreter
    );
    this.contextIds = params.props.contexts.map((context) => context.id);
    this.currentContextId = params.props.start_context;
  }

  protected override async handleOutput(output: Core.OutputListeners.DialogOutputEnvironment, memory: Core.Memory.ShortTermMemory): Promise<SBertEmotionRendererOutput> {
    try {
      const result = await this.service.query({
        ...this.props,
        botResponse: output.text,
        completePrompt: memory.buildMemoryLinesPrompt(2),
        currentContextId: this.currentContextId,
      }, await this.getCost());

      const context = this.props.contexts.find((context) => context.id === result.contextId)
      if (!context) throw new Error(`Context ${result.contextId} not found`);

      const emotion = context.emotion_images.find((emotion) => emotion.id === result.emotionId);
      if (!emotion) throw new Error(`Emotion ${result.emotionId} not found`);

      return {
        ...output,
        shouldContextChange: result.shouldContextChange,
        nextContextId: result.nextContextId,
        emotion: emotion.id,
        audio: emotion.audio || '',
        imgHash: emotion.hashes[0] || ''
      }
    } catch (e) {
      console.error(e);

      const context = this.props.contexts.find((context) => context.id === this.props.start_context)
      if (!context) throw new Error(`Context ${this.props.start_context} not found`);

      let emotion = context.emotion_images.find((emotion) => emotion.id === 'neutral');
      if (!emotion) emotion =  context.emotion_images[0] || []

      return {
        ...output,
        shouldContextChange: false,
        nextContextId: context.id,
        emotion: 'neutral',
        imgHash: emotion.hashes[0] || ''
      };
    }
  }

  public override async getCost(): Promise<number> {
    return this.service.getQueryCost({
      ...this.props
    });
  }

  public getCurrentContextId(): string {
    return this.currentContextId;
  }

  public setContextId(contextId: string): string {
    return this.currentContextId = contextId;
  }
}