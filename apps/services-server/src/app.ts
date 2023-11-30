/* eslint-disable @typescript-eslint/no-var-requires */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import * as MikuExtensions from '@mikugg/extensions';

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env')});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const AZURE_API_KEY = process.env.AZURE_API_KEY || '';
const NOVELAI_API_KEY = process.env.NOVELAI_API_KEY || '';
const PYGMALION_ENDPOINT = process.env.PYGMALION_ENDPOINT || '';
const OOBABOOGA_ENDPOINT = process.env.OOBABOOGA_ENDPOINT || '';
const EMOTIONS_ENDPOINT = process.env.EMOTIONS_ENDPOINT || '';
const SBERT_EMOTIONS_ENABLED = Number(process.env.SBERT_EMOTIONS_ENABLED || '0');
const SBERT_SIMILARITY_API_URL = process.env.SBERT_SIMILARITY_API_URL || '';
const SBERT_SIMILARITY_API_TOKEN = '';
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

if (OPENAI_API_KEY) {
  new MikuExtensions.Services.OpenAIPromptCompleterService({
    apiKey: OPENAI_API_KEY,
    serviceId: MikuExtensions.Services.ServicesNames.OpenAI,
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

if (OOBABOOGA_ENDPOINT) {
  new MikuExtensions.Services.OobaboogaService({
    gradioEndpoint: OOBABOOGA_ENDPOINT,
    apiKey: '',
    serviceId: MikuExtensions.Services.ServicesNames.Oobabooga,
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

if (OPENAI_API_KEY) {
  new MikuExtensions.Services.WhisperService({
    apiKey: OPENAI_API_KEY,
    serviceId: MikuExtensions.Services.ServicesNames.WhisperSTT,
    audioFilePath: AUDIO_FILE_PATH,
    billingEndpoint: '',
    costPerRequest: 0,
    addRoute
  });
}

const APHRODITE_ENDPOINT = process.env.APHRODITE_ENDPOINT || '';
const APHRODITE_S3_BUCKET = process.env.APHRODITE_S3_BUCKET || '';
const APHRODITE_S3_REGION = process.env.APHRODITE_S3_REGION || '';
const APHRODITE_S3_ACCESS_KEY = process.env.APHRODITE_S3_ACCESS_KEY || '';
const APHRODITE_S3_SECRET_KEY = process.env.APHRODITE_S3_SECRET_KEY || '';
/*
if (APHRODITE_ENDPOINT) {
  new MikuExtensions.Services.AphroditePromptCompleterService({
    serviceId: MikuExtensions.Services.ServicesNames.Aphrodite,
    billingEndpoint: '',
    addRoute,
    s3Bucket: APHRODITE_S3_BUCKET,
    s3Config: {
      region: APHRODITE_S3_REGION,
      credentials: {
        accessKeyId: APHRODITE_S3_ACCESS_KEY,
        secretAccessKey: APHRODITE_S3_SECRET_KEY
      }
    },
    aphroditeEndpoint: APHRODITE_ENDPOINT,
    aphroditeApiKey: '',
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
      custom_token_bans: [],
      skip_special_tokens: true,
      spaces_between_special_tokens: true,
    },
  })
}
*/
if (APHRODITE_ENDPOINT) {
  new MikuExtensions.Services.EmotionGuidanceService({
    addRoute,
    serviceId: MikuExtensions.Services.ServicesNames.EmotionGuidance,
    billingEndpoint: '',
    aphroditeApiKey: 'sk-EMPTY',
    aphroditeEndpoint: APHRODITE_ENDPOINT,
  })
} else if (SBERT_EMOTIONS_ENABLED) {
  new MikuExtensions.Services.SBertEmotionInterpreterService({
    serviceId: MikuExtensions.Services.ServicesNames.EmotionGuidance,
    billingEndpoint: '',
    sbertSimilarityAPIToken: SBERT_SIMILARITY_API_TOKEN,
    sbertSimilarityAPIUrl: SBERT_SIMILARITY_API_URL,
    addRoute
  });
}

export default app;