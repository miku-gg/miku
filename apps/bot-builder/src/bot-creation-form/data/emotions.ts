
export type EmotionTemplate = {
  id: string;
  name: string;
  emotionIds: string[];
}

export const emotionTemplates: EmotionTemplate[] = [
  {
    id: 'base-emotions',
    name: 'Regular Emotions',
    emotionIds: ['angry', 'sad', 'happy', 'disgusted', 'begging', 'scared', 'excited', 'hopeful', 'longing', 'proud', 'neutral', 'rage', 'scorn', 'blushed', 'pleasure', 'lustful', 'shocked', 'confused', 'disappointed', 'embarrassed', 'guilty', 'shy', 'frustrated', 'annoyed', 'exhausted', 'tired', 'curious', 'intrigued', 'amused'],
  },
  {
    id: 'lewd-emotions',
    name: 'Lewd Emotions',
    emotionIds: ['desire', 'pleasure', 'anticipation', 'condescension', 'arousal', 'ecstasy', 'relief', 'release', 'intensity', 'comfort', 'humiliation', 'discomfort', 'submission', 'pain', 'teasing', 'arrogant'],
  },
];