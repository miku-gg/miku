import fs from "fs";
import path from "path";
import multer from "multer";
import { Express } from "express";
import { BUCKET } from "@mikugg/bot-utils";
export { BUCKET } from "@mikugg/bot-utils";

const dataDir = path.join(__dirname, "../db"); // Directory to store files

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function uploadS3File(
  bucket: BUCKET,
  key: string,
  content: Buffer
): Promise<void> {
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

export default function s3ServerDecorator(app: Express): void {
  // for each bucket
  for (const bucket of Object.values(BUCKET)) {
    app.put(`/s3/${bucket}/:key`, upload.single("file"), async (req, res) => {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }
      await uploadS3File(bucket, req.params.key, req.file.buffer);
      res.status(200).send("File uploaded successfully.");
    });

    app.get(`/s3/${bucket}/:key`, (req, res) => {
      const file = getS3File(bucket, req.params.key);
      if (file) {
        if (req.params.key.endsWith(".webm")) res.contentType("video/webm");
        res.send(file);
      } else {
        res.status(404).send("File not found.");
      }
    });
  }

  app.get("/asset-upload/ask", (req, res) => {
    // check contentType query param
    const contentType = String(req.query.contentType);
    if (!contentType) {
      return res.status(400).send("No contentType query param.");
    }
    // check file extension
    const ext = contentType.split("/")[1];
    if (!ext) {
      return res.status(400).send("Invalid contentType.");
    }
    const fileName = `${Date.now()}.${ext}`;

    res.send({
      url: `http://localhost:8585/asset-upload/presigned/${fileName}`,
      fileName: fileName,
    });
  });

  app.post("/asset-upload/complete", (req, res) => {
    // check fileName and contentType from body json
    const fileName = String(req.body.fileName);
    const contentType = String(req.body.contentType);
    if (!fileName || !contentType) {
      return res.status(400).send("No fileName or contentType.");
    }
    // check file extension
    res.send({
      fileName: fileName,
      fileSize: 1,
    });
  });
}
