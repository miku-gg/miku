import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TokenLimitsKey } from "../../data/tokenLimits";

const initialState: {
  totalTokens: number;
  tokens: Record<TokenLimitsKey, number>;
} = {
  totalTokens: 0,
  tokens: {
    CHARACTER_DESCRIPTION: 0,
    CHARACTER_PERSONALITY: 0,
    CHARACTER_REFERENCE_CONVERSATION: 0
  }
};

const tokensSlice = createSlice({
  name: "tokenization",
  initialState,
  reducers: {
    setTokenByKey: (
      state,
      action: PayloadAction<{ key: TokenLimitsKey; value: number }>
    ) => {
      const newTokens = {
        ...state.tokens,
        [action.payload.key]: action.payload.value
      };
      state.tokens = newTokens;
      state.totalTokens = Object.values(newTokens).reduce(
        (acc, val) => acc + val,
        0
      );
    }
  }
});

export const { setTokenByKey } = tokensSlice.actions;

export default tokensSlice.reducer;
