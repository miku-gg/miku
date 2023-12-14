import {
  S3Client,
  S3ClientConfig,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { MikuCard } from '../card';

function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

export class BotCardConnector {
  private s3Bucket: string;
  private client

  constructor(s3Bucket: string, config: S3ClientConfig) {
    this.s3Bucket = s3Bucket;
    this.client = new S3Client(config);
  }

  public async getBotCard(hash: string): Promise<MikuCard> {
    const command = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: hash,
    });
    const response = await this.client.send(command);
    const body = await streamToString(response.Body as Readable);
    return JSON.parse(body);
  }
}

export function parseAttributes(s: string): [string, string][] {
  return s.split("\n").map((x) => {
    const [a = '', b = ''] = x.split(": ");
    return [a.trim(), b.trim()];
  });
}

export function parseExampleMessages(s: string): string[] {
  return s.split("<START>\n").map((x) => x.trim()).filter(x => x);
}