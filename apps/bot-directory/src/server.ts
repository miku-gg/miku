import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import buildBot from './paths/buildBot';
import addBot from './paths/addBot';
import deleteBot from './paths/deleteBot';
import getItem from './paths/getItem';
import addImage from './paths/addImage';
import multer from 'multer';
import addEmotion from './paths/addEmotion';
import addEmbedding from './paths/addEmbedding';
import fs from 'fs';
import config from './config';
import open from 'open';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env')});

const app = express();
app.use('/public', express.static(process.cwd() + '/public'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
const upload = multer({ dest: '_temp' });

app.get('/', (req, res) => {
  fs.readdir(config.BOT_PATH, async (err, files) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    /* read all json files */
    files = await Promise.all(files.map(async (file) => {
      const data = await fs.readFileSync(`${config.BOT_PATH}/${file}`, 'utf8');
      return {
        ...JSON.parse(data),
        hash: file
      };
    }));

    res.render('index', {bots: files});
  });
});

app.get('/build', (req, res) => res.render('bot_form'));
app.post('/build', upload.any(), buildBot);

app.post('/bot',  upload.single("file"), addBot);
app.post('/bot/delete/:hash', deleteBot);
app.get('/bot/:hash', getItem.bind(null, 'json', 'bots'));
app.post('/image', multer().array('files'), addImage);
app.get('/image/:hash', getItem.bind(null, 'image', 'imgs'));

app.post('/emotion', multer().single('file'), addEmotion);
app.get('/emotion/:hash', getItem.bind(null, 'json', 'emotions'));

app.post('/embeddings', multer().single('file'), addEmbedding);
app.get('/embeddings/:hash', getItem.bind(null, 'csv', 'embeddings'));

app.listen(process.env.PORT || 8585, () => {
  console.log(`Bots server running on http://localhost:${process.env.BOT_DIRECTORY_PORT || 8585}`);
  open(`http://localhost:${process.env.BOT_DIRECTORY_PORT || 8585}`)
})