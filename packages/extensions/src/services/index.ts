export * from "./openai/ChatGPTService";
export * from "./openai/OpenAIEmotionInterpreter";
export * from "./pygmalion/PygmalionService";
export * from "./pygmalion/PygmalionSettings";
export * as TTS from "./tts";

export enum ServicesNames {
  ChatGPT = "chatgpt_completer",
  Pygmalion = "pygmalion_completer",
  AzureTTS = "azure_tts",
  ElevenLabsTTS = "elevenlabs_tts",
  NovelAITTS = "novelai_tts",
  GPTShortTermMemory = "gpt_short-memory",
  OpenAIEmotionInterpreter = "openai_emotion-interpreter",
}