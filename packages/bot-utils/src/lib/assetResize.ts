export interface ISharp {
  metadata(): Promise<{
    format: string;
    width: number;
    height: number;
  }>;

  resize(options: {
    width: number;
    height: number;
    fit: 'inside';
    withoutEnlargement: boolean;
  }): ISharp;

  jpeg(options: { quality: number }): ISharp;
  png(options: { quality: number }): ISharp;

  toBuffer(): Promise<Buffer>;
}


type WriteFunction = (filename: string, data: Buffer) => Promise<void>;

interface Dimensions {
  width: number;
  height: number;
  maxBytes: number;
}

const sizes: { [prefix: string]: Dimensions } = {
  '4k_': { width: 3840, height: 2160, maxBytes: 300 * 1024 },
  '1080p_': { width: 1920, height: 1080, maxBytes: 150 * 1024 },
  '720p_': { width: 1280, height: 720, maxBytes: 100 * 1024 },
  '480p_': { width: 854, height: 480, maxBytes: 50 * 1024 }
}

export const resizeImage = async function (
  sharp: (buffer: Buffer) => ISharp,
  writeFunction: WriteFunction,
  filename: string,
  fileBuffer: Buffer,
): Promise<void> {
  const metadata = await sharp(fileBuffer).metadata();

  if (!['png', 'jpeg', 'gif', 'webp'].includes(metadata.format as string)) {
    console.error(`${filename} is not a PNG, WEBP, JPG or GIF image.`);
    return;
  }

  // Reduce the resolution of the original image to 4K first
  let image = sharp(fileBuffer);

  if (Number(metadata.width) > sizes['4k_'].width || Number(metadata.height) > sizes['4k_'].height) {
    image = image.resize({
      width: sizes['4k_'].width,
      height: sizes['4k_'].height,
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  fileBuffer = await image.toBuffer();

  // Check the file size to determine the necessary quality reduction
  const quality = Math.ceil(Math.max(10, 100 - ((fileBuffer.length / sizes['4k_'].maxBytes) * 10)));

  if (metadata.format === 'jpeg') {
    fileBuffer = await sharp(fileBuffer).jpeg({ quality }).toBuffer();
  } else if (metadata.format === 'png') {
    fileBuffer = await sharp(fileBuffer).png({ quality }).toBuffer();
  }

  // Resize the 4K image to the smaller sizes
  for (const [prefix, size] of Object.entries(sizes)) {
    image = sharp(fileBuffer).resize({
      width: size.width,
      height: size.height,
      fit: 'inside',
      withoutEnlargement: true,
    });

    const newFilename = `${prefix}${filename}`;
    await writeFunction(newFilename, await image.toBuffer());
  }
}
