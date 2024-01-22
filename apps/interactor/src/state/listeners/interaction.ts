import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit'
import {
  interactionStart,
  interactionFailure,
  interactionSuccess,
  regenerationStart,
  NarrationResponse,
  continueResponse,
  roleResponseStart,
} from '../slices/narrationSlice'
import { RootState } from '../store'
import textCompletion from '../../libs/textCompletion'
import PromptBuilder from '../../libs/prompts/PromptBuilder'
import { retrieveModelStrategy } from '../../libs/retrieveStrategy'
import { ModelType } from '../versioning'
import { AbstractRoleplayStrategy } from '../../libs/prompts/strategies'
import { getRoleplayStrategyFromSlug } from '../../libs/prompts/strategies/roleplay'
import { selectAllParentDialogues } from '../selectors'

const interactionEffect = async (
  dispatch: Dispatch,
  state: RootState,
  servicesEndpoint: string,
  selectedRole: string
) => {
  try {
    let currentResponseState: NarrationResponse =
      state.narration.responses[state.narration.currentResponseId]!
    const role = selectedRole
    const strategySlug =
      (await retrieveModelStrategy(servicesEndpoint, state.settings.model)) ||
      'alpacarp'
    const maxMessages = selectAllParentDialogues(state).length
    const promptBuilder = new PromptBuilder<AbstractRoleplayStrategy>({
      maxNewTokens: 200,
      strategy: getRoleplayStrategyFromSlug(strategySlug),
      trucationLength:
        state.settings.model === ModelType.RP_SMART ? 8192 : 4096,
    })
    const startText =
      currentResponseState.characters.find(({ role: _role }) => _role == role)
        ?.text || ''
    const completionQuery = promptBuilder.buildPrompt(
      { state, currentRole: role },
      maxMessages
    )
    const stream = textCompletion({
      ...completionQuery,
      model: state.settings.model,
      serviceBaseUrl: servicesEndpoint,
    })

    for await (const result of stream) {
      result.set('text', startText + (result.get('text') || ''))
      currentResponseState = promptBuilder.completeResponse(
        currentResponseState,
        result,
        { state, currentRole: role }
      )
      dispatch(
        interactionSuccess({
          ...currentResponseState,
          completed: false,
        })
      )
    }
    if (
      !currentResponseState.characters.find(({ role: _role }) => _role === role)
        ?.text
    ) {
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
      action.payload.servicesEndpoint,
      action.payload.selectedRole
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
      action.payload.servicesEndpoint,
      action.payload.selectedRole
    )
  },
})

export const continueListenerMiddleware = createListenerMiddleware()

continueListenerMiddleware.startListening({
  actionCreator: continueResponse,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const lastResponseCharacters =
      state.narration.responses[state.narration.currentResponseId]?.characters
    const lastResponseRole =
      lastResponseCharacters?.[lastResponseCharacters.length - 1].role || ''
    await interactionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint,
      lastResponseRole
    )
  },
})

export const roleResponseListenerMiddleware = createListenerMiddleware()

roleResponseListenerMiddleware.startListening({
  actionCreator: roleResponseStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    await interactionEffect(
      listenerApi.dispatch,
      state,
      action.payload.servicesEndpoint,
      action.payload.role
    )
  },
})
