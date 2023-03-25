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

export const checkImageDimensionsAndType = (file: File, types = ['image/png'], width=256, height=256): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      resolve(img.width === width && img.height === height && (!types || types.includes(file.type)));
    };
  });
}