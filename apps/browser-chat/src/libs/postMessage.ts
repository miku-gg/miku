export interface NarrationMessage {
  id: string;
  text: string;
  isBot: boolean;
  emotionId: string;
  audioId: string;
  sceneId: string;
  narrationId: string;
}

export interface Narration {
  id: string;
  botId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  narrationIndex: number;
  narrationMessages: NarrationMessage[];
}


export interface ChatMessageInput {
  text: string,
  isBot: boolean,
  emotionId: string,
  sceneId: string,
  audioId: string,
}

enum IframeEventTypes {
  NEW_CHAT = 'NEW_CHAT',
  UPDATE_CHAT = 'UPDATE_CHAT',
}

interface IframeEvent {
  type: IframeEventTypes;
  payload: any;
}

const postMessage = (type: IframeEventTypes, payload: any) => {
  window.parent.postMessage({ type, payload }, '*');
};

export const newChat = (botId: string, chatId: string, chatMessages: ChatMessageInput[]) => {
  postMessage(IframeEventTypes.NEW_CHAT, { botId, chatId, chatMessages });
}

export const updateChat = (chatId: string, chatMessages: ChatMessageInput[], isNewGeneration: boolean) => {
  postMessage(IframeEventTypes.UPDATE_CHAT, { chatId, chatMessages, isNewGeneration });
}

let chatData: Promise<Narration> = new Promise((resolve, reject) => {
  window.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    if (type === 'CHAT_DATA') {
      resolve(payload as Narration);
    }
  });
});

export const getChat = (): Promise<Narration> => {
  return chatData;
}