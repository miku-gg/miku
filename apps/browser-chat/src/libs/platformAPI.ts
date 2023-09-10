import { MikuCard } from '@mikugg/bot-utils';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface APIResponse<T> {
  data: T;
  status: number;
}

export interface ChatMessage {
  id: string,
  text: string,
  isBot: string,
  emotionId: string,
  sceneId: string,
  createdAt: string,
  updatedAt: string,
}

export interface Chat {
  id: string,
  userId: string,
  createdAt: string,
  updatedAt: string,
  lastMemoryTimeStamp: string,
  bot: {
    config: string,
    id: string,
  },
  chatMessages: ChatMessage[],
}

export interface ChatMessageInput {
  text: string,
  isBot: boolean,
  emotionId: string,
  sceneId: string,
}

class PlatformAPIClient {
  private readonly client: AxiosInstance;

  constructor(token?: string) {
    this.client = axios.create({ baseURL: import.meta.env.VITE_PLATFORM_API || '', withCredentials: true });

    if (token) {
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }

  async getBotConfig(configHash: string): Promise<APIResponse<MikuCard>> {
    const response: AxiosResponse<MikuCard> = await this.client.get(`/bot/config/${configHash}`);
    return response;
  }

  async getChat(chatId: string): Promise<APIResponse<Chat>> {
    const response: AxiosResponse<Chat> = await this.client.get(`/chat/${chatId}`);
    return response;
  }

  async createChat(botId: string): Promise<APIResponse<Chat>> {
    const response: AxiosResponse<Chat> = await this.client.post(`/chat`, { botId });
    return response;
  }

  async createChatMessages(chatId: string, firstMessage: ChatMessageInput, secondMessage: ChatMessageInput): Promise<APIResponse<{
    firstMessage: ChatMessage,
    secondMessage: ChatMessage,
  }>> {
    return await this.client.post(`/chat/${chatId}/messages`, { firstMessage, secondMessage });
  }

  async editChatMessage(chatId: string, messageId: string, text: string): Promise<APIResponse<ChatMessage>> {
    return await this.client.put(`/chat/${chatId}/message/${messageId}`, { text });
  }

  async deleteChatMessage(chatId: string, messageId: string): Promise<APIResponse<ChatMessage>> {
    return await this.client.delete(`/chat/${chatId}/message/${messageId}`);
  }
}

export default new PlatformAPIClient();