import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { Readable } from "stream";

let tempKey = "";

const getTempKey = async (): Promise<string> => {
  return axios({
    url: "https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
    method: "post",
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.AZURE_API_KEY || "",
      "Content-Type": "application/json",
    },
    data: {},
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return "";
    });
};

const updateTempKey = async (): Promise<string> => {
  const _tempKey = await getTempKey();
  if (_tempKey) tempKey = _tempKey;
  return tempKey;
};

export default async (req: Request<string>, res: Response) => {
  const text = req.body.text;
  const voiceId = req.body.voiceId;
  const speakingStyle = req.body.speakingStyle;
  if (!text) {
    return res.status(400).send("Text is required");
  }
  res.write("");
  try {
    // Replace with your Azure endpoint and key
    const azureEndpoint =
      "https://westus.tts.speech.microsoft.com/cognitiveservices/v1";

    const doQuery = () =>
      axios.post(
        azureEndpoint,
        `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version='1.0' xml:lang='en-US'><voice name='${voiceId}'> <mstts:express-as style="${speakingStyle}"> ${text} </mstts:express-as> </voice></speak>`,
        {
          headers: {
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
            Authorization: `Bearer ${tempKey}`,
            "User-Agent": "mikugg",
          },
          responseType: "stream",
        }
      );

    let response: AxiosResponse<Readable>;
    try {
      // Prepare the request for Azure Text to Speech
      response = await doQuery();
    } catch (e) {
      try {
        await updateTempKey();
        response = await doQuery();
      } catch (e) {
        res.status(500).send("Error processing text to speech");
        return;
      }
    }

    // Stream the audio response back
    response.data.pipe(res);
  } catch (error) {
    console.error("Error calling Azure Text to Speech:", error);
    res.status(500).send("Error processing text to speech");
  }
};
