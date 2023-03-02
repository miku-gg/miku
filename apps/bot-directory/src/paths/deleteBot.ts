import fs from 'fs';
import { Request, Response } from "express";
import { BotConfig } from "@mikugg/bot-builder";
import * as Miku from "@mikugg/extensions";
import config from '../config';

export default async function deletBot(req: Request, res: Response) {
  try {
    const hash = req.params?.hash || '';
    const _botRaw = fs.readFileSync(`${config.BOT_PATH}/${hash}`, 'utf8');
    const _bot = JSON.parse(_botRaw) as BotConfig;

    if (_bot.profile_pic && fs.existsSync(`${config.IMG_PATH}/${_bot.profile_pic}`)) fs.unlinkSync(`${config.IMG_PATH}/${_bot.profile_pic}`);
    const imagesRenderer = _bot.outputListeners.find((l) => l.service === Miku.Services.ServicesNames.OpenAIEmotionInterpreter);
    if (imagesRenderer) {
      // @ts-ignore
      Object.values(imagesRenderer.props.images).forEach((imgHash: string) => {
        // check if file exits
        if (fs.existsSync(`${config.IMG_PATH}/${imgHash}`)) {
          fs.unlinkSync(`${config.IMG_PATH}/${imgHash}`);
        }
      });
    }
    fs.unlinkSync(`${config.BOT_PATH}/${hash}`);

    res.redirect('/');
    res.end();
  } catch (err) {
    res.status(400).send(err);
    return;
  }
}
