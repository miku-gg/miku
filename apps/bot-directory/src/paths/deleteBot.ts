import fs from 'fs';
import { Request, Response } from "express";
import { BotConfig, MikuCard } from "../../../../packages/bot-validator/dist";
import * as Miku from "@mikugg/extensions";
import config from '../config';

export default async function deletBot(req: Request, res: Response) {
  try {
    const hash = req.params?.hash || '';
    const _botRaw = fs.readFileSync(`${config.BOT_PATH}/${hash}`, 'utf8');
    const _bot = JSON.parse(_botRaw) as MikuCard;

    if (
      _bot.data?.extensions?.mikugg?.profile_pic &&
      fs.existsSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}`)) {
      fs.unlinkSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}`);
    }
    _bot.data?.extensions?.mikugg?.backgrounds.forEach((bg) => {
      if (fs.existsSync(`${config.IMG_PATH}/${bg.source}`)) fs.unlinkSync(`${config.IMG_PATH}/${bg.source}`);
    });
    _bot.data?.extensions?.mikugg?.emotion_groups.forEach((emotion_group) => {
      emotion_group.emotions.forEach((emotion) => {
        emotion.source.forEach((source) => {
          if (fs.existsSync(`${config.IMG_PATH}/${source}`)) fs.unlinkSync(`${config.IMG_PATH}/${source}`);
        });
      });
    });
    fs.unlinkSync(`${config.BOT_PATH}/${hash}`);

    res.redirect('/');
    res.end();
  } catch (err) {
    res.status(400).send(err);
    return;
  }
}
