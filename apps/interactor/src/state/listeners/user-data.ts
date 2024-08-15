import { Dispatch, createListenerMiddleware } from '@reduxjs/toolkit';
import axios from 'axios';
import { userDataFetchEnd, userDataFetchStart } from '../slices/settingsSlice';
import { RootState } from '../store';

const userDataEffect = async (dispatch: Dispatch, state: RootState, apiEndpoint: string) => {
  try {
    const result = await axios.get<{
      sceneSuggestionsLeft: number;
      credits: number;
      tier: string;
      id: string;
      tester: boolean;
    }>(`${apiEndpoint}/user`, {
      withCredentials: true,
    });

    dispatch(
      userDataFetchEnd({
        credits: result.data.credits,
        isPremium: result.data.tier === 'PREMIUM',
        sceneSuggestionsLeft: result.data.sceneSuggestionsLeft,
        isTester: result.data.tester,
      }),
    );
  } catch (error) {
    console.error(error);
    dispatch(
      userDataFetchEnd({
        credits: state.settings.user.credits,
        isPremium: state.settings.user.isPremium,
        sceneSuggestionsLeft: 0,
        isTester: state.settings.user.isTester || false,
      }),
    );
  }
};

export const userDataMiddleware = createListenerMiddleware();

userDataMiddleware.startListening({
  actionCreator: userDataFetchStart,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    await userDataEffect(listenerApi.dispatch, state, action.payload.apiEndpoint);
  },
});
