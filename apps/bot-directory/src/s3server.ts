import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Express } from 'express';
import { BUCKET } from '@mikugg/bot-utils';
export { BUCKET } from '@mikugg/bot-utils';

const dataDir = path.join(__dirname, '../db'); // Directory to store files

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

export function uploadS3File(bucket: BUCKET, key: string, content: Buffer): Promise<void> {
  const filePath = path.join(dataDir, `${bucket}/${key}`);
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function getS3File(bucket: BUCKET, key: string): Buffer | null {
  const filePath = path.join(dataDir, `${bucket}/${key}`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }
  return null;
}


const upload = multer({ storage: multer.memoryStorage() });

export default function s3ServerDecorator(app: Express): void{
  // for each bucket
  for (const bucket of Object.values(BUCKET)) {
    app.put(`/s3/${bucket}/:key`, upload.single('file'), async (req, res) => {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        await uploadS3File(bucket, req.params.key, req.file.buffer);
        res.status(200).send('File uploaded successfully.');
    });

    app.get(`/s3/${bucket}/:key`, (req, res) => {
        const file = getS3File(bucket, req.params.key);
        if (file) {
            res.send(file);
        } else {
            res.status(404).send('File not found.');
        }
    });
  }
}