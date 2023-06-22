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
function createCSVForEmbeddings(items: {id: string, text: string}[]): string {
  const header = ['id', 'text'];
  const data = items.map((item) => [item.id, item.text]);


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
  formData.append('file', csvBlob, 'data_to_embedd.csv');

  const response: AxiosResponse<string>  = await axios.post(`${sentenceEmbedderAPIEndpoint}/encode_csv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'text',
  });

  return response.data;
}

export async function itemsEmbedder(items: {id: string, text: string}[]): Promise<string> {
  try {
    const csv = createCSVForEmbeddings(items);
    const base64Result = await embeddCSV(csv);
    return base64Result;
  } catch (error) {
    console.error('An error occurred:', error);
    return '';
  }
}

export async function emotionGroupsEmbedder(groups: EmotionGroup[]): Promise<string> {
  return itemsEmbedder(groups.map(group => ({id: group.name, text: group.description})))
}
