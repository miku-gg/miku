
export type EmotionHashConfig = {
  name: string;
  hash: string;
  emotionIds: string[];
}

export const emotionHashConfigs: EmotionHashConfig[] = [
  {
    name: 'Regular Emotions',
    hash: 'Qmdr5ooTdADLFZA6dCvTE28neq1S7aQwZyma7266weGJZV',
    emotionIds: ['angry', 'sad', 'happy', 'disgusted', 'begging', 'scared', 'excited', 'hopeful', 'longing', 'proud', 'neutral', 'rage', 'scorn', 'blushed', 'pleasure', 'lustful', 'shocked', 'confused', 'disappointed', 'embarrassed', 'guilty', 'shy', 'frustrated', 'annoyed', 'exhausted', 'tired', 'curious', 'intrigued', 'amused'],
  },
  {
    name: 'Lewd Emotions',
    hash: 'QmPNrWHqQJK4Uj1ZsBMTUT6RAPrVRTF6ngdydm8cQZe71C',
    emotionIds: ['desire', 'pleasure', 'anticipation', 'condescension', 'arousal', 'ecstasy', 'relief', 'release', 'intensity', 'comfort', 'humiliation', 'discomfort', 'submission', 'pain', 'teasing', 'arrogant'],
  },
];