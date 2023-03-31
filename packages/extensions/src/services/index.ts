export * from "./openai/OpenAIPromptCompleterService";
export * from "./openai/OpenAIEmotionInterpreter";
export * from "./pygmalion/PygmalionService";
export * from "./pygmalion/PygmalionSettings";
export * from "./llama/LLaMAService";
export * from "./llama/LLaMASettings";
export * from "./stt/WhisperService";
export * from "./sbert/SBertEmotionInterpreterService";
export * as TTS from "./tts";

export enum ServicesNames {
  OpenAI = "openai_completer",
  Pygmalion = "pygmalion_completer",
  LLaMA = "llama_completer",
  AzureTTS = "azure_tts",
  ElevenLabsTTS = "elevenlabs_tts",
  NovelAITTS = "novelai_tts",
  GPTShortTermMemory = "gpt_short-memory",
  OpenAIEmotionInterpreter = "openai_emotion-interpreter",
  SBertEmotionInterpreter = "sbert_emotion-interpreter",
  WhisperSTT = "whisper_stt",
}