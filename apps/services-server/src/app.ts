/* eslint-disable @typescript-eslint/no-var-requires */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import * as MikuExtensions from '@mikugg/extensions';

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env')});

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const AZURE_API_KEY = process.env.AZURE_API_KEY || '';
const NOVELAI_API_KEY = process.env.NOVELAI_API_KEY || '';
const AUDIO_FILE_PATH = '_temp';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(bodyParser.json());
// allow options on every requests

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${AUDIO_FILE_PATH}/`)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.wav')
  }
})
const uploadAudio = multer({ storage });
app.post('/audio-upload', uploadAudio.single('file'), (req, res) => {
  res.status(200).send(req.file?.filename || '');
});

const addRoute = (path: string, cb: (body: any) => Promise<{ status: number, response: any}>) => {
  app.post(path, async (req, res) => {
    const result = await cb(req.body);
    res.status(result.status).send(result.response);
  });
};


if (ELEVENLABS_API_KEY) {
  new MikuExtensions.Services.TTS.ElevenLabsService({
    apiKey: ELEVENLABS_API_KEY,
    costPerRequest: 50,
    serviceId: MikuExtensions.Services.ServicesNames.ElevenLabsTTS,
    addRoute
  });  
}
if (AZURE_API_KEY) {
  new MikuExtensions.Services.TTS.AzureTTSService({
    apiKey: AZURE_API_KEY,
    costPerRequest: 10,
    serviceId: MikuExtensions.Services.ServicesNames.AzureTTS,
    addRoute
  });  
}

if (NOVELAI_API_KEY) {
  new MikuExtensions.Services.TTS.NovelAITTSService({
    apiKey: NOVELAI_API_KEY,
    costPerRequest: 10, 
    serviceId: MikuExtensions.Services.ServicesNames.NovelAITTS,
    addRoute
  });
}

const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT || undefined;
const OPENAI_KEY = process.env.OPENAI_KEY || '';
const S3_ENDPOINT = process.env.S3_ENDPOINT || '';
const S3_BUCKET = process.env.S3_BUCKET || '';
const S3_REGION = process.env.S3_REGION || 'local';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'dummy';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'dummy';

if (OPENAI_ENDPOINT) {
  new MikuExtensions.Services.AphroditePromptCompleterService({
    serviceId: MikuExtensions.Services.ServicesNames.Aphrodite,
    addRoute,
    botCardConnector: new MikuExtensions.Utils.BotCardConnector(S3_BUCKET,{
      endpoint: S3_ENDPOINT || undefined,
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY
      }
    }),
    aphroditeEndpoint: OPENAI_ENDPOINT,
    aphroditeApiKey: OPENAI_KEY,
    aphoditeConfig: {
      truncation_length: 4096,
      max_tokens: 300,
      n: 1,
      best_of: 1,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      repetition_penalty: 1.17,
      temperature: 1.31,
      top_p: 0.14,
      top_k: 49,
      top_a: 0.52,
      tfs: 1,
      eta_cutoff: 10.42,
      epsilon_cutoff: 1.49,
      typical_p: 1,
      mirostat_mode: 0,
      mirostat_tau: 5.0,
      mirostat_eta: 0.1,
      use_beam_search: false,
      length_penalty: 1.0,
      early_stopping: false,
      stop: [
        '\n### Instruction:',
        '\n' +
          '### Response (2 paragraphs, engaging, natural, authentic, descriptive, creative):',
        '</s>',
        '<|',
        '\n#',
        '\n\n\n'
      ],
      ignore_eos: false,
      skip_special_tokens: true,
      spaces_between_special_tokens: true,
    },
  })
}

if (OPENAI_ENDPOINT) {
  new MikuExtensions.Services.EmotionGuidanceService({
    addRoute,
    serviceId: MikuExtensions.Services.ServicesNames.EmotionGuidance,
    aphroditeApiKey: OPENAI_KEY,
    aphroditeEndpoint: OPENAI_ENDPOINT,
  })
}

export default app;