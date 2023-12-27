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
  servicesEndpoint: string,
  continueResponse?: boolean
) => {
  try {
    const promptBuilder = new PromptBuilder({
      maxNewTokens: 200,
      strategy: 'roleplay',
      trucationLength: 4096,
    })
    let currentResponseState: NarrationResponse =
      state.narration.responses[state.narration.currentResponseId]!
    const completionQuery = promptBuilder.buildPrompt(state, continueResponse)
    const stream = textCompletion({
      ...completionQuery,
      model: state.settings.model,
      serviceBaseUrl: servicesEndpoint,
    })

    const role = Object.keys(currentResponseState.characters)[0]

    const originalResponse = currentResponseState.characters[role]?.text + '\n' // have to store it here or else the text is mangeled later on

    for await (const result of stream) {
      const prompt = promptBuilder.completeResponse(
        currentResponseState,
        result
      )
      if (!result.size) continue
      if (!continueResponse) {
        currentResponseState = prompt
      } else {
        const role = Object.keys(currentResponseState.characters)[0]
        const charResponse = currentResponseState.characters[role]
        if (charResponse) {
          const firstCharacter = {
            text: originalResponse! + prompt.characters[role]?.text,
            emotion:
              Object.values(currentResponseState.characters)[0]?.emotion || '',
            pose: Object.values(currentResponseState.characters)[0]?.pose || '',
          }

          currentResponseState = {
            ...currentResponseState,
            characters: {
              ...currentResponseState.characters,
              [role]: firstCharacter,
            },
          }
        }
      }
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
      action.payload.servicesEndpoint,
      true
    )
  },
})
