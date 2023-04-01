export const validVoices = [
  'elevenlabs_tts.MF3mGyEYCl7XYWbV9V6O',
  'elevenlabs_tts.EXAVITQu4vr4xnSDxMaL',
  'elevenlabs_tts.21m00Tcm4TlvDq8ikWAM',
  'elevenlabs_tts.TxGEqnHWrfWFTfGW9XjX',
  'elevenlabs_tts.ErXwobaYiN019PkySvjV',
  'azure_tts.en-US-JennyNeural',
  'azure_tts.en-US-AriaNeural',
  'azure_tts.en-US-SaraNeural.whispering',
  'azure_tts.en-GB-SoniaNeural',
  'azure_tts.en-US-JaneNeural.angry',
  'azure_tts.en-US-JaneNeural.excited',
  'azure_tts.en-US-TonyNeural',
  'azure_tts.en-US-DavisNeural'
] as const;
export type Voice = typeof validVoices[number]

export const voices: Record<Voice, { label: string; price: 'cheap' | 'normal' | 'expensive' }> = {
  'elevenlabs_tts.MF3mGyEYCl7XYWbV9V6O': {
    label: 'Elli (ElevenLabs)',
    price: 'expensive',
  },
  'elevenlabs_tts.EXAVITQu4vr4xnSDxMaL': {
    label: 'Bella (ElevenLabs)',
    price: 'expensive',
  },
  'elevenlabs_tts.21m00Tcm4TlvDq8ikWAM': {
    label: 'Rachel (ElevenLabs)',
    price: 'expensive',
  },
  'azure_tts.en-US-JennyNeural': {
    label: 'Jenny (Azure)',
    price: 'cheap',
  },
  'azure_tts.en-US-AriaNeural': {
    label: 'Aria (Azure)',
    price: 'cheap',
  },
  'azure_tts.en-US-SaraNeural.whispering': {
    label: 'Sara (Azure)',
    price: 'cheap'
  },
  'azure_tts.en-GB-SoniaNeural': {
    label: 'Sonia (Azure)',
    price: 'cheap',
  },
  'azure_tts.en-US-JaneNeural.angry': {
    label: 'Jane (Azure)',
    price: 'cheap'
  },
  'azure_tts.en-US-JaneNeural.excited': {
    label: 'Jane (Azure) - Excited',
    price: 'cheap'
  },
  'elevenlabs_tts.TxGEqnHWrfWFTfGW9XjX': {
    label: 'Josh (ElevenLabs)',
    price: 'expensive',
  },
  'elevenlabs_tts.ErXwobaYiN019PkySvjV': {
    label: 'Antoni (ElevenLabs)',
    price: 'expensive',
  },
  'azure_tts.en-US-DavisNeural': {
    label: 'Davis (Azure)',
    price: 'cheap',
  },
  'azure_tts.en-US-TonyNeural': {
    label: 'Tonny (Azure)',
    price: 'cheap',
  }
};