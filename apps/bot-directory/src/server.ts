import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import addBot from './paths/addBot';
import deleteBot from './paths/deleteBot';
import multer from 'multer';
import fs from 'fs';
import config from './config';
import open from 'open';
import s3ServerDecorator, { BUCKET, getS3File } from './s3server';
import { EMPTY_MIKU_CARD, MikuCard, NovelV3, inputToNovelState } from '@mikugg/bot-utils';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = express();
app.use('/public', express.static(process.cwd() + '/public'));
app.set('view engine', 'ejs');

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8586',
      'http://localhost:8587',
      'http://localhost:8585',
      'http://localhost:8484',
    ],
    credentials: true,
  }),
);
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  '/asset-upload/presigned/:key',
  express.raw({
    type: '*/*',
    limit: '50mb', // Adjust the size limit as per your requirements
  }),
);
const upload = multer({ dest: '_temp' });

app.get('/', (req, res) => {
  fs.readdir(config.BOT_PATH, async (err, _files) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    /* read all json files */
    const files = (
      await Promise.all(
        _files.map(async (file) => {
          if (file === '.gitkeep') return null;
          const _data = JSON.parse(getS3File(BUCKET.BOTS, file)?.toString('utf-8') || '{}') as {
            novel: NovelV3.NovelState;
            version: 'v3';
          };

          try {
            const data = inputToNovelState(_data);

            return {
              ...data,
              hash: file,
            };
          } catch (e) {
            console.error(e);
            return null;
          }
        }),
      )
    ).filter(
      (x) =>
        x?.version === 'v3' &&
        x?.novel?.scenes?.length &&
        x?.novel?.logoPic &&
        x?.novel?.backgrounds?.length &&
        x?.novel?.characters?.length,
    );

    res.render('index', { novels: files });
  });
});

app.post('/bot', upload.single('file'), addBot);
app.post('/bot/delete/:hash', deleteBot);
app.post('/save', async (req, res) => {
  fs.writeFileSync(path.join(__dirname, '../../services/backend_config.json'), JSON.stringify(req.body));
});

app.get('/get', async (req, res) => {
  const config = fs.readFileSync(path.join(__dirname, '../../services/backend_config.json'), 'utf8');
  const data = JSON.parse(config);

  res.send({
    apiUrl: data.apiUrl,
    apiKey: data.apiKey,
    model: data.model,
    strategy: data.strategy,
    tokenizer: data.tokenizer,
    truncation_length: data.truncation_length,
    max_new_tokens: data.max_new_tokens,
  });
});

app.get(`/bot/config/:hash`, (req, res) => {
  const file = getS3File(BUCKET.BOTS, req.params.hash);
  if (file) {
    const configFile = file.toString('utf-8');
    const completeCard = JSON.parse(configFile) as MikuCard;
    const card: MikuCard = {
      ...EMPTY_MIKU_CARD,
      data: {
        ...EMPTY_MIKU_CARD.data,
        first_mes: completeCard.data.first_mes,
        name: completeCard.data.name,
        extensions: {
          mikugg: completeCard.data.extensions.mikugg,
        },
      },
    };
    res.setHeader('Access-Control-Allow-Origin', process.env.INTERACTOR_ENDPOINT || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.send(card);
  } else {
    res.status(404).send('File not found.');
  }
});

s3ServerDecorator(app);

app.listen(process.env.PORT || 8585, () => {
  console.log(`Bots server running on http://localhost:${process.env.BOT_DIRECTORY_PORT || 8585}`);
  // open(`http://localhost:${process.env.BOT_DIRECTORY_PORT || 8585}`);
});
