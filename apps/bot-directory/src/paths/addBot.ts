import fs from 'fs';
import { Express, Request, Response } from "express";
import { BotConfig, validateBotConfig } from "@mikugg/bot-builder";
import * as Miku from "@mikugg/extensions";
import config from '../config';
import AdmZip from "adm-zip";
import { assert } from 'console';
const Hash = require('ipfs-only-hash');


// Registers a bot configuration
export default async function addBot(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file?.path) throw 'file not found';
    const zip = new AdmZip(file.path);
    await Promise.all(zip.getEntries().map(async (entry) => {
      if (entry.comment === 'Bot Config') {
        const data = entry.getData().toString('utf8');
        const hash = await Hash.of(data);
        assert(entry.name === hash, `Hash mismatch for bot config`);
        const botPath = `${config.BOT_PATH}/${hash}`;
        if (fs.existsSync(botPath)) {
          throw 'Bot already exists';
        }
        await fs.writeFileSync(botPath, data);
      } else {
        const data = entry.getData().toString('base64');
        const hash = await Hash.of(data);
        assert(entry.name === hash, `Hash mismatch for ${entry.name}`);
        const imgPath = `${config.IMG_PATH}/${hash}`;
        if (!fs.existsSync(imgPath)) {
          await fs.writeFileSync(imgPath, Buffer.from(data, 'base64'), 'binary');
        }
      }
    }));
    res.redirect('/');
    res.end();
    
  } catch (err) {
    res.status(400).send(err);
    return;
  }
  
}
