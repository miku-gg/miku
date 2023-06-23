export const voices: {
  label: string;
  provider: 'elevenlabs_tts' | 'azure_tts';
  provider_voice_id: string;
  provider_emotion: string | undefined;
}[] = [
  {
    label: "Sonia (Azure)",
    provider: 'azure_tts',
    provider_voice_id: 'en-GB-SoniaNeural',
    provider_emotion: undefined
  },
  {
    label: "Aria (Azure)",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-AriaNeural',
    provider_emotion: undefined
  },
  {
    label: "Davis (Azure)",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-DavisNeural',
    provider_emotion: undefined
  },
  {
    label: "Jenny (Azure)",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-JennyNeural',
    provider_emotion: undefined
  },
  {
    label: "Sara (Azure)",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-SaraNeural',
    provider_emotion: undefined
  },
  {
    label: "Sara (Azure) - Whispering",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-SaraNeural',
    provider_emotion: 'whispering'
  },
  {
    label: "Tonny (Azure)",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-TonyNeural',
    provider_emotion: undefined
  },
  {
    label: "Jane (Azure)",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-JaneNeural',
    provider_emotion: 'angry'
  },
  {
    label: "Jane (Azure) - Excited",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-JaneNeural',
    provider_emotion: 'excited'
  },
  {
    label: "Rachel (ElevenLabs)",
    provider: 'elevenlabs_tts',
    provider_voice_id: '21m00Tcm4TlvDq8ikWAM',
    provider_emotion: undefined
  },
  {
    label: "Antoni (ElevenLabs)",
    provider: 'elevenlabs_tts',
    provider_voice_id: 'ErXwobaYiN019PkySvjV',
    provider_emotion: undefined
  },
  {
    label: "Bella (ElevenLabs)",
    provider: 'elevenlabs_tts',
    provider_voice_id: 'EXAVITQu4vr4xnSDxMaL',
    provider_emotion: undefined
  },
  {
    label: "Elli (ElevenLabs)",
    provider: 'elevenlabs_tts',
    provider_voice_id: 'MF3mGyEYCl7XYWbV9V6O',
    provider_emotion: undefined
  },
  {
    label: "Josh (ElevenLabs)",
    provider: 'elevenlabs_tts',
    provider_voice_id: 'TxGEqnHWrfWFTfGW9XjX',
    provider_emotion: undefined
  }
]
