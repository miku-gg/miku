import fs from 'fs';
import { Request, Response } from "express";
import { BotConfig, validateBotConfig } from "@mikugg/bot-builder";
import config from '../config';
const Hash = require('ipfs-only-hash');

// Registers a bot configuration
export default async function addBot(req: Request, res: Response) {
  try {
    const botConfig = req.body as BotConfig;
    validateBotConfig(botConfig);
    const configRaw = JSON.stringify(botConfig);
    const botHash = await Hash.of(configRaw) as string;
    const botPath = `${config.BOT_PATH}/${botHash}`;
    if (fs.existsSync(botPath)) {
      throw 'Bot already exists';
    }
    fs.writeFileSync(botPath, configRaw);
    res.send(botHash);
  } catch (err) {
    res.status(400).send(err);
    return;
  }
  
}