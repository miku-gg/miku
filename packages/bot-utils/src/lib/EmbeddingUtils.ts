import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import { Buffer } from 'buffer';

// Function to create a CSV file from the EmotionGroup array
function createCSVForEmbeddings(items: { id: string; text: string }[]): string {
  const header = ['id', 'text'];
  const data = items.map((item) => [item.id, item.text]);

  const escapeField = (field: string) => {
    const escapedField = field.replace(/"/g, '""');
    return `"${escapedField}"`;
  };

  const csvData = [header, ...data].map((row) => row.map((field) => escapeField(field)).join(',')).join('\n');
  return csvData;
}

// Function to send the CSV file to the API and store the result as base64
async function embeddCSV(csv: string, sentenceEmbedderAPIEndpoint: string): Promise<string> {
  const formData = new FormData();

  formData.append('file', Buffer.from(csv, 'utf8'), 'data_to_embedd.csv');

  const response: AxiosResponse<string> = await axios.post(`${sentenceEmbedderAPIEndpoint}/encode_csv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'text',
  });

  return response.data;
}

export async function itemsEmbedder(
  items: { id: string; text: string }[],
  sentenceEmbedderAPIEndpoint: string,
): Promise<string> {
  try {
    const csv = createCSVForEmbeddings(items);
    const base64Result = await embeddCSV(csv, sentenceEmbedderAPIEndpoint);
    return base64Result;
  } catch (error) {
    console.error('An error occurred:', error);
    return '';
  }
}
