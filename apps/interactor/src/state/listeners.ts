import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit'
import { ResponseState } from './reader.mock'
import {
  interactionStart,
  interactionFailure,
  interactionSuccess,
  regenerationStart,
} from './slices/narrationSlice'
import { RootState } from './store'
import { selectCurrentScene } from './selectors'
import servicesClient, { ModelType } from '../libs/servicesClient'

const interactionEffect = async (
  {
    sceneId,
    text,
  }: {
    sceneId: string
    text: string
  },
  dispatch: Dispatch
) => {
  try {
    const currentResponseState: ResponseState = {
      emotion: 'angry',
      text: '',
    }
    const stream = servicesClient.textCompletion({
      template: `Anon: ${text}\nAqua:{{GEN text max_tokens=100}}`,
      model: ModelType.RP,
      variables: {},
    })

    for await (const result of stream) {
      currentResponseState.text =
        result.get('text') || currentResponseState.text
      dispatch(
        interactionSuccess({
          completed: false,
          characters: {
            [sceneId]: {
              emotion: currentResponseState.emotion,
              text: currentResponseState.text,
              audio: '',
              pose: 'standing',
            },
          },
          suggestedScenes: [],
        })
      )
    }

    dispatch(
      interactionSuccess({
        completed: true,
        characters: {
          [sceneId]: {
            emotion: currentResponseState.emotion,
            text: currentResponseState.text,
            audio: '',
            pose: 'standing',
          },
        },
        suggestedScenes: [],
      })
    )
  } catch (error) {
    dispatch(interactionFailure())
  }
}

export const interactionListenerMiddleware = createListenerMiddleware()

interactionListenerMiddleware.startListening({
  actionCreator: interactionStart,
  effect: async (action, listenerApi) => {
    await interactionEffect(
      {
        sceneId: action.payload.sceneId,
        text: action.payload.text,
      },
      listenerApi.dispatch
    )
  },
})

export const regenerationListenerMiddleware = createListenerMiddleware()

regenerationListenerMiddleware.startListening({
  actionCreator: regenerationStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const sceneId = selectCurrentScene(state)?.id || ''
    const parentInteractionId =
      state.narration.responses[state.narration.currentResponseId]
        ?.parentInteractionId || ''
    const parentQuery =
      state.narration.interactions[parentInteractionId]?.query || ''
    await interactionEffect(
      {
        sceneId,
        text: parentQuery,
      },
      listenerApi.dispatch
    )
  },
})
