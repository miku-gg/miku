import fs from 'fs';
import path from 'path';
import multer from 'multer';
import express, { Express, Request, Response } from 'express';
import { BUCKET, hashBase64 } from '@mikugg/bot-utils';
import sharp from 'sharp';
export { BUCKET } from '@mikugg/bot-utils';

const randomString = (length: number = 10) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

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

export const uploadAssetHandler = async (req: Request, res: Response): Promise<string> => {
  const _fileName = String(req.body.fileName);
  try {
    const contentType = String(req.body.contentType);
    if (!_fileName || !contentType) {
      res.status(400).send('No fileName or contentType.');
      return '';
    }
    // read file as buffer
    const filePath = path.join(path.join(dataDir, `assets/${_fileName}`));
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = await hashBase64(fileBuffer.toString('base64'));
    const fileName = `${fileHash}.${contentType.split('/')[1]}`;

    // change _fileName to fileName
    fs.renameSync(filePath, path.join(dataDir, `assets/${fileName}`));
    // Check if the file is an image
    if (contentType.startsWith('image/')) {
      let resizedImage;

      if (contentType === 'image/gif') {
        // Handling GIFs: Sharp doesn't support GIF resizing, so we just skip resizing for GIFs
        resizedImage = fileBuffer;
      } else {
        // Resize other image types
        resizedImage = await sharp(fileBuffer)
          .resize({ height: 480, fit: 'inside', withoutEnlargement: true })
          // @ts-ignore
          .toFormat(contentType.split('/')[1], { quality: 70 }) // Adjust quality for supported formats
          .toBuffer();
      }

      // Upload the resized image
      const resizedFileName = `480p_${fileName}`;
      fs.writeFileSync(path.join(dataDir, `assets/${resizedFileName}`), resizedImage);
    }
    res.send({
      fileName: fileName,
      fileSize: fileBuffer.length,
    });
    return fileName;
  } catch (err) {
    console.warn('Error resizing image:', _fileName);
    console.error(err);
    res.send({
      fileName: _fileName,
      fileSize: 0,
    });
    return '';
  }

  // check file extension
};

export default function s3ServerDecorator(app: Express): void {
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
        if (req.params.key.endsWith('.webm')) res.contentType('video/webm');
        if (req.params.key.endsWith('.mp4')) res.contentType('video/mp4');
        if (req.params.key.endsWith('.png')) res.contentType('image/png');
        if (req.params.key.endsWith('.jpg')) res.contentType('image/jpeg');
        if (req.params.key.endsWith('.jpeg')) res.contentType('image/jpeg');
        if (req.params.key.endsWith('.gif')) res.contentType('image/gif');
        if (req.params.key.endsWith('.mp3')) res.contentType('audio/mpeg');
        if (req.params.key.endsWith('.mpeg')) res.contentType('audio/mpeg');
        if (req.params.key.endsWith('.wav')) res.contentType('audio/wav');
        if (req.params.key.endsWith('.ogg')) res.contentType('audio/ogg');
        res.send(file);
      } else {
        res.status(404).send('File not found.');
      }
    });
  }

  app.get('/asset-upload/ask', (req, res) => {
    // check contentType query param
    const contentType = String(req.query.contentType);
    if (!contentType) {
      return res.status(400).send('No contentType query param.');
    }
    // check file extension
    const ext = contentType.split('/')[1];
    if (!ext) {
      return res.status(400).send('Invalid contentType.');
    }
    const fileName = `_temp_${Date.now()}_${randomString()}.${ext}`;

    res.send({
      url: `http://localhost:8585/asset-upload/presigned/${fileName}`,
      fileName: fileName,
    });
  });

  app.use('/asset-upload/presigned/:fileName', express.raw({ type: 'application/octet-stream', limit: '50mb' }));

  app.put('/asset-upload/presigned/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    if (!fileName) {
      return res.status(400).send('No fileName in path.');
    }

    const filePath = path.join(path.join(dataDir, `assets/${fileName}`));

    // Now `req.body` should be a Buffer
    fs.writeFile(filePath, req.body, (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).send('Error writing file.');
      }
      res.status(200).send('File uploaded successfully.');
    });
  });

  app.post('/asset-upload/complete', uploadAssetHandler);

  app.post('/asset-upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const ext = req.file.mimetype.split('/')[1];
    if (!ext) {
      return res.status(400).send('Invalid contentType.');
    }
    const fileName = `${Date.now()}_${randomString()}.${ext}`;
    const filePath = path.join(path.join(dataDir, `assets/${fileName}`));
    // @ts-ignore
    fs.writeFile(filePath, req.file.buffer, (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).send('Error writing file.');
      }
      res.status(200).send(fileName);
    });
  });
}
