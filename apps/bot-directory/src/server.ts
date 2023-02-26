import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import addBot from './paths/addBot';
import getItem from './paths/getItem';
import addImage from './paths/addImage';
import multer from 'multer';
import addEmotion from './paths/addEmotion';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env')});

const app = express();
app.use(cors());
app.get('/', (req, res) => res.send('miku bot server'))

app.post('/bot', bodyParser.json(), addBot);
app.get('/bot/:hash', getItem.bind(null, 'json', 'bots'));

app.post('/image', multer().single('file'), addImage);
app.get('/image/:hash', getItem.bind(null, 'image', 'imgs'));

app.post('/emotion', multer().single('file'), addEmotion);
app.get('/emotion/:hash', getItem.bind(null, 'json', 'emotions'));

app.listen(process.env.PORT || 8585, () => {
  console.log(`Bots server running on http://localhost:${process.env.BOT_DIRECTORY_PORT || 8585}`);
})