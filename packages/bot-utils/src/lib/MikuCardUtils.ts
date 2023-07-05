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
import { Buffer } from 'buffer';
import { MikuCard } from '..';

function textDecode(data: any): {keyword: string, text: Buffer} {
  if (data.data && data.name) {
    data = data.data
  }

  let naming = true
  let name = '';
  const buffers = [];
  let textChunk = '';

  const CHUNK_SIZE = 10 * 1024 * 1024; // size of chunk in bytes

  for (let i = 0; i < data.length; i++) {
    const code = data[i]

    if (naming) {
      if (code) {
        name += String.fromCharCode(code)
      } else {
        naming = false
      }
    } else {
      if (code) {
        textChunk += String.fromCharCode(code)
      } else {
        throw new Error('Invalid NULL character found. 0x00 character is not permitted in tEXt content')
      }
    }

    // If the current text chunk has reached the maximum chunk size, or if this is the last iteration
    if (textChunk.length >= CHUNK_SIZE || i === data.length - 1) {
      // Decode the current text chunk and add it to the buffers array
      buffers.push(Buffer.from(textChunk, 'base64'));
      // Clear the current text chunk
      textChunk = '';
    }
  }

  // Concatenate all buffers into a single buffer
  const textBuffer = Buffer.concat(buffers);

  return {
    keyword: name,
    text: textBuffer
  }
}



function textDecode2 (data: any) {
  if (data.data && data.name) {
    data = data.data
  }

  let naming = true
  let text = ''
  let name = ''

  for (let i = 0; i < data.length; i++) {
    const code = data[i]

    if (naming) {
      if (code) {
        name += String.fromCharCode(code)
      } else {
        naming = false
      }
    } else {
      if (code) {
        text += String.fromCharCode(code)
      } else {
        throw new Error('Invalid NULL character found. 0x00 character is not permitted in tEXt content')
      }
    }
  }

  return {
    keyword: name,
    text: text
  }
}


async function getImageBuffer(file: File) {
  if (!file) return;
  const chunkSize = 1024 * 1024; // 1MB chunks
  let position = 0;
  const buffers: Uint8Array[] | Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    function readChunk() {
      const reader = new FileReader();

      if (position >= file.size) {
        // all chunks have been read
        resolve(Buffer.concat(buffers));
        return;
      }

      const chunk = file.slice(position, position + chunkSize);
      reader.readAsArrayBuffer(chunk);

      reader.onload = (evt) => {
        if (!evt.target?.result) return reject(new Error(`Failed to process image`));
        buffers.push(Buffer.from(evt.target.result as ArrayBuffer));
        position += chunkSize;
        readChunk();
      }

      reader.onerror = (err) => {
        reject(err);
      };
    }

    // start reading the first chunk
    readChunk();
  });
}

function readFile(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event?.target?.result;
      resolve(result);
    };

    reader.onerror = (event) => {
      reject(new Error("File could not be read! Code " + event?.target?.error));
    };

    reader.readAsText(file, 'utf-8'); // Read the file content as a text string with utf-8 encoding
  });
}

export async function extractCardFromBuffer(buffer?: any): Promise<object> {
  const extractions = extract(buffer as any)
  if (!extractions.length) {
    throw new Error('No extractions found')
  }
  const textExtractions = extractions
    .filter((d: {name: string}) => d.name === 'tEXt')
    .map((d: {data: any}) => textDecode(d.data))


  const [extracted] = textExtractions
  if (!extracted) {
    throw new Error(
      `No extractions of type tEXt found, found: ${extractions.map((e: {name: string}) => e.name).join(', ')}`
    )
  }

  let fileContent = '';

  if (typeof window !== 'undefined') {
    const blob = new Blob([extracted.text], { type: 'text/plain' });
    const file = new File([blob], 'testfile.json', { type: 'text/plain' });
    fileContent = await readFile(file) as string;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    fs.writeFileSync('_temp/_temp_bot.json', extracted.text);
    fileContent = fs.readFileSync('_temp/_temp_bot.json', 'utf-8');
  }

  try {
    return JSON.parse(fileContent as string);
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
