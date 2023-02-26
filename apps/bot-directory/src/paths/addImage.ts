import fs from 'fs';
import { Request, Response } from "express";
import config from '../config';
const Hash = require('ipfs-only-hash');

export default async function addImage(req: Request, res: Response) {
  try {
    if (!req.file || Object.keys(req.file).length === 0) {
      throw 'No file uploaded.';
    }
  
    const imgFile = req.file;
    const img = imgFile.buffer;
    const imgHash = await Hash.of(img) as string;
    const imgPath = `${config.IMG_PATH}/${imgHash}`;
    if (fs.existsSync(imgPath)) {
      throw 'Image already exists';
    }
    fs.writeFileSync(imgPath, img, 'binary');
    res.send(imgHash);
  } catch (err) {
    res.status(400).send(err);
    return;
  }
  
}