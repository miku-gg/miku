import JSZip from 'jszip';
import Hash from 'ipfs-only-hash';

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function generateZipFile(jsonData: object, images: string[]): Promise<Blob> {
  const zip = new JSZip();
  const _jsonString = JSON.stringify(jsonData, null, 2);
  const jsonName = await Hash.of(_jsonString);

  zip.file(jsonName, _jsonString);

  const imagesFolder = zip.folder('images');
  await Promise.all(images.map(async (image) => {
    const base64Image = image.split(',')[1];
    const imageHash = await Hash.of(base64Image);
    imagesFolder?.file(`${imageHash}`, base64Image, { base64: true });
  }));

  // Generate the zip file as a Blob
  return await zip.generateAsync({ type: 'blob' });
}