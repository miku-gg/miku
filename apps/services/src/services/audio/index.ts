import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { Readable } from "stream";
import * as backend_config from "../../../backend_config.json";


export default async (req: Request<string>, res: Response) => {
  const text = req.body.text;
  const language = req.body.language;
  const gpt_cond_latent = req.body.gpt_cond_latent;
  const speaker_embedding = req.body.speaker_embedding
  if (!text || !gpt_cond_latent || !speaker_embedding) {
    return res.status(400).send("Missing requirements");
  }
  
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.INTERACTOR_ENDPOINT || "http://localhost:5173"
  );

  res.write("");

  try {
    
    const doQuery = () =>
      axios.post(
        backend_config.xttsUrl + "/tts_stream",
        {
          "text": text,
          "language": language || "en",
          "stream_chunk_size": "20",
          "gpt_cond_latent": gpt_cond_latent,
          "speaker_embedding": speaker_embedding,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "mikugg",
          },
          responseType: "stream",
        }
      );

    let response: AxiosResponse<Readable>;
    try {
      // Prepare the request for AXTTS
      response = await doQuery();
    } catch (e) {
      console.error("Error calling XTTS2:", e);
      res.status(500).send("Error processing text to speech");
      return;
    }

    // Stream the audio response back
    response.data.pipe(res);
  } catch (error) {
    console.error("Error calling XTTS2:", error);
    res.status(500).send("Error processing text to speech");
  }
};
