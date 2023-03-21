export async function sha256(message): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const digest = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(digest));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

export const hashBase64 = async (base64Content: string): Promise<string> => {
  return sha256(base64Content.split(',')[1]);
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