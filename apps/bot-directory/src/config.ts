import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, "../db")
const config = {
  "DB_PATH": DB_PATH,
  "IMG_PATH": `${DB_PATH}/imgs`,
  "BOT_PATH": `${DB_PATH}/bots`,
  "AUDIO_PATH": `${DB_PATH}/audios`,
  "EMOTIONS_PATH": `${DB_PATH}/emotions`,
  "EMBEDDINGS_PATH": `${DB_PATH}/embeddings`,
}

fs.mkdir(config.BOT_PATH, { recursive: true }, (err) => {
  if (err) throw err;
});
fs.mkdir(config.IMG_PATH, { recursive: true }, (err) => {
  if (err) throw err;
});
fs.mkdir(config.AUDIO_PATH, { recursive: true }, (err) => {
  if (err) throw err;
});

export default config;