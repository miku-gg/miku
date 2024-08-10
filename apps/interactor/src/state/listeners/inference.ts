import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit';
import {
  backgroundInferenceEnd,
  backgroundInferenceFailure,
  backgroundInferenceStart,
  backgroundInferenceUpdate,
} from '../slices/creationSlice';
import axios, { AxiosResponse } from 'axios';

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

const inferenceEffect = async (
  dispatch: Dispatch,
  apiEndpoint: string,
  servicesEndpoint: string,
  id: string,
  prompt: string,
) => {
  try {
    const inference: AxiosResponse<string> = await axios.post(
      `${apiEndpoint}/inference`,
      {
        workflowId: 'backgrounds',
        prompt,
        step: 'GEN',
        referenceImageWeight: undefined,
        referenceImageHash: undefined,
        upscaleImageHash: undefined,
        renderedPoseImageHash: undefined,
        emotionIndex: undefined,
        emotion: undefined,
        parentRequestId: undefined,
      },
      {
        withCredentials: true,
      },
    );
    const inferenceId = inference.data;
    dispatch(
      backgroundInferenceUpdate({
        id,
        inferenceId,
        queuePosition: 0,
      }),
    );

    // calls /inferences/statuses every 5 seconds with setTimeout loop
    const checkStatus = async () => {
      try {
        const status: AxiosResponse<{ status: InferenceStatus; inferenceId: string }[]> = await axios.get(
          `${apiEndpoint}/inferences/statuses?inferenceIds[]=${inferenceId}`,
          { withCredentials: true },
        );
        if (status.data.length === 0) {
          throw new Error('Inference not found');
        }
        const inferenceStatus = status.data[0].status;

        if (inferenceStatus.status === 'done') {
          try {
            await axios.post(
              `${apiEndpoint}/inference/migrate-results-to-mikugg`,
              {
                inferenceId,
              },
              {
                withCredentials: true,
              },
            );
            await axios.post(
              `${apiEndpoint}/background`,
              {
                description: prompt,
                sdPrompt: prompt,
                asset: inferenceStatus.result[0],
              },
              {
                withCredentials: true,
              },
            );
          } catch (e) {
            console.error(e);
          }
          dispatch(
            backgroundInferenceEnd({
              id,
              result: inferenceStatus.result[0],
              apiEndpoint,
              servicesEndpoint,
            }),
          );
        } else {
          dispatch(
            backgroundInferenceUpdate({
              id,
              inferenceId,
              queuePosition: inferenceStatus.wait,
            }),
          );
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error(error);
        setTimeout(checkStatus, 5000);
      }
    };
    setTimeout(checkStatus, 1000);
  } catch (error) {
    console.error(error);
    dispatch(backgroundInferenceFailure(id));
  }
};

export const inferenceListenerMiddleware = createListenerMiddleware();

inferenceListenerMiddleware.startListening({
  actionCreator: backgroundInferenceStart,
  effect: async (action, listenerApi) => {
    await inferenceEffect(
      listenerApi.dispatch,
      action.payload.apiEndpoint,
      action.payload.servicesEndpoint,
      action.payload.id,
      action.payload.prompt,
    );
  },
});
