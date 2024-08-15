export interface TokenLimits {
  green: number;
  red: number;
}

export type TokenLimitsKey =
  | 'CHARACTER_DESCRIPTION'
  | 'CHARACTER_PERSONALITY'
  | 'CHARACTER_REFERENCE_CONVERSATION'
  | 'STARTS_FIRST_MESSAGE'
  | 'SCENE_PROMPT'
  | 'OUTFIT_DESCRIPTION'
  | 'TOTAL';

export const TOKEN_LIMITS: Record<TokenLimitsKey, TokenLimits> = {
  CHARACTER_DESCRIPTION: {
    green: 200,
    red: 400,
  },
  CHARACTER_PERSONALITY: {
    green: 50,
    red: 200,
  },
  CHARACTER_REFERENCE_CONVERSATION: {
    green: 50,
    red: 200,
  },
  STARTS_FIRST_MESSAGE: {
    green: 50,
    red: 200,
  },
  SCENE_PROMPT: {
    green: 200,
    red: 400,
  },
  OUTFIT_DESCRIPTION: {
    green: 200,
    red: 400,
  },
  TOTAL: {
    green: 1000,
    red: 1500,
  },
};
