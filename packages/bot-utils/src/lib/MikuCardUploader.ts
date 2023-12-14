import { MikuCard, extractMikuCardAssets, validateMikuCard } from "..";
import Hash from 'ipfs-only-hash';
import { ISharp, resizeImage } from "./assetResize";

export enum BUCKET {
  BOTS = 'bots',
  ASSETS = 'assets',
}

const replaceStringsInObject = (obj: any, find: string, replace: string): any => {
  return JSON.parse(JSON.stringify(obj).replace(new RegExp(find, 'g'), replace));
}

const addAsset = async (hash: string, base64URL: string, upload: (bucket: BUCKET, key: string, content: Buffer) => Promise<void>,): Promise<string> => {
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
  await upload(BUCKET.ASSETS, assetKey, buffer);
  return assetKey;
}

export async function* mikuCardUploader(
  /* MikuCard with assets as base64 */
  rawMikuCard: MikuCard,
  /* s3 interaction callbacks */
  callbacks: {
    upload: (bucket: BUCKET, key: string, content: Buffer) => Promise<void>,
    /* optional sharp for image resizing */
    sharp?: (buffer: Buffer) => ISharp,
  }
): AsyncGenerator<number> {
  if(rawMikuCard?.spec !== 'chara_card_v2') throw 'Invalid file type, only chara_card_v2 is supported';
  if(!rawMikuCard?.data?.extensions?.mikugg?.scenarios?.length) throw 'Invalid card: extension.mikugg.scenarios not found or is empty';
  const errors = validateMikuCard(rawMikuCard);
  if (errors.length) throw errors.join('\n');
  const {card: _extractedMikuCard, images, audios } = await extractMikuCardAssets(rawMikuCard);
  const assets = new Map([...images, ...audios]);
  let totalSteps = assets.size + 2;
  if (callbacks.sharp) {
    totalSteps += images.size;
  }
  let currentStep = 0;

  async function uploadAsset(asset: string): Promise<{ find: string, replace: string }> {
    const newAssetKey = await addAsset(asset, assets.get(asset) as string, callbacks.upload);
    return { find: asset, replace: newAssetKey };
  }

  const assetUploadPromises = Array.from(assets.keys()).map(asset => uploadAsset(asset));
  for (const promise of assetUploadPromises) {
    await promise;
    currentStep++;
    yield currentStep / totalSteps;
  }

  const hashes = await Promise.all(assetUploadPromises);

  hashes.forEach(({find, replace}) => {
    _extractedMikuCard.data = replaceStringsInObject(_extractedMikuCard.data, find, replace);
  });
  const newImages = new Map([...images].map(([hash, base64URL]) => {
    const newHash = hashes.find(x => x.find === hash)?.replace || hash;
    return [newHash, base64URL];
  }));

  const _extractedMikuCardHash = await Hash.of(JSON.stringify(_extractedMikuCard)) + '.json';
  await callbacks.upload(BUCKET.BOTS, _extractedMikuCardHash, Buffer.from(JSON.stringify(_extractedMikuCard), 'utf-8'));
  currentStep++;
  yield currentStep / totalSteps;


  if (callbacks.sharp) {
    const sharp = callbacks.sharp as (buffer: Buffer) => ISharp;
    const resizeImagePromises = Array.from(newImages.keys()).map((hash) => resizeImage(
      sharp,
      (filename: string, data: Buffer) => callbacks.upload(BUCKET.ASSETS, filename, data),
      hash,
      Buffer.from((newImages.get(hash) as string).split(',')[1], 'base64'),
   ))
   for (const promise of resizeImagePromises) {
      await promise;
      currentStep++;
      yield currentStep / totalSteps;
    }
  }

  yield 1;
}