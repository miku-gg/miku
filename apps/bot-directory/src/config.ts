import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../db');
const config = {
  DB_PATH: DB_PATH,
  ASSET_PATH: `${DB_PATH}/assets`,
  BOT_PATH: `${DB_PATH}/bots`,
};

fs.mkdir(config.BOT_PATH, { recursive: true }, (err) => {
  if (err) throw err;
});
fs.mkdir(config.ASSET_PATH, { recursive: true }, (err) => {
  if (err) throw err;
});

export default config;
