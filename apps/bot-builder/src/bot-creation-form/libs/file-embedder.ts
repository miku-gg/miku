import axios, { AxiosResponse } from 'axios';
import base64 from 'base-64';
import { EmotionGroup } from './CharacterData';

const sentenceEmbedderAPIEndpoint = import.meta.env.PROD ? 'https://sentence-embedder.apis.miku.gg' : 'http://localhost:8600';

function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return base64.encode(binary);
}

// Function to create a CSV file from the EmotionGroup array
function createCSVFromEmotionGroups(groups: EmotionGroup[]): string {
  const header = ['id', 'text'];
  const data = groups.map((group) => [group.name, group.description]);


  const escapeField = (field: string) => {
    const escapedField = field.replace(/"/g, '""');
    return `"${escapedField}"`;
  };

  const csvData = [header, ...data]
    .map((row) => row.map((field) => escapeField(field)).join(','))
    .join('\n');
  return csvData;
}

// Function to send the CSV file to the API and store the result as base64
async function embeddCSV(csv: string): Promise<string> {
  const formData = new FormData();
  const csvBlob = new Blob([csv], { type: 'text/csv' });
  formData.append('file', csvBlob, 'emotion-groups.csv');

  const response: AxiosResponse<ArrayBuffer>  = await axios.post(`${sentenceEmbedderAPIEndpoint}/encode_csv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'arraybuffer',
  });

  return arrayBufferToBase64(response.data);
}

export async function emotionGroupsEmbedder(groups: EmotionGroup[]): Promise<string> {
  try {
    const csv = createCSVFromEmotionGroups(groups);
    console.log(csv);
    const base64Result = await embeddCSV(csv);
    console.log('base64Result:', base64Result);
    return base64Result;
  } catch (error) {
    console.error('An error occurred:', error);
    return '';
  }
}
