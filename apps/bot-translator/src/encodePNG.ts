import extract from 'png-chunks-extract';
import text from 'png-chunk-text';
import { Buffer } from 'buffer';
import { Crc32 } from '@aws-crypto/crc32';

export enum BUILDING_STEPS {
  STEP_0_NOT_BUILDING = 0,
  STEP_1_COMBINE_IMAGE = 1,
  STEP_2_GENERATING_CHUNKS = 2,
  STEP_3_ENCODING_CHUNKS = 3,
  STEP_4_BUILDING_DOWNLOAD_FILE = 4,
  STEP_5_DONE = 5,
}

// Used for fast-ish conversion between uint8s and uint32s/int32s.
// Also required in order to remain agnostic for both Node Buffers and
// Uint8Arrays.
const uint8 = new Uint8Array(4);
const int32 = new Int32Array(uint8.buffer);
const uint32 = new Uint32Array(uint8.buffer);

function encodeChunks(chunks) {
  let totalSize = 8;
  let idx = totalSize;
  let i;

  for (i = 0; i < chunks.length; i++) {
    totalSize += chunks[i].data.length;
    totalSize += 12;
  }

  const output = new Uint8Array(totalSize);

  output[0] = 0x89;
  output[1] = 0x50;
  output[2] = 0x4e;
  output[3] = 0x47;
  output[4] = 0x0d;
  output[5] = 0x0a;
  output[6] = 0x1a;
  output[7] = 0x0a;

  for (i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const name = chunk.name;
    const data = chunk.data;
    const size = data.length;
    const nameChars = [name.charCodeAt(0), name.charCodeAt(1), name.charCodeAt(2), name.charCodeAt(3)];

    uint32[0] = size;
    output[idx++] = uint8[3];
    output[idx++] = uint8[2];
    output[idx++] = uint8[1];
    output[idx++] = uint8[0];

    output[idx++] = nameChars[0];
    output[idx++] = nameChars[1];
    output[idx++] = nameChars[2];
    output[idx++] = nameChars[3];

    for (let j = 0; j < size; ) {
      output[idx++] = data[j++];
    }

    const crc32obj = new Crc32();
    nameChars.forEach((char) => crc32obj.update(Buffer.from([char])));
    for (let j = 0; j < size; j++) {
      crc32obj.update(Buffer.from([data[j]]));
    }
    const _crc = crc32obj.digest();

    int32[0] = _crc;
    output[idx++] = uint8[3];
    output[idx++] = uint8[2];
    output[idx++] = uint8[1];
    output[idx++] = uint8[0];
  }

  return output;
}

async function encodeLargeStringToBase64(s) {
  const blob = new Blob([s], { type: 'text/plain' }); // create a blob from the string
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = function () {
      resolve(((reader.result as string) || '').split(',')[1]); // resolve with the Base64 string
    };
    reader.onerror = reject; // reject on error
    reader.readAsDataURL(blob); // read the blob as a data URL (which will be a Base64 string)
  });
}

// stolen from agnai :v
export async function downloadPng(
  charJson: string,
  charImgUrl: string,
  charName: string,
  setBuildingStep: (step: BUILDING_STEPS) => void,
) {
  // Create a new image element
  setBuildingStep(BUILDING_STEPS.STEP_1_COMBINE_IMAGE);
  const imgElement = document.createElement('img');
  imgElement.setAttribute('crossorigin', 'anonymous');
  imgElement.src = charImgUrl;
  imgElement.onload = async () => {
    setBuildingStep(BUILDING_STEPS.STEP_2_GENERATING_CHUNKS);
    const chunksToExport = await (async function () {
      let imgDataUrl = imgToPngDataUrl(imgElement);
      let imgBase64Data = imgDataUrl.split(',')[1];
      imgDataUrl = '';
      const imgBuffer: Buffer | null = Buffer.from(atob(imgBase64Data), 'binary');
      imgBase64Data = '';

      const chunksNo_tEXt = extract(imgBuffer).filter((chunk) => chunk.name !== 'tEXt');
      const base64EncodedJson = await encodeLargeStringToBase64(charJson);
      const lastChunkIndex = chunksNo_tEXt.length - 1;
      return [
        ...chunksNo_tEXt.slice(0, lastChunkIndex),
        text.encode('chara', base64EncodedJson),
        chunksNo_tEXt[lastChunkIndex],
      ];
    })();
    setBuildingStep(BUILDING_STEPS.STEP_3_ENCODING_CHUNKS);
    const downloadLink = document.createElement('a');
    const encodedpng = encodeChunks(chunksToExport);
    setBuildingStep(BUILDING_STEPS.STEP_4_BUILDING_DOWNLOAD_FILE);
    const pngbuffer = Buffer.from(encodedpng);
    downloadLink.href = URL.createObjectURL(new Blob([pngbuffer]));
    downloadLink.download = charName + '.card.png';
    downloadLink.click();
    setBuildingStep(BUILDING_STEPS.STEP_5_DONE);
    URL.revokeObjectURL(downloadLink.href);
  };
}

function imgToPngDataUrl(imgElement: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(imgElement, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl;
}
