import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as MikuExtensions from '@mikugg/extensions';

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env')});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const AZURE_API_KEY = process.env.AZURE_API_KEY || '';
const NOVELAI_API_KEY = process.env.NOVELAI_API_KEY || '';
const PYGMALION_ENDPOINT = process.env.PYGMALION_ENDPOINT || '';
const EMOTIONS_ENDPOINT = process.env.EMOTIONS_ENDPOINT || '';

const app = express();
app.use(cors());
app.use(bodyParser.json());
const addRoute = (path: string, cb: (body: any) => Promise<{ status: number, response: any}>) => {
  app.post(path, async (req, res) => {
    const result = await cb(req.body);
    res.status(result.status).send(result.response);
  });
};

if (OPENAI_API_KEY) {
  new MikuExtensions.Services.ChatGPTService({
    apiKey: OPENAI_API_KEY,
    serviceId: MikuExtensions.Services.ServicesNames.ChatGPT,
    billingEndpoint: '',
    addRoute
  });  
}

if (ELEVENLABS_API_KEY) {
  new MikuExtensions.Services.TTS.ElevenLabsService({
    apiKey: ELEVENLABS_API_KEY,
    costPerRequest: 50,
    serviceId: MikuExtensions.Services.ServicesNames.ElevenLabsTTS,
    billingEndpoint: '',
    addRoute
  });  
}
if (AZURE_API_KEY) {
  new MikuExtensions.Services.TTS.AzureTTSService({
    apiKey: AZURE_API_KEY,
    costPerRequest: 10,
    serviceId: MikuExtensions.Services.ServicesNames.AzureTTS,
    billingEndpoint: '',
    addRoute
  });  
}

if (NOVELAI_API_KEY) {
  new MikuExtensions.Services.TTS.NovelAITTSService({
    apiKey: NOVELAI_API_KEY,
    costPerRequest: 10, 
    billingEndpoint: '',
    serviceId: MikuExtensions.Services.ServicesNames.NovelAITTS,
    addRoute
  });
}

if (PYGMALION_ENDPOINT) {
  new MikuExtensions.Services.PygmalionService({
    koboldEndpoint: PYGMALION_ENDPOINT,
    serviceId: MikuExtensions.Services.ServicesNames.Pygmalion,
    billingEndpoint: '',
    addRoute
  });  
}

if (EMOTIONS_ENDPOINT && OPENAI_API_KEY) {
  new MikuExtensions.Services.OpenAIEmotionInterpreter({
    apiKey: OPENAI_API_KEY,
    emotionConfigsEndpoint: EMOTIONS_ENDPOINT, 
    defaultConfigHash: 'QmWLtYCXoDXEjw2nuXfkoXv9T7J8umcnF6CyyRjtFuW1UE',
    serviceId: MikuExtensions.Services.ServicesNames.OpenAIEmotionInterpreter,
    billingEndpoint: '',
    addRoute
  });  
}

export default app;