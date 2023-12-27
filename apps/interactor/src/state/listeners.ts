import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit'
import {
  interactionStart,
  interactionFailure,
  interactionSuccess,
  regenerationStart,
  NarrationResponse,
  continueResponse,
} from './slices/narrationSlice'
import { RootState } from './store'
import textCompletion from '../libs/textCompletion'
import PromptBuilder from '../libs/memory/PromptBuilder'

const interactionEffect = async (
  dispatch: Dispatch,
  state: RootState,
  servicesEndpoint: string
) => {
  try {
    const promptBuilder = new PromptBuilder({
      maxNewTokens: 200,
      strategy: 'roleplay',
      trucationLength: 4096,
    })
    let currentResponseState: NarrationResponse =
      state.narration.responses[state.narration.currentResponseId]!
    const startText =
      Object.values(currentResponseState.characters)[0]?.text || ''
    const completionQuery = promptBuilder.buildPrompt(state)
    const stream = textCompletion({
      ...completionQuery,
      model: state.settings.model,
      serviceBaseUrl: servicesEndpoint,
    })

    for await (const result of stream) {
      result.set('text', startText + (result.get('text') || ''))
      currentResponseState = promptBuilder.completeResponse(
        currentResponseState,
        result
      )
      dispatch(
        interactionSuccess({
          ...currentResponseState,
          completed: false,
        })
      )
    }
    if (!Object.values(currentResponseState.characters)[0]?.text) {
      throw new Error('No text')
    }

    dispatch(
      interactionSuccess({
        ...currentResponseState,
        completed: true,
      })
    )
  } catch (error) {
    console.error(error)
    dispatch(interactionFailure())
  }
}

export const interactionListenerMiddleware = createListenerMiddleware()

interactionListenerMiddleware.startListening({
  actionCreator: interactionStart,
  effect: async (action, listenerApi) => {
    await interactionEffect(
      listenerApi.dispatch,
      listenerApi.getState() as RootState,
      action.payload.servicesEndpoint
    )
  },
})

export const regenerationListenerMiddleware = createListenerMiddleware()

regenerationListenerMiddleware.startListening({
  actionCreator: regenerationStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    await interactionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint
    )
  },
})

export const continueListenerMiddleware = createListenerMiddleware()

continueListenerMiddleware.startListening({
  actionCreator: continueResponse,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    await interactionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint
    )
  },
})
