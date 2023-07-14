import sharp from 'sharp';

type ReadFunction = (filename: string) => Promise<Buffer>;
type WriteFunction = (filename: string, data: Buffer) => Promise<void>;

interface Dimensions {
  width: number;
  height: number;
  maxBytes: number;
}

const sizes: { [suffix: string]: Dimensions } = {
  '_4k': { width: 3840, height: 2160, maxBytes: 300 * 1024 },
  '_1080p': { width: 1920, height: 1080, maxBytes: 150 * 1024 },
  '_720p': { width: 1280, height: 720, maxBytes: 100 * 1024 },
  '_480p': { width: 854, height: 480, maxBytes: 50 * 1024 }
}

export const resizeImages = async function (
  readFunction: ReadFunction,
  writeFunction: WriteFunction,
  filenames: string[]
): Promise<void> {
  for (const filename of filenames) {
    let fileBuffer = await readFunction(filename);
    const metadata = await sharp(fileBuffer).metadata();

    if (!['png', 'jpeg', 'gif'].includes(metadata.format as string)) {
      console.error(`${filename} is not a PNG, JPG or GIF image.`);
      continue;
    }

    // Reduce the resolution of the original image to 4K first
    let image = sharp(fileBuffer);

    if (Number(metadata.width) > sizes['_4k'].width || Number(metadata.height) > sizes['_4k'].height) {
      image = image.resize({
        width: sizes['_4k'].width,
        height: sizes['_4k'].height,
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    fileBuffer = await image.toBuffer();

    // Check the file size to determine the necessary quality reduction
    const quality = Math.ceil(Math.max(10, 100 - ((fileBuffer.length / sizes['_4k'].maxBytes) * 10)));

    if (metadata.format === 'jpeg') {
      fileBuffer = await sharp(fileBuffer).jpeg({ quality }).toBuffer();
    } else if (metadata.format === 'png') {
      fileBuffer = await sharp(fileBuffer).png({ quality }).toBuffer();
    }

    // Resize the 4K image to the smaller sizes
    for (const [suffix, size] of Object.entries(sizes)) {
      image = sharp(fileBuffer).resize({
        width: size.width,
        height: size.height,
        fit: 'inside',
        withoutEnlargement: true,
      });

      const newFilename = `${filename}${suffix}`;
      await writeFunction(newFilename, await image.toBuffer());
    }
  }
}
