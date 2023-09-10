import {
  S3Client,
  S3ClientConfig,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

export type TavernCardV2 = {
  spec: 'chara_card_v2'
  spec_version: '2.0' // May 8th addition
  data: {
    name: string
    description: string
    personality: string
    scenario: string
    first_mes: string
    mes_example: string

    // New fields start here
    creator_notes: string
    system_prompt: string
    post_history_instructions: string
    alternate_greetings: Array<string>

    // May 8th additions
    tags: Array<string>
    creator: string
    character_version: string
    extensions: Record<string, any>
  }
}

export type MikuCard = TavernCardV2 & {
  data: {
    extensions: {
      mikugg: {
        license: string // LICENSE of the bot, set by the bot author
        language: string // Indicates the language of the bot, NOT used in the prompt
        short_description: string // Small description of the bot, NOT used in the prompt
        profile_pic: string // profile pic of the bot
        start_scenario: string // id of the first scenario
        scenarios: { // scenarios of the bot conversation
          id: string // id of the scenario
          name: string; // name of the scenario, only of labels in editor
          children_scenarios: string[] // ids of the scenarios that can be triggered from this scenario
          context: string // value to be inserted in the prompt when the scenario is triggered
          trigger_suggestion_similarity: string // keywords that can trigger this scenario, NOT in prompt
          trigger_action: string // text of the button that triggers this scenario, NOT in prompt
          background: string // id of the background to be used in this scenario
          emotion_group: string // id of the bot's emotion group to be used in this scenario
          voice: string // id of the bot's voice to be used in this scenario
        }[]
        emotion_groups: {
          id: string, // id of the emotion group
          name: string, // name of the emotion group, NOT used in the prompt
          template: string, // template of group of emotions to be used
          emotions: { // list of emotions of the group, derived from the template
            id: string, // id of the emotion
            source: string[] // [idleImg, talkingImg, ...], can be png or webm
          }[]
        }[]
        backgrounds: {
          id: string // id of the background
          description: string // description of the background, NOT used in the prompt
          source: string // hash of the background image, can be jpg, png or webm
        }[]
        voices: {
          id: string // id of the voice
          provider: string // provider of the voice (elevenlabs or azure)
          provider_voice_id: string // id of the voice in the provider
          provider_emotion?: string // emotion of the voice in the provider (optional)
          training_sample?: string // text sample used to train the voice (optional)
        }[]
      }
    }
  }
}

export default class BotCardConnector {
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