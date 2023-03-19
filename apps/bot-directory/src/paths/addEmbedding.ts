import fs from 'fs';
import { Request, Response } from "express";
import config from '../config';
const Hash = require('ipfs-only-hash');

export default async function addEmbedding(req: Request, res: Response) {
  try {
    if (!req.file || Object.keys(req.file).length === 0) {
      throw 'No file uploaded.';
    }
  
    const _file = req.file;
    const embeddings = _file.buffer;
    const embeddingsHash = await Hash.of(embeddings) as string;
    const embeddingsPath = `${config.EMBEDDINGS_PATH}/${embeddingsHash}`;
    if (fs.existsSync(embeddingsPath)) {
      throw 'Embedding already exists';
    }
    fs.writeFileSync(embeddingsPath, embeddings, 'binary');
    res.send(embeddingsHash);
  } catch (err) {
    res.status(400).send(err);
    return;
  }
  
}