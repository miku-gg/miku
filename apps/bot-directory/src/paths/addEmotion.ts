import fs from 'fs';
import { Request, Response } from "express";
import config from '../config';
const Hash = require('ipfs-only-hash');

export default async function addEmotion(req: Request, res: Response) {
  try {
    if (!req.file || Object.keys(req.file).length === 0) {
      throw 'No file uploaded.';
    }
  
    const _file = req.file;
    const emotion = _file.buffer;
    const emotionHash = await Hash.of(emotion) as string;
    const emotionPath = `${config.EMOTIONS_PATH}/${emotionHash}`;
    if (fs.existsSync(emotionPath)) {
      throw 'Emotion already exists';
    }
    fs.writeFileSync(emotionPath, emotion, 'binary');
    res.send(emotionHash);
  } catch (err) {
    res.status(400).send(err);
    return;
  }
  
}