export * from "./openai/OpenAIPromptCompleterService";
export * from "./openai/OpenAIEmotionInterpreter";
export * from "./pygmalion/PygmalionService";
export * from "./oobabooga/OobaboogaService";
export * from "./stt/WhisperService";
export * from "./sbert/SBertEmotionInterpreterService";
export * as TTS from "./tts";

export enum ServicesNames {
  OpenAI = "openai_completer",
  Pygmalion = "pygmalion_completer",
  Oobabooga = "oobabooga_completer",
  AzureTTS = "azure_tts",
  ElevenLabsTTS = "elevenlabs_tts",
  NovelAITTS = "novelai_tts",
  GPTShortTermMemory = "gpt_short-memory",
  GPTShortTermMemoryV2 = "gpt_short-memory-v2",
  OpenAIEmotionInterpreter = "openai_emotion-interpreter",
  SBertEmotionInterpreter = "sbert_emotion-interpreter",
  WhisperSTT = "whisper_stt",
  None = "",
}
