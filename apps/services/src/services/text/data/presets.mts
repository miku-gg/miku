import { OpenAIAphroditeConfig } from '../lib/aphroditeTokenGenerator.mjs';
import { PresetType } from './rpModelTypes.mjs';

//truncation_length: 4096,

export const presets = new Map<PresetType, OpenAIAphroditeConfig>([
  [
    PresetType.DIVINE_INTELECT,
    {
      n: 1,
      best_of: 1,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      repetition_penalty: 1.17,
      temperature: 1.31,
      top_p: 0.14,
      top_k: 49,
      top_a: 0.52,
      tfs: 1,
      eta_cutoff: 10.42,
      epsilon_cutoff: 1.49,
      typical_p: 1,
      mirostat_mode: 0,
      mirostat_tau: 5.0,
      mirostat_eta: 0.1,
      use_beam_search: false,
      length_penalty: 1.0,
      early_stopping: false,
      stop: ['\n###', '</s>', '<|', '\n#', '\n\n\n'],
      ignore_eos: false,
      skip_special_tokens: true,
      spaces_between_special_tokens: true,
    },
  ],
  [
    PresetType.MINIMAL_WORK,
    {
      n: 1,
      best_of: 1,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      repetition_penalty: 1,
      temperature: 1.2,
      top_p: 1.0,
      min_p: 0.05,
      top_k: 0,
      top_a: 0,
      tfs: 1,
      eta_cutoff: 0,
      epsilon_cutoff: 0,
      typical_p: 1,
      mirostat_mode: 0,
      mirostat_tau: 5.0,
      mirostat_eta: 0.1,
      use_beam_search: false,
      length_penalty: 1.0,
      early_stopping: false,
      stop: ['<|user|>', '<|model|>', '<|system|>'],
      ignore_eos: false,
      skip_special_tokens: true,
      spaces_between_special_tokens: true,
    },
  ],
  [
    PresetType.LLAMA_PRECISE,
    {
      n: 1,
      best_of: 1,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      repetition_penalty: 1.18,
      temperature: 0.7,
      top_p: 0.1,
      top_k: 40,
      top_a: 0,
      tfs: 1,
      eta_cutoff: 0,
      epsilon_cutoff: 0,
      typical_p: 1,
      mirostat_mode: 0,
      mirostat_tau: 5.0,
      mirostat_eta: 0.1,
      use_beam_search: false,
      length_penalty: 1.0,
      early_stopping: false,
      stop: ['\n###', '</s>', '<|', '\n#', '\n\n\n'],
      ignore_eos: false,
      skip_special_tokens: true,
      spaces_between_special_tokens: true,
    },
  ],
  [
    PresetType.STHENO_V3,
    {
      n: 1,
      best_of: 1,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      repetition_penalty: 1.1,
      temperature: 1.17,
      min_p: 0.075,
      top_p: 0.1,
      top_k: 50,
      top_a: 0,
      tfs: 1,
      eta_cutoff: 0,
      epsilon_cutoff: 0,
      typical_p: 1,
      mirostat_mode: 0,
      mirostat_tau: 5.0,
      mirostat_eta: 0.1,
      use_beam_search: false,
      length_penalty: 1.0,
      early_stopping: false,
      stop: ['\n###', '</s>', '<|eot_id|>', '<|end_of_text|>', '<|', '\n#', '\n\n\n'],
      ignore_eos: false,
      skip_special_tokens: true,
      spaces_between_special_tokens: true,
    },
  ],
  [
    PresetType.NEMO,
    {
      n: 1,
      best_of: 1,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      repetition_penalty: 1.08,
      temperature: 0.8,
      min_p: 0.1,
      top_p: 1,
      top_k: 50,
      top_a: 0,
      tfs: 1,
      eta_cutoff: 0,
      epsilon_cutoff: 0,
      typical_p: 1,
      mirostat_mode: 0,
      mirostat_tau: 5.0,
      mirostat_eta: 0.1,
      use_beam_search: false,
      length_penalty: 1.0,
      early_stopping: false,
      stop: ['\n###', '</s>', '[INST]', '[/INST]', '\n#', '\n\n\n'],
      ignore_eos: false,
      skip_special_tokens: true,
      spaces_between_special_tokens: true,
    },
  ],
  [
    PresetType.QWEN3_30B_NO_THINK,
    {
      n: 1,
      best_of: 1,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      repetition_penalty: 1.18,
      temperature: 0.7,
      min_p: 0,
      top_p: 0.8,
      top_k: 20,
      top_a: 0,
      tfs: 1,
      eta_cutoff: 0,
      epsilon_cutoff: 0,
      typical_p: 1,
      mirostat_mode: 0,
      mirostat_tau: 5.0,
      mirostat_eta: 0.1,
      use_beam_search: false,
      length_penalty: 1.0,
      early_stopping: false,
      stop: ['\n###', '</think>', '<|', '\n#', '\n\n\n'],
      ignore_eos: false,
      skip_special_tokens: true,
      spaces_between_special_tokens: true,
    },
  ],
  [
    PresetType.PERSONALITY_ENGINE,
    {
      n: 1,
      best_of: 1,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      repetition_penalty: 1.18,
      temperature: 1,
      min_p: 0,
      top_p: 0.9,
      top_k: 20,
      top_a: 0,
      tfs: 1,
      eta_cutoff: 0,
      epsilon_cutoff: 0,
      typical_p: 1,
      mirostat_mode: 0,
      mirostat_tau: 5.0,
      mirostat_eta: 0.1,
      use_beam_search: false,
      length_penalty: 1.0,
      early_stopping: false,
      stop: ['\n###', '</think>', '<|', '\n#', '\n\n\n'],
      ignore_eos: false,
      skip_special_tokens: true,
      spaces_between_special_tokens: true,
    },
  ],
]);
