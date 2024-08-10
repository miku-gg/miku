import { readFileSync } from 'fs';
import { Request, Response } from 'express';
import {
  BUCKET,
  MikuCard,
  hashBase64,
  hashBase64URI,
  importAndReplaceNovelStateAssets,
  inputToNovelState,
  tavernCardToNovelState,
} from '@mikugg/bot-utils';
import { uploadAssetHandler, uploadS3File } from '../s3server';
// Registers a bot configuration
export default async function addBot(req: Request, res: Response) {
  try {
    if (!req.file?.path) throw 'file not found';
    if (!req.file?.originalname.endsWith('.json')) throw 'Invalid file type, only .json is supported';

    const buffer = readFileSync(req.file.path);
    const mikuCard = JSON.parse(buffer.toString('utf-8')) as MikuCard;

    const novelState = inputToNovelState(mikuCard);
    const novel = await importAndReplaceNovelStateAssets(novelState.novel, {
      onError: (err, msg) => {
        console.error(err, msg);
      },
      onUpdate: ({ progress, total, bytes }) => {
        console.log(`Uploading ${progress}/${total}... ${bytes} bytes`);
      },
      uploadAsset: async (assetBase64URI) => {
        if (assetBase64URI.startsWith('data:')) {
          const hash = await hashBase64URI(assetBase64URI);
          // convert base64 to file
          const buffer = Buffer.from(assetBase64URI.split('base64,')[1], 'base64');
          await uploadS3File(BUCKET.ASSETS, hash, buffer);
          const fileName = await uploadAssetHandler(
            {
              body: {
                fileName: hash,
                contentType: assetBase64URI.split('data:')[1].split(';')[0],
              },
            } as any,
            {
              send: () => {},
              status: () => {
                return {
                  send: () => {},
                };
              },
            } as any,
          );
          return { success: true, assetId: fileName };
        } else {
          return { success: true, assetId: assetBase64URI };
        }
      },
      uploadBatchSize: 10,
    });
    const cardJSON = JSON.stringify({
      novel,
      version: 'v3',
    });
    const cardJSONBuffer = Buffer.from(cardJSON, 'utf-8');
    const hash = await hashBase64(cardJSON);
    await uploadS3File(BUCKET.BOTS, hash + '.json', cardJSONBuffer);

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
