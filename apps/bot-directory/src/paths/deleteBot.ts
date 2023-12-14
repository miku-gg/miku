import fs from 'fs';
import { Request, Response } from "express";
import { MikuCard } from "@mikugg/bot-utils";
import config from '../config';

export default async function deletBot(req: Request, res: Response) {
  try {
    const hash = req.params?.hash || '';
    const _botRaw = fs.readFileSync(`${config.BOT_PATH}/${hash}`, 'utf8');
    const _bot = JSON.parse(_botRaw) as MikuCard;

    const deleteAsset = async (asset: string) => {
      if (fs.existsSync(`${config.ASSET_PATH}/${asset}`)) fs.unlinkSync(`${config.ASSET_PATH}/${asset}`);
      if (fs.existsSync(`${config.ASSET_PATH}/480p_${asset}`)) fs.unlinkSync(`${config.ASSET_PATH}/480p_${asset}`);
      if (fs.existsSync(`${config.ASSET_PATH}/720p_${asset}`)) fs.unlinkSync(`${config.ASSET_PATH}/720p_${asset}`);
      if (fs.existsSync(`${config.ASSET_PATH}/1080p_${asset}`)) fs.unlinkSync(`${config.ASSET_PATH}/1080p_${asset}`);
      if (fs.existsSync(`${config.ASSET_PATH}/4k_${asset}`)) fs.unlinkSync(`${config.ASSET_PATH}/4k_${asset}`);
    }

    if (_bot.data?.extensions?.mikugg?.profile_pic) {
      deleteAsset(_bot.data?.extensions?.mikugg?.profile_pic);
    }
    _bot.data?.extensions?.mikugg?.backgrounds.forEach((bg) => {
      deleteAsset(bg.source);
    });
    _bot.data?.extensions?.mikugg?.emotion_groups.forEach((emotion_group) => {
      emotion_group.emotions.forEach((emotion) => {
        emotion.source.forEach((source) => {
          deleteAsset(source);
        });
      });
    });
    _bot.data.extensions.mikugg.sounds?.forEach((sound) => {
      deleteAsset(sound.source);
    });
    fs.unlinkSync(`${config.BOT_PATH}/${hash}`);

    res.redirect('/');
    res.end();
  } catch (err) {
    res.status(400).send(err);
    return;
  }
}
