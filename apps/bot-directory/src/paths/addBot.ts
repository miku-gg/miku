import { readFileSync } from 'fs';
import { Request, Response } from "express";
import { MikuCard } from "@mikugg/bot-utils";
import { mikuCardUploader } from '@mikugg/bot-utils';
import { uploadS3File } from '../s3server';
import sharp from 'sharp';
// Registers a bot configuration
export default async function addBot(req: Request, res: Response) {
  try {
    if (!req.file?.path) throw 'file not found';
    if (!req.file?.originalname.endsWith('.json')) throw 'Invalid file type, only .json is supported';

    const buffer = readFileSync(req.file.path);
    const mikuCard = JSON.parse(buffer.toString('utf-8')) as MikuCard;

    const processUpload = mikuCardUploader(
      mikuCard,
      {
        upload: async (bucket, key, content) => {
          await uploadS3File(bucket, key, content);
        },
        // @ts-ignore
        sharp: sharp,
      }
    )

    for await (const percentage of processUpload) {
      console.log(`Upload progress: ${(percentage * 100).toFixed(2)}%`);
    }
  
    console.log("Upload complete!");

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
