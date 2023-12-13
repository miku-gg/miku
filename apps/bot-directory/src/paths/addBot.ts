import { readFileSync } from 'fs';
import { Request, Response } from "express";
import { MikuCard, validateMikuCard, extractMikuCardAssets } from "@mikugg/bot-utils";
import { resizeImages } from '../libs/assetResize';
import { BUCKET, uploadS3File, getS3File } from '../s3server';
const Hash = require('ipfs-only-hash');

const replaceStringsInObject = (obj: any, find: string, replace: string): any => {
  return JSON.parse(JSON.stringify(obj).replace(new RegExp(find, 'g'), replace));
}

// hashes the image, store is it IMG_PATH and returns the hash
const addAsset = async (hash: string, base64URL: string): Promise<string> => {
  let assetKey = hash;
  const buffer = Buffer.from(base64URL.split(',')[1], 'base64');
  const dataType = base64URL.split(',')[0]
  // add extension to the path
  if (dataType.includes('png')) assetKey += '.png';
  else if (dataType.includes('jpg')) assetKey += '.jpg';
  else if (dataType.includes('jpeg')) assetKey += '.jpeg';
  else if (dataType.includes('gif')) assetKey += '.gif';
  else if (dataType.includes('mp3')) assetKey += '.mp3';
  else if (dataType.includes('audio/mpeg')) assetKey += '.mp3';
  else if (dataType.includes('wav')) assetKey += '.wav';
  else if (dataType.includes('ogg')) assetKey += '.ogg';
  else if (dataType.includes('webm')) assetKey += '.webm';
  else throw `Invalid file type ${dataType}`;
  await uploadS3File(BUCKET.ASSETS, assetKey, buffer);
  return assetKey;
}

// Registers a bot configuration
export default async function addBot(req: Request, res: Response) {
  try {
    if (!req.file?.path) throw 'file not found';
    if (!req.file?.originalname.endsWith('.json')) throw 'Invalid file type, only .json is supported';

    const buffer = readFileSync(req.file.path);
    const mikuCard = JSON.parse(buffer.toString('utf-8')) as MikuCard;
    
    if(mikuCard?.spec !== 'chara_card_v2') throw 'Invalid file type, only chara_card_v2 is supported';
    if(!mikuCard?.data?.extensions?.mikugg?.scenarios?.length) throw 'Invalid card: extension.mikugg.scenarios not found or is empty';
    const errors = validateMikuCard(mikuCard);
    if (errors.length) throw errors.join('\n');
    const {card: _extractedMikuCard, images, audios } = await extractMikuCardAssets(mikuCard);
    const assets = new Map([...images, ...audios]);

    const hashes = await Promise.all(Array.from(assets.keys()).map(async (asset): Promise<{find: string, replace: string}> => {
      const newAssetKey = await addAsset(asset, assets.get(asset) as string);
      return {find: asset, replace: newAssetKey};
    }));
    hashes.forEach(({find, replace}) => {
      _extractedMikuCard.data = replaceStringsInObject(_extractedMikuCard.data, find, replace);
    });

    const _extractedMikuCardHash = await Hash.of(JSON.stringify(_extractedMikuCard)) + '.json';
    await uploadS3File(BUCKET.BOTS, _extractedMikuCardHash, Buffer.from(JSON.stringify(_extractedMikuCard), 'utf-8'));
    await resizeImages(
      async (hash) => {
        return getS3File(BUCKET.ASSETS, hash);
      },
      async (filename, buffer) => {
        return uploadS3File(BUCKET.ASSETS, filename, buffer)
      },
      hashes.map(asset => asset.replace).filter(asset => (
        asset.endsWith('.png') ||
        asset.endsWith('.jpg') ||
        asset.endsWith('.jpeg') ||
        asset.endsWith('.gif')
      )),
    );

    res.redirect('/');
    res.end();
    
  } catch (err) {
    res.status(400).send(`
      <h1>Failed to add bot</h1>
      <p>${err}</p>
      <a href="/">Go back</a>
    `);
    return;
  }
  
}
