import { Request, Response } from 'express';
import axios from 'axios';

const voiceIds = [
  'af_bella',
  'af_irulan',
  'af_nicole',
  'af_sarah',
  'af_sky',
  'af_sky_af_bella',
  'am_adam',
  'am_gurney',
  'am_michael',
  'bf_emma',
  'bf_isabella',
  'bm_george',
  'bm_lewis',
];
export default async (req: Request, res: Response) => {
  // We'll just use "text" from the request body
  const text = req.body.text;
  let voiceId = req.body.voiceId;
  if (!text) {
    return res.status(400).send('Text is required');
  }
  if (!voiceIds.includes(voiceId)) {
    voiceId = 'af_sky_af_bella';
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
