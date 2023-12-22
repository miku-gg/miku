import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit'
import {
  interactionStart,
  interactionFailure,
  interactionSuccess,
  regenerationStart,
  NarrationResponse,
} from './slices/narrationSlice'
import { RootState } from './store'
import { selectCurrentScene } from './selectors'
import servicesClient, { ModelType } from '../libs/servicesClient'
import PromptBuilder from '../libs/memory/PromptBuilder'

const interactionEffect = async (
  {
    sceneId,
  }: // text,
  {
    sceneId: string
    text: string
  },
  dispatch: Dispatch,
  state: RootState
) => {
  try {
    const promptBuilder = new PromptBuilder({
      maxNewTokens: 200,
      strategy: 'roleplay',
      trucationLength: 4096,
    })
    const currentResponseState: NarrationResponse = {
      id: '',
      selected: false,
      fetching: false,
      parentInteractionId: null,
      suggestedScenes: [],
      characters: {
        ['default']: {
          emotion: '',
          audio: '',
          pose: '',
          text: '',
        },
      },
      childrenInteractions: [],
    }
    const completionQuery = promptBuilder.buildPrompt(state)
    const stream = servicesClient.textCompletion({
      ...completionQuery,
      model: ModelType.RP,
    })

    for await (const result of stream) {
      promptBuilder.completeResponse(currentResponseState, result)
      dispatch(
        interactionSuccess({
          completed: false,
          characters: {
            [sceneId]: {
              emotion: currentResponseState.characters.default?.emotion || '',
              text: currentResponseState.characters.default?.text || '',
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
            emotion: currentResponseState.characters.default?.emotion || '',
            text: currentResponseState.characters.default?.text || '',
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
      listenerApi.dispatch,
      listenerApi.getState() as RootState
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
      listenerApi.dispatch,
      state
    )
  },
})
