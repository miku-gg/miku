import * as Core from '@mikugg/core';
import { ServicesNames, EmotionGuidanceServiceInput, EmotionGuidandeServiceOutput } from '../services';

enum EmotionGroupId {
  BASE_EMOTIONS = 'base-emotions',
  LEWD_EMOTIONS = 'lewd-emotions'
}

interface HistoryItem {
  text: string,
  emotion: string,
  pose: string,
  penetrated?: boolean
}

const EMOTION_GROUPS: {
  id: EmotionGroupId,
  defaultEmotion: string,
  emotions: string[],
  poses: string[],
  examples: HistoryItem[]
}[] = [
  {
    id: EmotionGroupId.BASE_EMOTIONS,
    defaultEmotion: 'neutral',
    emotions: ['angry', 'sad', 'happy', 'disgusted', 'begging', 'scared', 'excited', 'hopeful', 'longing', 'proud', 'neutral', 'rage', 'scorn', 'blushed', 'pleasure', 'lustful', 'shocked', 'confused', 'disappointed', 'embarrassed', 'guilty', 'shy', 'frustrated', 'annoyed', 'exhausted', 'tired', 'curious', 'intrigued', 'amused'],
    poses: ['standing'],
    examples: [
      {
        text: `"Yes. I need you to review some documents for me and give me your opinion on them. It's a part of the project that we're working on." *She hands you a pile of papers.* "Can you please go through them and let me know what you think?"`,
        emotion: 'longing',
        pose: 'standing'
      },
      {
        text: `*She looks at you curiously.* "Yes? Is there something on your mind?"`,
        emotion: 'curious',
        pose: 'standing'
      }
    ]
  },
  {
    id: EmotionGroupId.LEWD_EMOTIONS,
    defaultEmotion: 'teasing (POSE: standing)',
    emotions: ['desire', 'pleasure', 'anticipation', 'condescension', 'arousal', 'ecstasy', 'relief', 'release', 'intensity', 'comfort', 'humiliation', 'discomfort', 'submission', 'pain', 'teasing', 'arrogant'],
    poses: ['kneeling', 'cowgirl', 'doggy', 'missionary', 'standing'],
    examples: [
      {
        text: `"Oh, so you think you can handle me? I'm not sure you can. I'm a lot to handle, you know." *She smiles at you.*`,
        emotion: 'teasing',
        pose: 'standing',
        penetrated: false,
      },
      {
        text: `*She moans softly as you touch her.* "Oh, that feels so good. I love it when you touch me like that."`,
        emotion: 'pleasure',
        pose: 'missionary',
        penetrated: false
      },
      {
        text: `*She suddenly grabs his dick and begins to suck with movements up and down*`,
        emotion: 'arrogant',
        pose: 'kneeling',
        penetrated: true
      }
    ]
  }
];


export interface EmotionGuidanceRendererParams {
  serviceEndpoint: string;
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
  protected service: Core.Services.ServiceClient<EmotionGuidanceServiceInput, EmotionGuidandeServiceOutput>;
  protected scene: {
    id: string,
    emotionGroupId: string,
    emotions: {
      id: string,
      hash: string,
    }[]
  };
  private history: HistoryItem[] = []

  constructor(params: EmotionGuidanceRendererParams) {
    super();
    this.scene = params.scene;
    this.service = new Core.Services.ServiceClient<EmotionGuidanceServiceInput, EmotionGuidandeServiceOutput>(
      params.serviceEndpoint,
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

  protected override async handleOutput(output: Core.OutputListeners.DialogOutputEnvironment): Promise<EmotionOutput> {
    const emotionGroup = EMOTION_GROUPS.find((group) => group.id === this.scene.emotionGroupId);
    try {
      if (!emotionGroup) throw new Error(`Emotion group ${this.scene.emotionGroupId} not found`);
      const examplesFromHistory = this.history.filter((item) => emotionGroup.emotions.includes(item.emotion));
  
      const result = await this.service.query({
        emotions: emotionGroup.emotions,
        poses: emotionGroup.poses,
        messages: [
          ...emotionGroup.examples,
          ...examplesFromHistory
        ].reverse().slice(0, 5),
        query: output.text,
      });

      this.history.push({
        text: output.text,
        emotion: result.emotion,
        pose: result.pose,
        penetrated: result.penetrated
      });

      const resultHash = this.scene.emotions.find((emotion) => emotion.id === result.emotion)?.hash || '';

      return {
        ...output,
        sceneId: this.scene.id,
        emotion: result.emotion,
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
}