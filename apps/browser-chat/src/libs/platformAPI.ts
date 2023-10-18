import { MikuCard } from '@mikugg/bot-utils';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface APIResponse<T> {
  data: T;
  status: number;
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
}

export default new PlatformAPIClient();