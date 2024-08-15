import { EMOTION_GROUP_TEMPLATES } from '@mikugg/bot-utils';

export type EmotionTemplate = {
  id: string;
  name: string;
  emotionIds: string[];
};

export const emotionTemplates: EmotionTemplate[] = Object.values(EMOTION_GROUP_TEMPLATES).map((template) => ({
  id: template.id,
  name: template.label,
  emotionIds: template.emotionIds,
}));
