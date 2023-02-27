import fs from 'fs';
import { Request, Response } from "express";
import config from '../config';
const Hash = require('ipfs-only-hash');

async function uploadFile(img: Buffer): Promise<string> {
  const imgHash = await Hash.of(img) as string;
  const imgPath = `${config.IMG_PATH}/${imgHash}`;
  if (fs.existsSync(imgPath)) {
    return '';
  }
  fs.writeFileSync(imgPath, img, 'binary');
  return imgHash;
}

export default async function addImage(req: Request, res: Response) {
  try {

    if (req.file) {
      const result = await uploadFile(req.file.buffer)
      res.send(result);
    } else if(req.files && req.files.length) {
      // @ts-ignore
      const results = await Promise.all([...req.files].map((file: any) => uploadFile(file.buffer)));
      res.send(results.filter(_ => _).join('\n'));
    } else {
      res.status(401);
      return;
    }
  } catch (err) {
    res.status(400).send(err);
    return;
  }
  
}