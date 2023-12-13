import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import addBot from './paths/addBot';
import deleteBot from './paths/deleteBot';
import getItem from './paths/getItem';
import addImage from './paths/addImage';
import multer from 'multer';
import fs from 'fs';
import config from './config';
import open from 'open';
import s3ServerDecorator from './s3server';
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
    files = (await Promise.all(files.map(async (file) => {
      const data = fs.readFileSync(`${config.BOT_PATH}/${file}`, 'utf8');
      return {
        ...JSON.parse(data),
        hash: file
      };
    }))).filter(x => (
      x?.spec === 'chara_card_v2' &&
      x?.data?.extensions?.mikugg?.scenarios?.length &&
      x?.data?.extensions?.mikugg?.profile_pic &&
      x?.data?.extensions?.mikugg?.backgrounds?.length &&
      x?.data?.extensions?.mikugg?.emotion_groups?.length 
    ));

    res.render('index', {bots: files});
  });
});

app.post('/bot',  upload.single("file"), addBot);
app.post('/bot/delete/:hash', deleteBot);
app.get('/bot/:hash', getItem.bind(null, 'json', 'bots'));
app.post('/image', multer().array('files'), addImage);
app.get('/image/:hash', getItem.bind(null, 'image', 'imgs'));

s3ServerDecorator(app);

app.listen(process.env.PORT || 8585, () => {
  console.log(`Bots server running on http://localhost:${process.env.BOT_DIRECTORY_PORT || 8585}`);
  open(`http://localhost:${process.env.BOT_DIRECTORY_PORT || 8585}`)
})