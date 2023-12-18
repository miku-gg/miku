import { createListenerMiddleware } from '@reduxjs/toolkit'
import mockStream, { ResponseState } from './reader.mock'
import {
  interactionStart,
  interactionFailure,
  interactionSuccess,
} from './narrationSlice'

export const interactionListenerMiddleware = createListenerMiddleware()

interactionListenerMiddleware.startListening({
  actionCreator: interactionStart,
  effect: async (action, listenerApi) => {
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

        listenerApi.dispatch(
          interactionSuccess({
            completed: false,
            characters: {
              [action.payload.sceneId]: {
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
      listenerApi.dispatch(
        interactionSuccess({
          completed: true,
          characters: {
            [action.payload.sceneId]: {
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
      listenerApi.dispatch(interactionFailure())
    }
  },
})
