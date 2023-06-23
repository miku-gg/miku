import sharp from 'sharp';

export async function combineImages(firstImageBase64: string, secondImageBase64: string): Promise<string> {
    // Convert base64 strings to Buffers
    const firstImageBuffer = Buffer.from(firstImageBase64, 'base64');
    const secondImageBuffer = Buffer.from(secondImageBase64, 'base64');

    // Create sharp instances
    const firstImageSharp = sharp(firstImageBuffer);
    const secondImageSharp = sharp(secondImageBuffer);

    // Run image metadata fetches in parallel
    const [firstImageMetadata, secondImageMetadata] = await Promise.all([
        firstImageSharp.metadata(),
        secondImageSharp.metadata()
    ]);

    // Process the first image
    let firstImage;
    if ((firstImageMetadata.width || 0) > (firstImageMetadata.height || 0)) {
        firstImage = await firstImageSharp.resize({ height: 64, fit: 'cover' }).toBuffer();
    } else {
        firstImage = await firstImageSharp.resize({ width: 64, fit: 'cover' }).toBuffer();
    }

    // Process the second image
    const secondImage = await secondImageSharp.resize({ height: 64, fit: 'cover' }).toBuffer();

    // Run image processing in parallel
    const [processedFirstImage, processedSecondImage] = await Promise.all([firstImage, secondImage]);

    // Center the second image above the first one
    const finalImageBuffer = await sharp({
        create: {
            width: Math.max(firstImageMetadata.width || 0, secondImageMetadata.width || 0),
            height: 64,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
    .composite([
        { input: processedFirstImage, gravity: 'center' },
        { input: processedSecondImage, gravity: 'center' }
    ])
    .png()
    .toBuffer();

    // Convert the result to base64 and return
    return finalImageBuffer.toString('base64');
}
