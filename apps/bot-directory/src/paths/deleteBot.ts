import fs from 'fs';
import { Request, Response } from "express";
import { BotConfig, MikuCard } from "@mikugg/bot-utils";
import * as Miku from "@mikugg/extensions";
import config from '../config';

export default async function deletBot(req: Request, res: Response) {
  try {
    const hash = req.params?.hash || '';
    const _botRaw = fs.readFileSync(`${config.BOT_PATH}/${hash}`, 'utf8');
    const _bot = JSON.parse(_botRaw) as MikuCard;

    if (_bot.data?.extensions?.mikugg?.profile_pic) {
      if (fs.existsSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}`)) fs.unlinkSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}`);
      if (fs.existsSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}_480p`)) fs.unlinkSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}_480p`);
      if (fs.existsSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}_720p`)) fs.unlinkSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}_720p`);
      if (fs.existsSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}_1080p`)) fs.unlinkSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}_1080p`);
      if (fs.existsSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}_4k`)) fs.unlinkSync(`${config.IMG_PATH}/${_bot.data.extensions.mikugg.profile_pic}_4k`);
    }
    _bot.data?.extensions?.mikugg?.backgrounds.forEach((bg) => {
      if (fs.existsSync(`${config.IMG_PATH}/${bg.source}`)) fs.unlinkSync(`${config.IMG_PATH}/${bg.source}`);
      if (fs.existsSync(`${config.IMG_PATH}/${bg.source}_480p`)) fs.unlinkSync(`${config.IMG_PATH}/${bg.source}_480p`);
      if (fs.existsSync(`${config.IMG_PATH}/${bg.source}_720p`)) fs.unlinkSync(`${config.IMG_PATH}/${bg.source}_720p`);
      if (fs.existsSync(`${config.IMG_PATH}/${bg.source}_1080p`)) fs.unlinkSync(`${config.IMG_PATH}/${bg.source}_1080p`);
      if (fs.existsSync(`${config.IMG_PATH}/${bg.source}_4k`)) fs.unlinkSync(`${config.IMG_PATH}/${bg.source}_4k`);
    });
    _bot.data?.extensions?.mikugg?.emotion_groups.forEach((emotion_group) => {
      emotion_group.emotions.forEach((emotion) => {
        emotion.source.forEach((source) => {
          if (fs.existsSync(`${config.IMG_PATH}/${source}`)) fs.unlinkSync(`${config.IMG_PATH}/${source}`);
          if (fs.existsSync(`${config.IMG_PATH}/${source}_480p`)) fs.unlinkSync(`${config.IMG_PATH}/${source}_480p`);
          if (fs.existsSync(`${config.IMG_PATH}/${source}_720p`)) fs.unlinkSync(`${config.IMG_PATH}/${source}_720p`);
          if (fs.existsSync(`${config.IMG_PATH}/${source}_1080p`)) fs.unlinkSync(`${config.IMG_PATH}/${source}_1080p`);
          if (fs.existsSync(`${config.IMG_PATH}/${source}_4k`)) fs.unlinkSync(`${config.IMG_PATH}/${source}_4k`);
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
