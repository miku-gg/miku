import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit'
import { userDataFetchEnd, userDataFetchStart } from '../slices/settingsSlice'
import { RootState } from '../store'
import axios from 'axios'

const userDataEffect = async (
  dispatch: Dispatch,
  state: RootState,
  apiEndpoint: string
) => {
  try {
    const result = await axios.get<{
      credits: number
      tier: string
      id: string
    }>(`${apiEndpoint}/user`, {
      withCredentials: true,
    })
    dispatch(
      userDataFetchEnd({
        credits: result.data.credits,
        isPremium: result.data.tier === 'PREMIUM',
      })
    )
  } catch (error) {
    console.error(error)
    dispatch(
      userDataFetchEnd({
        credits: state.settings.user.credits,
        isPremium: state.settings.user.isPremium,
      })
    )
  }
}

export const userDataMiddleware = createListenerMiddleware()

userDataMiddleware.startListening({
  actionCreator: userDataFetchStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    await userDataEffect(
      listenerApi.dispatch,
      state,
      action.payload.apiEndpoint
    )
  },
})
