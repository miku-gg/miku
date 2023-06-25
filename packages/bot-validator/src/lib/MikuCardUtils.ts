import Hash from 'ipfs-only-hash';

export async function stringToIPFSHash(context: string): Promise<string> {
  return await Hash.of(context) as string;
}

export async function hashBase64(base64Value: string) {
  const ipfsHash = await stringToIPFSHash(base64Value);
  return ipfsHash;
}

export const hashBase64URI = async (base64Content: string): Promise<string> => {
  return hashBase64(base64Content.split(',')[1]);
}

import extract from 'png-chunks-extract'
import text from 'png-chunk-text'
import { Buffer } from 'buffer';
import { MikuCard } from '..';

async function getImageBuffer(file?: File) {
  if (!file) return
  const reader = new FileReader()

  return new Promise<Buffer>((resolve, reject) => {
    reader.readAsArrayBuffer(file)

    reader.onload = (evt) => {
      if (!evt.target?.result) return reject(new Error(`Failed to process image`))
      resolve(Buffer.from(evt.target.result as ArrayBuffer))
    }
  })
}

export async function extractCardFromBuffer(buffer?: any): Promise<object> {
  const extractions = extract(buffer as any)
  if (!extractions.length) {
    throw new Error('No extractions found')
  }
  const textExtractions = extractions
    .filter((d: {name: string}) => d.name === 'tEXt')
    .map((d: {data: any}) => text.decode(d.data))

  const [extracted] = textExtractions
  if (!extracted) {
    throw new Error(
      `No extractions of type tEXt found, found: ${extractions.map((e: {name: string}) => e.name).join(', ')}`
    )
  }

  const data = Buffer.from(extracted.text, 'base64').toString('utf-8')

  try {
    return JSON.parse(data);
  } catch (ex: any) {
    throw new Error(`Failed parsing tavern data as JSON: ${ex.message}`)
  }
}

export async function extractCardData(file: File): Promise<object> {
  const buffer = await getImageBuffer(file);
  return extractCardFromBuffer(buffer);
}

export const extractMikuCardImages = async (card: MikuCard): Promise<{
  images: Map<string, string>,
  card: MikuCard
}> => {
  const { mikugg } = card.data.extensions;
  const images = new Map<string, string>([]);

  const profile_pic = await hashBase64URI(mikugg.profile_pic);
  images.set(profile_pic, mikugg.profile_pic);
  const backgrounds = await Promise.all(
    mikugg.backgrounds.map(async (bg) => {
      const bgHash = await hashBase64URI(bg.source);
      images.set(bgHash, bg.source);
      return {
        ...bg,
        source: bgHash,
      };
    })
  );
  const emotion_groups = await Promise.all(
    mikugg.emotion_groups.map(async (emotion_group) => {
      return {
        ...emotion_group,
        emotions: await Promise.all(
          emotion_group.emotions.map(async (emotion) => {
            return {
              ...emotion,
              source: await Promise.all(
                emotion.source.map(async (source) => {
                  const sourceHash = await hashBase64URI(source);
                  images.set(sourceHash, source);
                  return sourceHash;
                })
              ),
            };
          })
        ),
      };
    })
  );

  return {
    card: {
      ...card,
      data: {
        ...card.data,
        extensions: {
          ...card.data.extensions,
          mikugg: {
            ...card.data.extensions.mikugg,
            profile_pic,
            backgrounds,
            emotion_groups,
          },
        },
      },
    },
    images
  };
};
