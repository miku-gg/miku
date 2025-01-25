import { Request, Response } from 'express';
import axios from 'axios';

export default async (req: Request, res: Response) => {
  // We'll just use "text" from the request body
  const text = req.body.text;
  if (!text) {
    return res.status(400).send('Text is required');
  }

  try {
    // Example: local endpoint for an OpenAI-compatible service
    const openAiEndpoint = `${process.env.OPENAI_AUDIO_ENDPOINT}/audio/speech`;

    // Use "af_bella" and "kokoro" for model
    const response = await axios.post(
      openAiEndpoint,
      {
        model: 'kokoro',
        voice: 'af_bella',
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
