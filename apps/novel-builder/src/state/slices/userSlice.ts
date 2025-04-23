import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { LoggedUser } from '../../libs/imageInferenceAPI';
import { toast } from 'react-toastify';

export interface UserState {
  fetching: boolean;
  user: LoggedUser | null;
  pricing: {
    item: number;
    background: number;
    emotion: number;
    character: number;
    character_upscale: number;
  };
}

export const initialState: UserState = {
  fetching: false,
  user: null,
  pricing: {
    item: 0,
    background: 0,
    emotion: 0,
    character: 0,
    character_upscale: 0,
  },
};

export const fetchUser = createAsyncThunk('user/fetch', async () => {
  const response = await apiClient.getLoggedUser();
  return response.data;
});

export const fetchPrices = createAsyncThunk('user/fetchPrices', async () => {
  const response = await apiClient.getPrices();
  return response.data;
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    consumeCredits: (state, action: PayloadAction<'character' | 'emotion' | 'background' | 'item'>) => {
      if (state.user) {
        if (state.user.credits < state.pricing[action.payload]) {
          toast.error('Not enough credits');
          return;
        } else {
          state.user.credits -= state.pricing[action.payload];
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUser.pending, (state) => {
      state.fetching = true;
    });
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.fetching = false;
      state.user = action.payload;
    });
    builder.addCase(fetchUser.rejected, (state) => {
      state.fetching = false;
      state.user = null;
    });
    builder.addCase(fetchPrices.pending, (state) => {
      state.fetching = true;
    });
    builder.addCase(fetchPrices.fulfilled, (state, action) => {
      state.fetching = false;
      state.pricing = action.payload;
    });
    builder.addCase(fetchPrices.rejected, (state) => {
      state.fetching = false;
      state.pricing = {
        item: 0,
        background: 0,
        emotion: 0,
        character: 0,
        character_upscale: 0,
      };
    });
  },
});

export const { consumeCredits } = userSlice.actions;

export default userSlice.reducer;
