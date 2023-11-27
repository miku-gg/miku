import * as Core from '@mikugg/core';
import { ServicesNames, EmotionGuidanceServiceProps } from '../services';

const EMOTION_GROUPS: {
  id: string,
  defaultEmotion: string,
  emotions: string[],
  examples: { text: string, emotion: string }[]
}[] = [
  {
    id: 'base-emotions',
    defaultEmotion: 'neutral',
    emotions: ['angry', 'sad', 'happy', 'disgusted', 'begging', 'scared', 'excited', 'hopeful', 'longing', 'proud', 'neutral', 'rage', 'scorn', 'blushed', 'pleasure', 'lustful', 'shocked', 'confused', 'disappointed', 'embarrassed', 'guilty', 'shy', 'frustrated', 'annoyed', 'exhausted', 'tired', 'curious', 'intrigued', 'amused'],
    examples: [
      {
        text: `"Yes. I need you to review some documents for me and give me your opinion on them. It's a part of the project that we're working on." *She hands you a pile of papers.* "Can you please go through them and let me know what you think?"`,
        emotion: 'longing'
      },
      {
        text: `*She looks at you curiously.* "Yes? Is there something on your mind?"`,
        emotion: 'curious'
      }
    ]
  },
  {
    id: 'lewd-emotions',
    defaultEmotion: 'submission',
    emotions: ['desire', 'pleasure', 'anticipation', 'condescension', 'arousal', 'ecstasy', 'relief', 'release', 'intensity', 'comfort', 'humiliation', 'discomfort', 'submission', 'pain', 'teasing', 'arrogant'],
    examples: [
      {
        text: `"Oh, so you think you can handle me? I'm not sure you can. I'm a lot to handle, you know." *She smiles at you.*`,
        emotion: 'teasing'
      },
      {
        text: `*She moans softly as you touch her.* "Oh, that feels so good. I love it when you touch me like that."`,
        emotion: 'pleasure'
      }
    ]
  }
];


export interface EmotionGuidanceRendererParams {
  serviceEndpoint: string;
  signer: Core.Services.ServiceQuerySigner;
  scene: {
    id: string,
    emotionGroupId: string,
    emotions: {
      id: string,
      hash: string,
    }[]
  };
}

export type EmotionOutput = Core.OutputListeners.DialogOutputEnvironment & {sceneId: string, emotion: string, imgHash: string, audio?: string};

export class EmotionOutputListener extends Core.OutputListeners.SimpleListener<EmotionOutput> {
  protected service: Core.Services.ServiceClient<EmotionGuidanceServiceProps, string>;
  protected scene: {
    id: string,
    emotionGroupId: string,
    emotions: {
      id: string,
      hash: string,
    }[]
  };

  constructor(params: EmotionGuidanceRendererParams) {
    super();
    this.scene = params.scene;
    this.service = new Core.Services.ServiceClient<EmotionGuidanceServiceProps, string>(
      params.serviceEndpoint,
      params.signer,
      ServicesNames.EmotionGuidance
    );
  }

  public setScene(scene: {
    id: string,
    emotionGroupId: string,
    emotions: {
      id: string,
      hash: string,
    }[]
  }) {
    this.scene = scene;
  }

  protected override async handleOutput(output: Core.OutputListeners.DialogOutputEnvironment, memory: Core.Memory.ShortTermMemory): Promise<EmotionOutput> {
    const emotionGroup = EMOTION_GROUPS.find((group) => group.id === this.scene.emotionGroupId);
    try {
      if (!emotionGroup) throw new Error(`Emotion group ${this.scene.emotionGroupId} not found`);
      
      const resultEmotion = await this.service.query({
        emotions: emotionGroup.emotions,
        messages: emotionGroup.examples,
        query: output.text,
      }, await this.getCost());

      const resultHash = this.scene.emotions.find((emotion) => emotion.id === resultEmotion)?.hash || '';

      return {
        ...output,
        sceneId: this.scene.id,
        emotion: resultEmotion,
        audio: '',
        imgHash: resultHash || ''
      }
    } catch (e) {
      console.error(e);

      return {
        ...output,
        sceneId: this.scene.id,
        emotion: emotionGroup?.defaultEmotion || 'neutral',
        imgHash: this.scene.emotions.find((emotion) => emotion.id === emotionGroup?.defaultEmotion)?.hash || ''
      };
    }
  }

  public override async getCost(): Promise<number> {
    return 0;
  }
}