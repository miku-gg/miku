import { Request, Response } from 'express';
import axios from 'axios';

const voiceIds = [
  'af_sky+af_bella',
  'af_heart',
  'af_alloy',
  'af_aoede',
  'af_bella',
  'af_jessica',
  'af_kore',
  'af_v0irulan',
  'af_nicole',
  'af_nova',
  'af_river',
  'af_sarah',
  'af_sky',
  'bf_alice',
  'bf_emma',
  'bf_isabella',
  'bf_lily',
  'am_adam',
  'am_echo',
  'am_eric',
  'am_fenrir',
  'am_v0gurney',
  'am_liam',
  'am_michael',
  'am_onyx',
  'am_puck',
  'am_santa',
  'bm_daniel',
  'bm_fable',
  'bm_george',
  'bm_lewis',
  'ef_dora',
  'em_alex',
  'em_santa',
  'ff_siwis',
  'if_sara',
  'im_nicola',
  'jf_alpha',
  'jf_gongitsune',
  'jf_nezumi',
  'jf_tebukuro',
  'jm_kumo',
  'pf_dora',
  'pm_alex',
  'pm_santa',
];
export default async (req: Request, res: Response) => {
  // We'll just use "text" from the request body
  const text = req.body.text;
  let voiceId = req.body.voiceId;
  if (!text) {
    return res.status(400).send('Text is required');
  }
  if (!voiceIds.includes(voiceId)) {
    voiceId = 'af_sky+af_bella';
  }

  try {
    // Example: local endpoint for an OpenAI-compatible service
    const openAiEndpoint = `${process.env.OPENAI_AUDIO_ENDPOINT}/audio/speech`;

    // Use "af_bella" and "kokoro" for model
    const response = await axios.post(
      openAiEndpoint,
      {
        model: 'kokoro',
        voice: voiceId,
        response_format: 'mp3',
        input: text,
      },
      {
        responseType: 'stream',
      },
    );

    // Set the correct content type header for MP3
    res.setHeader('Content-Type', 'audio/mpeg');

    // Pipe the streaming audio response back to the client
    response.data.pipe(res);
  } catch (error) {
    console.error('Error calling OpenAI-like text to speech:', error);
    res.status(500).send('Error processing text to speech');
  }
};
