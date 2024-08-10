import fs from 'fs';
import { Request, Response } from 'express';
import { MikuCard, NovelV3, extractNovelAssets } from '@mikugg/bot-utils';
import config from '../config';

export default async function deletBot(req: Request, res: Response) {
  try {
    const hash = req.params?.hash || '';
    const _botRaw = fs.readFileSync(`${config.BOT_PATH}/${hash}`, 'utf8');
    const _bot = JSON.parse(_botRaw) as {
      version: 'v3';
      novel: NovelV3.NovelState;
    };

    try {
      const deleteAsset = async (asset: string) => {
        if (fs.existsSync(`${config.ASSET_PATH}/${asset}`)) fs.unlinkSync(`${config.ASSET_PATH}/${asset}`);
        if (fs.existsSync(`${config.ASSET_PATH}/480p_${asset}`)) fs.unlinkSync(`${config.ASSET_PATH}/480p_${asset}`);
        if (fs.existsSync(`${config.ASSET_PATH}/720p_${asset}`)) fs.unlinkSync(`${config.ASSET_PATH}/720p_${asset}`);
        if (fs.existsSync(`${config.ASSET_PATH}/1080p_${asset}`)) fs.unlinkSync(`${config.ASSET_PATH}/1080p_${asset}`);
        if (fs.existsSync(`${config.ASSET_PATH}/4k_${asset}`)) fs.unlinkSync(`${config.ASSET_PATH}/4k_${asset}`);
      };
      const {
        assets: { images, videos },
      } = await extractNovelAssets(_bot.novel);
      for (const image of images) {
        await deleteAsset(image[0]);
      }
      for (const video of videos) {
        await deleteAsset(video[0]);
      }
    } catch (err) {
      console.error('delete asset error', err);
    }

    fs.unlinkSync(`${config.BOT_PATH}/${hash}`);

    res.redirect('/');
    res.end();
  } catch (err) {
    res.status(400).send(err);
    return;
  }
}
