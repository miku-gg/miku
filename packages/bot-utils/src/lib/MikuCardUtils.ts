import Hash from 'ipfs-only-hash';

export async function stringToIPFSHash(context: string): Promise<string> {
  return (await Hash.of(context)) as string;
}

export async function hashBase64(base64Value: string) {
  const ipfsHash = await stringToIPFSHash(base64Value);
  return ipfsHash;
}

export const hashBase64URI = async (base64Content: string): Promise<string> => {
  return hashBase64(base64Content.split(',')[1]);
};

import extract from 'png-chunks-extract';
import { Buffer } from 'buffer';
import { MikuCard, MikuCardV2, TavernCardV2 } from '..';

function textDecode(data: any): { keyword: string; text: Buffer } {
  if (data.data && data.name) {
    data = data.data;
  }

  let naming = true;
  let name = '';
  const buffers = [];
  let textChunk = '';

  const CHUNK_SIZE = 10 * 1024 * 1024; // size of chunk in bytes

  for (let i = 0; i < data.length; i++) {
    const code = data[i];

    if (naming) {
      if (code) {
        name += String.fromCharCode(code);
      } else {
        naming = false;
      }
    } else {
      if (code) {
        textChunk += String.fromCharCode(code);
      } else {
        throw new Error('Invalid NULL character found. 0x00 character is not permitted in tEXt content');
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
    text: textBuffer,
  };
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
      };

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
      reject(new Error('File could not be read! Code ' + event?.target?.error));
    };

    reader.readAsText(file, 'utf-8'); // Read the file content as a text string with utf-8 encoding
  });
}

export async function extractCardFromBuffer(buffer?: any): Promise<object> {
  const extractions = extract(buffer as any);
  if (!extractions.length) {
    throw new Error('No extractions found');
  }
  const textExtractions = extractions
    .filter((d: { name: string }) => d.name === 'tEXt')
    .map((d: { data: any }) => textDecode(d.data));

  const [extracted] = textExtractions;
  if (!extracted) {
    throw new Error(
      `No extractions of type tEXt found, found: ${extractions.map((e: { name: string }) => e.name).join(', ')}`,
    );
  }

  let fileContent = '';

  if (typeof window !== 'undefined') {
    const blob = new Blob([extracted.text], { type: 'text/plain' });
    const file = new File([blob], 'testfile.json', { type: 'text/plain' });
    fileContent = (await readFile(file)) as string;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stream = require('stream');
    fileContent = await new Promise((resolve, reject) => {
      const bufferStream = new stream.PassThrough();
      let text = '';
      bufferStream.end(extracted.text);
      bufferStream.on('data', (chunk: Buffer) => {
        text += chunk.toString('utf8');
      });

      bufferStream.on('end', () => {
        resolve(text);
      });
    });
  }

  try {
    return JSON.parse(fileContent as string);
  } catch (ex: any) {
    throw new Error(`Failed parsing tavern data as JSON: ${ex.message}`);
  }
}

export async function extractCardData(file: File): Promise<object> {
  const buffer = await getImageBuffer(file);
  return extractCardFromBuffer(buffer);
}

export const extractMikuCardAssets = async (
  card: MikuCard,
): Promise<{
  images: Map<string, string>;
  audios: Map<string, string>;
  card: MikuCard;
}> => {
  const { mikugg } = card.data.extensions;
  const images = new Map<string, string>([]);
  const audios = new Map<string, string>([]);

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
    }),
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
                }),
              ),
            };
          }),
        ),
      };
    }),
  );

  const sounds = await Promise.all(
    mikugg.sounds?.map(async (sound) => {
      const soundHash = await hashBase64URI(sound.source);
      audios.set(soundHash, sound.source);
      return {
        ...sound,
        source: soundHash,
      };
    }) || [],
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
            sounds,
          },
        },
      },
    },
    images,
    audios,
  };
};

export const tavernCardV2ToMikuCard = (json: TavernCardV2): MikuCard => {
  const default_scenario_id = 'default_scene';
  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: String(json.data.name) || '',
      description: String(json.data.description) || '',
      first_mes: String(json.data.first_mes) || '',
      personality: String(json.data.personality) || '',
      mes_example: String(json.data.mes_example) || '',
      scenario: String(json.data.scenario),
      alternate_greetings: [...(json.data.alternate_greetings || []).map((greeting) => String(greeting) || '')],
      system_prompt: String(json.data.system_prompt) || '',
      post_history_instructions: String(json.data.post_history_instructions) || '',
      creator: String(json.data.creator) || '',
      character_version: String(json.data.character_version) || '',
      tags: [...(json.data.tags || []).map((tag) => String(tag) || '')],
      creator_notes: String(json.data.creator_notes) || '',
      character_book: json.data.character_book
        ? {
            ...json.data.character_book,
            name: String(json.data.character_book.name) || '',
            description: String(json.data.character_book.description) || '',
            scan_depth: Number(json.data.character_book.scan_depth) || 0,
            token_budget: Number(json.data.character_book.token_budget) || 0,
            recursive_scanning: Boolean(json.data.character_book.recursive_scanning) || false,
            entries: json.data.character_book.entries.map((entry) => ({
              ...entry,
              keys: entry.keys.map((key) => String(key) || ''),
              content: String(entry.content) || '',
              enabled: Boolean(entry.enabled) || false,
              insertion_order: Number(entry.insertion_order) || 0,
            })),
          }
        : undefined,
      extensions: {
        ...(json.data.extensions || {}),
        mikugg: {
          ...(json.data.extensions?.mikugg || {}),
          license: json.data.extensions?.mikugg?.license || 'CC BY',
          language: json.data.extensions?.mikugg?.language || 'en',
          profile_pic: json.data.extensions?.mikugg?.profile_pic || '',
          short_description: json.data.extensions?.mikugg?.short_description || '',
          start_scenario:
            json.data.extensions?.mikugg?.start_scenario || json.data.extensions?.mikugg?.scenarios?.length
              ? json.data.extensions?.mikugg?.scenarios[0].id
              : default_scenario_id,
          scenarios: json.data.extensions?.mikugg?.scenarios?.length
            ? json.data.extensions?.mikugg?.scenarios?.map(
                // eslint-disable-next-line
                // @ts-ignore
                (scenario) => ({
                  ...scenario,
                  name: String(scenario.name) || '',
                  children_scenarios: scenario.children_scenarios.map(
                    // eslint-disable-next-line
                    // @ts-ignore
                    (child) => String(child) || '',
                  ),
                  context: String(scenario.context) || '',
                  trigger_suggestion_similarity: String(scenario.trigger_suggestion_similarity) || '',
                  trigger_action: String(scenario.trigger_action) || '',
                  background: String(scenario.background) || '',
                  emotion_group: String(scenario.emotion_group) || '',
                  voice: String(scenario.voice) || '',
                }),
              )
            : [
                {
                  id: default_scenario_id,
                  name: 'scenario-1',
                  children_scenarios: [],
                  context: '',
                  trigger_suggestion_similarity: '',
                  trigger_action: '',
                  background: '',
                  emotion_group: '',
                  voice: '',
                },
              ],
          emotion_groups:
            // eslint-disable-next-line
            // @ts-ignore
            json.data.extensions?.mikugg?.emotion_groups?.map((group) => ({
              ...group,
              emotions:
                // eslint-disable-next-line
                // @ts-ignore
                group.emotions.map((emotion) => ({
                  ...emotion,
                  // eslint-disable-next-line
                  // @ts-ignore
                  source: emotion.source.map((src) => String(src) || ''),
                })) || [],
            })) || [],
          backgrounds:
            // eslint-disable-next-line
            // @ts-ignore
            json.data.extensions?.mikugg?.backgrounds?.map((bg) => ({
              ...bg,
              description: String(bg.description) || '',
              source: String(bg.source) || '',
            })) || [],
          voices: json.data.extensions?.mikugg?.voices
            ? // eslint-disable-next-line
              // @ts-ignore
              json.data.extensions?.mikugg?.voices?.map((voice) => ({
                ...voice,
                id: String(voice.id) || '',
                provider: String(voice.provider) || '',
                provider_voice_id: String(voice.provider_voice_id) || '',
                provider_emotion: voice.provider_emotion ? String(voice.provider_emotion) : undefined,
                training_sample: voice.training_sample ? String(voice.training_sample) : undefined,
              }))
            : [
                {
                  id: 'azure_tts.en-GB-SoniaNeural',
                  provider: 'azure_tts',
                  provider_voice_id: 'en-GB-SoniaNeural',
                  provider_emotion: 'sad',
                },
              ],
        },
      },
    },
  };
};

export const mikuCardToMikuCardV2 = (mikuCard: MikuCard): MikuCardV2 => {
  const {
    extensions: { mikugg },
  } = mikuCard.data;

  const outfits: MikuCardV2['data']['extensions']['mikugg_v2']['outfits'] = mikugg.emotion_groups.map((group) => ({
    id: group.id,
    template: group.template,
    name: group.name,
    description: group.name,
    attributes: [],
    nsfw: group.template === 'lewd-emotions' ? 1 : 0,
    emotions: group.emotions.map((emotion) => ({
      id: emotion.id,
      sources: {
        png: emotion.source[0], // Assuming first source is png
        webm: emotion.source.length > 1 ? emotion.source[1] : undefined, // Assuming second source, if exists, is webm
        sound: emotion.sound,
      },
    })),
  }));

  // Construct the new MikuCardV2 format
  return {
    ...mikuCard, // Copy over existing structure
    data: {
      ...mikuCard.data,
      extensions: {
        mikugg_v2: {
          license: mikugg.license,
          language: mikugg.language,
          short_description: mikugg.short_description,
          profile_pic: mikugg.profile_pic,
          nsfw: 0, // Assuming default as no information provided
          outfits,
        },
      },
    },
  };
};
