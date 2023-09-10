export interface BotReponse {
  loadingText: boolean,
  loadingAudio: boolean,
  loadingEmotion: boolean,
  scene?: string,
  audio: string,
  text: string,
  emotion: string
};

export const responsesStore = new Map<string, BotReponse>();

export const fillResponse = (commandId: string, type?: 'text' | 'audio' | 'emotion' | 'scene', value?: string) => {
  let current = responsesStore.get(commandId);
  if (!current) {
    current = {
      loadingText: true,
      loadingAudio: true,
      loadingEmotion: true,
      audio: '',
      text: '',
      emotion: '',
      scene: '',
    };
  }
  if (!type) {
    responsesStore.set(commandId, current);
  } else {
    const loadingType = `loading${type.charAt(0).toUpperCase()}${type.slice(1)}` as 'loadingText' | 'loadingAudio' | 'loadingEmotion';
    responsesStore.set(commandId, {
      ...current,
      [loadingType]: false,
      [type]: value || '',
    });
  }
}