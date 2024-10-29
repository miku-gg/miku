export const DEFAULT_APHRODITE_CONFIG: OpenAIAphroditeConfig = {
  n: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
  repetition_penalty: 1,
  temperature: 1,
  top_p: 1,
  top_k: -1,
  top_a: 0,
  min_p: 0,
  tfs: 1,
  eta_cutoff: 0,
  epsilon_cutoff: 0,
  typical_p: 1,
  mirostat_mode: 0,
  mirostat_tau: 0,
  mirostat_eta: 0,
  use_beam_search: false,
  length_penalty: 1,
  early_stopping: false,
  stop: [],
  ignore_eos: false,
  skip_special_tokens: true,
  spaces_between_special_tokens: true,
};

export interface OpenAIAphroditeConfig {
  /**
   * Number of output sequences to return for the given prompt.
   */
  n?: number;

  /**
   * Number of output sequences that are generated from the prompt.
   * From these `best_of` sequences, the top `n` sequences are returned.
   * `best_of` must be greater than or equal to `n`.
   * By default, `best_of` is set to `n`.
   * This is treated as the beam width when `use_beam_search` is true.
   */
  best_of?: number;

  /**
   * Float that penalizes new tokens based on whether they appear in the
   * generated text so far. Values > 0 encourage the model to use new tokens,
   * while values < 0 encourage the model to repeat tokens.
   */
  presence_penalty?: number;

  /**
   * Float that penalizes new tokens based on their frequency in the
   * generated text so far. Values > 0 encourage the model to use new tokens,
   * while values < 0 encourage the model to repeat tokens.
   */
  frequency_penalty?: number;

  /**
   * Float that penalizes new tokens based on their frequency in the
   * generated text so far. `freq_pen` is applied additively while
   * `rep_pen` is applied multiplicatively. Must be in [1, inf). Set to 1 to disable the effect.
   */
  repetition_penalty?: number;

  /**
   * Float that controls the randomness of the sampling. Lower values make the
   * model more deterministic, while higher values make the model more random.
   * Zero means greedy sampling.
   */
  temperature?: number;

  /**
   * Float that controls the cumulative probability of the top tokens to consider.
   * Must be in (0, 1]. Set to 1 to consider all tokens.
   */
  top_p?: number;

  /**
   * Integer that controls the number of top tokens to consider. Set
   * to -1 to consider all tokens.
   */
  top_k?: number;

  /**
   * Float that controls the cutoff for Top-A sampling.
   * Exact cutoff is top_a*max_prob**2. Must be in [0, inf], 0 to disable.
   */
  top_a?: number;

  /**
   * Float that controls the cutoff for min-p sampling.
   * Exact cutoff is min_p*max_prob. Must be in [0,1], 0 to disable.
   */
  min_p?: number;

  /**
   * Float that controls the cumulative approximate curvature of the
   * distribution to retain for Tail Free Sampling.
   * Must be in (0, 1]. Set to 1 to disable.
   */
  tfs?: number;

  /**
   * Float that controls the cutoff threshold for Eta sampling
   * (a form of entropy adaptive truncation sampling).
   * Threshold is computed as min(eta, sqrt(eta)*entropy(probs)).
   * Specified in units of 1e-4. Set to 0 to disable.
   */
  eta_cutoff?: number;

  /**
   * Float that controls the cutoff threshold for Epsilon sampling
   * (simple probability threshold truncation).
   * Specified in units of 1e-4. Set to 0 to disable.
   */
  epsilon_cutoff?: number;

  /**
   * Float that controls the cumulative probability of tokens
   * closest in surprise to the expected surprise to consider.
   * Must be in (0, 1]. Set to 1 to disable.
   */
  typical_p?: number;

  /**
   * Can either be 0 (disabled) or 2 (Mirostat v2).
   */
  mirostat_mode?: number;

  /**
   * Target "surprisal" that mirostat works towards.
   * Range [0, inf).
   */
  mirostat_tau?: number;

  /**
   * Rate at which mirostat updates its internal surprisal value.
   * Range [0, inf).
   */
  mirostat_eta?: number;

  /**
   * Whether to use beam search instead of sampling.
   */
  use_beam_search?: boolean;

  /**
   * Float that penalizes sequences based on their length.
   * Used in beam search.
   */
  length_penalty?: number;

  /**
   * Controls the stopping condition for beam search. It accepts the following values:
   * `True`, where the generation stops as soon as there are `best_of` complete candidates;
   * `False`, where an heuristic is applied and the generation stops when is it very unlikely
   * to find better candidates;
   * `"never"`, where the beam search procedure only stops when there cannot be better candidates
   * (canonical beam search algorithm).
   */
  early_stopping?: boolean | string;

  /**
   * List of tokens that stop the generation when they are generated.
   * The returned output will contain the stop tokens unless the stop tokens
   * are special tokens.
   */
  stop_token_ids?: number[];

  /**
   * Whether to ignore the EOS token and continue generating tokens after
   * the EOS token is generated.
   */
  ignore_eos?: boolean;

  /**
   * Number of log probabilities to return per output token.
   * Note that the implementation follows the OpenAI API: The return
   * result includes the log probabilities on the `logprobs` most likely
   * tokens, as well the chosen tokens. The API will always return the
   * log probability of the sampled token, so there may be up to
   * `logprobs+1` elements in the response.
   */
  logprobs?: number;

  /**
   * Number of log probabilities to return per prompt token.
   */
  prompt_logprobs?: number;

  /**
   * Whether to skip special tokens in the output. Defaults to true.
   */
  skip_special_tokens?: boolean;

  /**
   * Whether to add spaces between special tokens in the output.
   * Defaults to True.
   */
  spaces_between_special_tokens?: boolean;

  /**
   * Number of tokens to generate on the truncation right of the prompt.
   */
  truncation_length?: number;

  /**
   * List of strings that stop the generation when they are generated.
   * The returned output will not contain the stop strings.
   */
  stop?: string[] | null;

  /**
   * Maximum number of tokens to generate per output sequence.
   */

  max_tokens?: number;

  /**
   * Number of log probabilities to return per output token.
   */
  logit_bias?: Record<string, number>;

  /**
   * XTC Exclude top choices threshold
   */
  xtc_threshold?: number;

  /**
   * XTC Exclude top choices probability
   */
  xtc_probability?: number;
}

export interface OpenAIAphroditeCompletionParams extends OpenAIAphroditeConfig {
  prompt: string;
  model: string;
  stream: boolean;
}
