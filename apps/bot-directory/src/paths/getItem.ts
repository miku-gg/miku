import { Request, Response } from "express";
import fs from "fs";
import config from "../config";


export default function getItem(responseType: 'json' | 'image' | 'string' | 'csv', folder: 'bots' | 'imgs' | 'emotions' | 'embeddings', req: Request, res: Response) {
  try {
    const hash = req.params?.hash || '';
    const itemPath = `${config.DB_PATH}/${folder}/${hash}`;
    if (!fs.existsSync(itemPath)) {
      throw `${folder} does not exist`;
    }
    if (responseType === 'json') {
      const raw = fs.readFileSync(itemPath, 'utf8');
      res.send(JSON.parse(raw));
    } else if (responseType === 'csv') {
      let raw = fs.readFileSync(itemPath, 'utf8');
      let csv = Buffer.from(raw, 'utf8');
      res.setHeader('Content-Type', 'text/csv');
      res.writeHead(200, {
        'Content-Type': 'text/csv'
      });
      res.end(csv);
    } else if(responseType === 'image') {
      let raw = fs.readFileSync(itemPath, 'base64');
      let img = Buffer.from(raw, 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
      });
      res.end(img);
      // res.end();
    } else {
      const raw = fs.readFileSync(itemPath, 'utf8');
      res.send(raw);
    }
  } catch (err) {
    res.status(400).send(err);
    return;
  }
  
}