import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit'
import mockStream, { ResponseState } from './reader.mock'
import {
  interactionStart,
  interactionFailure,
  interactionSuccess,
  regenerationStart,
} from './narrationSlice'
import { RootState } from './store'
import { selectCurrentScene } from './selectors'

const interactionEffect = async (sceneId: string, dispatch: Dispatch) => {
  try {
    const reader = mockStream().getReader()
    const decoder = new TextDecoder('utf-8')
    let currentResponseState: ResponseState = {
      emotion: '',
      text: '',
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const jsonString = decoder.decode(value)
      currentResponseState = JSON.parse(jsonString)

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

      console.log(currentResponseState) // Logs the current state; replaces the old one
    }

    console.log('Final response state:', currentResponseState)
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
    await interactionEffect(action.payload.sceneId, listenerApi.dispatch)
  },
})

export const regenerationListenerMiddleware = createListenerMiddleware()

regenerationListenerMiddleware.startListening({
  actionCreator: regenerationStart,
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const sceneId = selectCurrentScene(state)?.id || ''
    await interactionEffect(sceneId, listenerApi.dispatch)
  },
})
