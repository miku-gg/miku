import { Colors } from "../Components/ModelTag";

export const validVoices = [
  "azure_tts.en-GB-SoniaNeural",
  "azure_tts.en-US-AriaNeural",
  "azure_tts.en-US-DavisNeural",
  "azure_tts.en-US-JennyNeural",
  "azure_tts.en-US-SaraNeural",
  "azure_tts.en-US-TonyNeural",
  "azure_tts.en-US-SaraNeural.whispering",
  "azure_tts.en-US-JaneNeural.angry",
  "azure_tts.en-US-JaneNeural.excited",
  "elevenlabs_tts.21m00Tcm4TlvDq8ikWAM",
  "elevenlabs_tts.ErXwobaYiN019PkySvjV",
  "elevenlabs_tts.EXAVITQu4vr4xnSDxMaL",
  "elevenlabs_tts.MF3mGyEYCl7XYWbV9V6O",
  "elevenlabs_tts.TxGEqnHWrfWFTfGW9XjX",
] as const;

export type Voice = (typeof validVoices)[number];

export const validServices = ["elevenlabs_tts", "azure_tts"] as const;
export type ValidVoiceServices = (typeof validServices)[number];

export const voices: Record<
  Voice,
  {
    label: string;
    price: "cheap" | "normal" | "expensive";
    service: ValidVoiceServices;
  }
> = {
  "azure_tts.en-GB-SoniaNeural": {
    label: "Sonia (Azure)",
    price: "cheap",
    service: "azure_tts",
  },
  "azure_tts.en-US-AriaNeural": {
    label: "Aria (Azure)",
    price: "cheap",
    service: "azure_tts",
  },
  "azure_tts.en-US-DavisNeural": {
    label: "Davis (Azure)",
    price: "cheap",
    service: "azure_tts",
  },
  "azure_tts.en-US-JennyNeural": {
    label: "Jenny (Azure)",
    price: "cheap",
    service: "azure_tts",
  },
  "azure_tts.en-US-SaraNeural": {
    label: "Sara (Azure)",
    price: "cheap",
    service: "azure_tts",
  },
  "azure_tts.en-US-TonyNeural": {
    label: "Tonny (Azure)",
    price: "cheap",
    service: "azure_tts",
  },
  "azure_tts.en-US-SaraNeural.whispering": {
    label: "Sara (Azure) - Whispering",
    price: "cheap",
    service: "azure_tts",
  },
  "azure_tts.en-US-JaneNeural.angry": {
    label: "Jane (Azure)",
    price: "cheap",
    service: "azure_tts",
  },
  "azure_tts.en-US-JaneNeural.excited": {
    label: "Jane (Azure) - Excited",
    price: "cheap",
    service: "azure_tts",
  },
  "elevenlabs_tts.21m00Tcm4TlvDq8ikWAM": {
    label: "Rachel (ElevenLabs)",
    price: "expensive",
    service: "elevenlabs_tts",
  },
  "elevenlabs_tts.ErXwobaYiN019PkySvjV": {
    label: "Antoni (ElevenLabs)",
    price: "expensive",
    service: "elevenlabs_tts",
  },
  "elevenlabs_tts.EXAVITQu4vr4xnSDxMaL": {
    label: "Bella (ElevenLabs)",
    price: "expensive",
    service: "elevenlabs_tts",
  },
  "elevenlabs_tts.MF3mGyEYCl7XYWbV9V6O": {
    label: "Elli (ElevenLabs)",
    price: "expensive",
    service: "elevenlabs_tts",
  },
  "elevenlabs_tts.TxGEqnHWrfWFTfGW9XjX": {
    label: "Josh (ElevenLabs)",
    price: "expensive",
    service: "elevenlabs_tts",
  },
};

export const voiceServicesColorMap = new Map<ValidVoiceServices, Colors>([
  ["azure_tts", "#9747FF"],
  ["elevenlabs_tts", "#FF4E67"],
]);
