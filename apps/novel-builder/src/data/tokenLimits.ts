export interface TokenLimits {
  green: number;
  red: number;
}

export type TokenLimitsKey =
  | "CHARACTER_DESCRIPTION"
  | "CHARACTER_PERSONALITY"
  | "CHARACTER_REFERENCE_CONVERSATION";

export const TOKEN_LIMITS: Record<TokenLimitsKey, TokenLimits> = {
  CHARACTER_DESCRIPTION: {
    green: 200,
    red: 400
  },
  CHARACTER_PERSONALITY: {
    green: 50,
    red: 100
  },
  CHARACTER_REFERENCE_CONVERSATION: {
    green: 50,
    red: 100
  }
};
