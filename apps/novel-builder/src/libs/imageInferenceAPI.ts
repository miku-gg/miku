import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import config from '../config';

export interface APIResponse<T> {
  data: T;
  status: number;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  profilePic: string | null;
  lastSeen: Date;
  licenseKey: string | null;
  tier: 'REGULAR' | 'PREMIUM';
  role: 'USER' | 'ADMIN' | 'BOT_PUBLISHER' | 'SERVICE_PROVIDER';
}

export interface LoggedUser extends PublicUser {
  credits: number;
  email: string;
  language: string;
  languages: string[];
  nsfwEnabled: boolean;
  storeLogs: boolean;
  createdAt: Date;
  freeTTS: boolean;
  freeSmart: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  preview_image: string;
}

export interface InferenceQuery {
  workflowId: string;
  prompt: string;
  step: 'GEN' | 'UPSCALE' | 'EMOTION';
  referenceImageWeight?: number;
  referenceImageHash?: string;
  upscaleImageHash?: string;
  renderedPoseImageHash?: string;
  emotionIndex?: number;
  emotion?: string;
  parentRequestId?: string;
  openposeImageHash?: string;
  seed: string;
  modelToUse: number;
  headPrompt?: string;
}

export interface InferenceStatus {
  status: 'pending' | 'done' | 'error';
  step: {
    id: string;
    progress: number;
    total: number;
  } | null;
  wait: number;
  result: string[];
}

export interface InferenceRequest {
  id: string;
  workflowId: string;
  step: 'GEN' | 'UPSCALE' | 'EMOTION';
  prompt: string;
  referenceImageWeight: number | null;
  referenceImageHash: string | null;
  upscaleImageHash: string | null;
  renderedPoseImageHash: string | null;
  emotion: string | null;
  emotionIndex: number | null;
  seed: string;
  modelToUse: number;
  createdAt: Date;
  updatedAt: Date;
  result: string[];
  completed: boolean;
  userId: string;
  isPublic: boolean;
  parentRequestId: string | null;
  childRequests?: InferenceRequest[];
}

class APIClient {
  private readonly client: AxiosInstance;

  constructor(baseURL: string, token?: string) {
    this.client = axios.create({ baseURL, withCredentials: true });

    if (token) {
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }

  async getLoggedUser(): Promise<APIResponse<LoggedUser>> {
    const response: AxiosResponse<LoggedUser> = await this.client.get('/user');
    return response;
  }

  async getCharacterInferences({ take = 20, skip = 0 }: { take?: number; skip?: number }): Promise<
    APIResponse<{
      inferences: {
        characterInference: InferenceRequest;
        upscaleInference?: InferenceRequest;
      }[];
      count: number;
    }>
  > {
    const response: AxiosResponse<{
      inferences: (InferenceRequest & { childRequests: InferenceRequest[] })[];
      count: number;
    }> = await this.client.get('/inferences/character', {
      params: {
        take,
        skip,
      },
    });
    return {
      data: {
        inferences: response.data.inferences.map((inference) => ({
          characterInference: inference,
          upscaleInference: inference.childRequests.find((child) => child.step === 'UPSCALE'),
        })),
        count: response.data.count,
      },
      status: response.status,
    };
  }

  async getPrices(): Promise<
    APIResponse<{
      item: number;
      background: number;
      emotion: number;
      character: number;
      character_upscale: number;
    }>
  > {
    const response: AxiosResponse<{
      item: number;
      background: number;
      emotion: number;
      character: number;
      character_upscale: number;
    }> = await this.client.get('inference/prices');
    return response;
  }

  async getWorkflows(): Promise<APIResponse<Workflow[]>> {
    const response: AxiosResponse<Workflow[]> = await this.client.get('/inference/workflows');
    return response;
  }

  async uploadImageToWizardAssets(image: File): Promise<APIResponse<{ image_hash: string }>> {
    if (image.size > 2200000) {
      toast.error('Image size is too large, max 2MB');
      throw new Error('Image size is too large, max 2MB');
    }

    const formData = new FormData();
    formData.append('image', image);
    const response: AxiosResponse<{ image_hash: string }> = await this.client.post('/inference/image', formData);
    return response;
  }

  async retrieveMultipleInferences(
    inferenceIds: string[],
  ): Promise<APIResponse<{ status: InferenceStatus; inferenceId: string }[]>> {
    const response = await this.client.get<{ status: InferenceStatus; inferenceId: string }[]>('/inferences/statuses', {
      params: { inferenceIds },
    });
    return response;
  }

  async getGenInferences({
    take = 20,
    skip = 0,
  }: {
    take?: number;
    skip?: number;
  }): Promise<APIResponse<InferenceRequest[]>> {
    const response: AxiosResponse<InferenceRequest[]> = await this.client.get('/inferences/gen', {
      params: {
        take,
        skip,
      },
    });

    return response;
  }

  async getOnlyEmotionInferences({
    take = 20,
    skip = 0,
    referenceImageHash,
  }: {
    take?: number;
    skip?: number;
    referenceImageHash?: string;
  }): Promise<APIResponse<InferenceRequest[]>> {
    const response = this.client.get<InferenceRequest[]>('/inferences/emotions', {
      params: {
        take,
        skip,
        referenceImageHash,
      },
    });

    return response;
  }

  async getOutfitInferences({
    take = 20,
    skip = 0,
    referenceImageHash,
  }: {
    take?: number;
    skip?: number;
    referenceImageHash?: string;
  }): Promise<APIResponse<InferenceRequest[]>> {
    const response = this.client.get<InferenceRequest[]>('/inferences/gen', {
      params: {
        take,
        skip,
        workflowId: 'outfit_change',
        referenceImageHash,
      },
    });

    return response;
  }

  async getOnlyEmotionGroups({
    take,
    skip,
  }: {
    take?: number;
    skip?: number;
  }): Promise<APIResponse<{ referenceImageHash: string; count: number }[]>> {
    const response = this.client.get<{ referenceImageHash: string; count: number }[]>('/inferences/emotion-groups', {
      params: {
        take,
        skip,
      },
    });

    return response;
  }

  async getOutfitInferencesGroups({
    take,
    skip,
  }: {
    take?: number;
    skip?: number;
  }): Promise<APIResponse<{ referenceImageHash: string; count: number }[]>> {
    const response = this.client.get<{ referenceImageHash: string; count: number }[]>('/inferences/outfit-groups', {
      params: {
        take,
        skip,
      },
    });

    return response;
  }

  async startInference(params: InferenceQuery): Promise<APIResponse<string>> {
    try {
      const response: AxiosResponse<string> = await this.client.post('/inference', {
        workflowId: params.workflowId,
        prompt: params.prompt,
        step: params.step,
        referenceImageWeight: params.referenceImageWeight,
        referenceImageHash: params.referenceImageHash,
        upscaleImageHash: params.upscaleImageHash,
        renderedPoseImageHash: params.renderedPoseImageHash,
        emotionIndex: params.emotionIndex,
        emotion: params.emotion,
        parentRequestId: params.parentRequestId,
        openposeImageHash: params.openposeImageHash,
        seed: params.seed,
        modelToUse: params.modelToUse,
        headPrompt: params.headPrompt,
      });

      return response;
    } catch (_e) {
      const axiosError = _e as AxiosError;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      toast.error(axiosError.response?.data?.message || 'Error');
      throw _e;
    }
  }

  async cancelInference(inferenceId: string): Promise<APIResponse<void>> {
    return this.client.delete(`/inference/${inferenceId}`);
  }

  async login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<APIResponse<{ userId: number }>> {
    const response: AxiosResponse<{ userId: number }> = await this.client.post('/auth/signin', { username, password });
    return response;
  }

  async logout(): Promise<void> {
    await this.client.post('/logout', {});
  }

  async claimReward(): Promise<AxiosResponse<{ success: boolean; message: string }>> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.client.post('/user/claim');
    return response;
  }

  async claimLicense(licenseKey: string): Promise<AxiosResponse<{ success: boolean; message: string }>> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.client.post(
      '/user/claim-inference-license',
      {
        licenseKey,
      },
    );
    return response;
  }

  async migrateInferenceToAssets(inferenceId: string): Promise<APIResponse<string>> {
    const response: AxiosResponse<string> = await this.client.post(`/inference/migrate-results-to-mikugg`, {
      inferenceId,
    });
    return response;
  }
}

export default new APIClient(config.platformAPIEndpoint);

// start inference example
// const inference = await apiClient.startInference({
//   prompt: 'a girl with blue hair and a pink dress',
//   workflowId: 'character_pose',
//   referenceImageWeight: 0,
//   referenceImageHash: null,
//   step: 'GEN',
//   openposeImageHash: 'pose2.jpg',
// });
