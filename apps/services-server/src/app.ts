/* eslint-disable @typescript-eslint/no-var-requires */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import * as MikuExtensions from '@mikugg/extensions';
import jwt from 'jsonwebtoken';
import { IncomingHttpHeaders } from 'http2';

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
const APHRODITE_ENDPOINT = process.env.APHRODITE_ENDPOINT || '';
const APHRODITE_S3_BUCKET = process.env.APHRODITE_S3_BUCKET || '';
const APHRODITE_S3_REGION = process.env.APHRODITE_S3_REGION || '';
const APHRODITE_S3_ACCESS_KEY = process.env.APHRODITE_S3_ACCESS_KEY || '';
const APHRODITE_S3_SECRET_KEY = process.env.APHRODITE_S3_SECRET_KEY || '';
const SBERT_EMOTIONS_ENABLED = Number(process.env.SBERT_EMOTIONS_ENABLED || '0');
const SBERT_SIMILARITY_API_URL = process.env.SBERT_SIMILARITY_API_URL || '';
const SBERT_SIMILARITY_API_TOKEN = '';
const AUDIO_FILE_PATH = '_temp';

const app = express();
app.use(cors({
  credentials: true,
  origin: ['http://localhost:5173', 'https://alpha.miku.gg', 'https://interactor.miku.gg']
}));
app.use(bodyParser.json());
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

const verifyJWT = async (headers: IncomingHttpHeaders): Promise<'EXPIRED' | 'REGULAR' | 'PREMIUM'> => {
  return new Promise((resolve) => {
    const authCookie = headers.cookie?.split(';').find((cookie: string) => cookie.includes('Authentication'));
    const bearerToken = authCookie?.split('=')[1] || '';

    if (bearerToken) {
      console.log(bearerToken);
      jwt.verify(bearerToken, process.env.JWT_SECRET || '', (err, _decodedData) => {
        const decodedData = _decodedData as jwt.JwtPayload;
        console.log(err);
        if (err) {
          resolve('EXPIRED');
        } else if ((decodedData.exp || 0) < Date.now() / 1000) {
          resolve('EXPIRED');
        } else {
          resolve(decodedData.isPremium ? 'PREMIUM' : 'REGULAR');
        }
      });
    } else {
      resolve('EXPIRED');
    }
  });
};


const addRoute = (path: string, cb: (body: any) => Promise<{ status: number, response: any}>) => {
  app.post(path, async (req, res) => {
    const jwt = await verifyJWT(req.headers);
    console.log('path', path, jwt);
    if (path === `/${MikuExtensions.Services.ServicesNames.Aphrodite}/query` && jwt === 'EXPIRED') {
      res.status(401).send('Unauthorized');
      return;
    }
    if (path === `/${MikuExtensions.Services.ServicesNames.AzureTTS}/query` && jwt !== 'PREMIUM') {
      res.status(401).send('Unauthorized');
      return;
    }
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

if (SBERT_EMOTIONS_ENABLED) {
  new MikuExtensions.Services.SBertEmotionInterpreterService({
    serviceId: MikuExtensions.Services.ServicesNames.SBertEmotionInterpreter,
    billingEndpoint: '',
    sbertSimilarityAPIToken: SBERT_SIMILARITY_API_TOKEN,
    sbertSimilarityAPIUrl: SBERT_SIMILARITY_API_URL,
    addRoute
  });
}

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
    }
  })
}

export default app;