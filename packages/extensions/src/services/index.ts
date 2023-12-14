export * from "./aphrodite/AphroditeService";
export * from "./stt/WhisperService";
export * from "./guidence/EmotionGuidanceService";
export * as TTS from "./tts";

export enum ServicesNames {
  AzureTTS = "azure_tts",
  ElevenLabsTTS = "elevenlabs_tts",
  NovelAITTS = "novelai_tts",
  GPTShortTermMemory = "gpt_short-memory",
  GPTShortTermMemoryV2 = "gpt_short-memory-v2",
  WhisperSTT = "whisper_stt",
  Aphrodite = "aphrodite",
  EmotionGuidance = "emotion_guidance",
  None = "",
}
