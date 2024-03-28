import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit'
import {
  backgroundInferenceEnd,
  backgroundInferenceFailure,
  backgroundInferenceStart,
  backgroundInferenceUpdate,
} from '../slices/creationSlice'
import axios, { AxiosResponse } from 'axios'

export interface InferenceStatus {
  status: 'pending' | 'done' | 'error'
  step: {
    id: string
    progress: number
    total: number
  } | null
  wait: number
  result: string[]
}

const inferenceEffect = async (
  dispatch: Dispatch,
  apiEndpont: string,
  id: string,
  prompt: string
) => {
  try {
    const inference: AxiosResponse<string> = await axios.post(
      `${apiEndpont}/inference`,
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
      }
    )
    const inferenceId = inference.data
    dispatch(
      backgroundInferenceUpdate({
        id,
        inferenceId,
        queuePosition: 0,
      })
    )

    // calls /inferences/statuses every 5 seconds with setTimeout loop
    const checkStatus = async () => {
      const status: AxiosResponse<
        { status: InferenceStatus; inferenceId: string }[]
      > = await axios.get(
        `${apiEndpont}/inferences/statuses?inferenceIds[]=${inferenceId}`,
        { withCredentials: true }
      )
      if (status.data.length === 0) {
        throw new Error('Inference not found')
      }
      const inferenceStatus = status.data[0].status

      if (inferenceStatus.status === 'done') {
        try {
          await axios.post(
            `${apiEndpont}/inference/migrate-results-to-mikugg`,
            {
              inferenceId,
            },
            {
              withCredentials: true,
            }
          )
          await axios.post(
            `${apiEndpont}/background`,
            {
              description: prompt,
              sdPrompt: prompt,
              asset: inferenceStatus.result[0],
            },
            {
              withCredentials: true,
            }
          )
        } catch (error) {
          console.error(error)
        }
        dispatch(
          backgroundInferenceEnd({
            id,
            result: inferenceStatus.result[0],
          })
        )
      } else {
        dispatch(
          backgroundInferenceUpdate({
            id,
            inferenceId,
            queuePosition: inferenceStatus.wait,
          })
        )
        setTimeout(checkStatus, 1000)
      }
    }
    setTimeout(checkStatus, 1000)
  } catch (error) {
    console.error(error)
    dispatch(backgroundInferenceFailure(id))
  }
}

export const inferenceListenerMiddleware = createListenerMiddleware()

inferenceListenerMiddleware.startListening({
  actionCreator: backgroundInferenceStart,
  effect: async (action, listenerApi) => {
    await inferenceEffect(
      listenerApi.dispatch,
      action.payload.APIEndpoint,
      action.payload.id,
      action.payload.prompt
    )
  },
})
