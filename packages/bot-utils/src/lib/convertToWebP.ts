import { AssetType } from '..';

async function _browser_convertToWebP_cover(image: Blob, width: number, height: number): Promise<Blob> {
  try {
    // Convert the image Blob to an HTMLImageElement
    const img = new Image();
    img.src = URL.createObjectURL(image);
    await new Promise((resolve) => (img.onload = resolve));

    // Create a canvas element for cropping
    const canvasCrop = document.createElement('canvas');
    const ctxCrop = canvasCrop.getContext('2d')!;
    canvasCrop.width = width;
    canvasCrop.height = height;

    // Calculate cropping dimensions based on aspect ratio
    let sx, sy, sWidth, sHeight;
    const aspectRatio = width / height;

    if (img.width / img.height > aspectRatio) {
      sHeight = img.height;
      sWidth = sHeight * aspectRatio;
      sx = (img.width - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = img.width;
      sHeight = sWidth / aspectRatio;
      sx = 0;
      sy = (img.height - sHeight) / 2;
    }

    // Draw the cropped image on the canvas
    ctxCrop.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);

    // Convert the canvas to WebP format
    const webpBlob = await new Promise<Blob>((resolve, reject) => {
      canvasCrop.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create WebP image'));
          }
        },
        'image/webp',
        0.8,
      );
    });

    if (!webpBlob) {
      throw new Error('Failed to convert image to WebP');
    }

    return webpBlob;
  } catch (error) {
    console.error('Error resizing and converting image to WebP:', error);
    throw error;
  }
}

export async function _browser_convertToWebP(image: Blob, width?: number, height?: number): Promise<Blob> {
  try {
    // Convert the image Blob to an HTMLImageElement
    const img = new Image();
    img.src = URL.createObjectURL(image);
    await new Promise((resolve) => (img.onload = resolve));

    // Calculate new dimensions
    let newWidth: number, newHeight: number;
    if (width && !height) {
      newWidth = width;
      newHeight = Math.round((width / img.width) * img.height);
    } else if (height && !width) {
      newHeight = height;
      newWidth = Math.round((height / img.height) * img.width);
    } else if (width && height) {
      return _browser_convertToWebP_cover(image, width, height);
    } else {
      throw new Error('Either width or height must be provided');
    }

    // Create a canvas element for resizing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw the resized image on the canvas
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Convert the canvas to WebP format
    const webpBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create WebP image'));
          }
        },
        'image/webp',
        0.8,
      );
    });

    if (!webpBlob) {
      throw new Error('Failed to convert image to WebP');
    }

    return webpBlob;
  } catch (error) {
    console.error('Error resizing and converting image to WebP:', error);
    throw error;
  }
}

export const _browser_convertAsset = async (
  file: File,
  type: AssetType,
): Promise<
  {
    name: string;
    blob: Blob;
  }[]
> => {
  switch (type) {
    case AssetType.NOVEL_PIC:
      return [
        {
          name: `256p/${file.name}`,
          blob: await _browser_convertToWebP(file, 256, 256),
        },
        {
          name: `136p/${file.name}`,
          blob: await _browser_convertToWebP(file, 292, 136),
        },
        {
          name: `40p/${file.name}`,
          blob: await _browser_convertToWebP(file, 40, 40),
        },
      ];
    case AssetType.ITEM_IMAGE:
      return [
        {
          name: `256p/${file.name}`,
          blob: await _browser_convertToWebP(file, 256, 256),
        },
        {
          name: `80p/${file.name}`,
          blob: await _browser_convertToWebP(file, 80, 80),
        },
        {
          name: `40p/${file.name}`,
          blob: await _browser_convertToWebP(file, 40, 40),
        },
      ];
    case AssetType.BACKGROUND_IMAGE: // 1080p, 720p and 360p
      return [
        {
          name: `1080p/${file.name}`,
          blob: await _browser_convertToWebP(file, 1920),
        },
        {
          name: `720p/${file.name}`,
          blob: await _browser_convertToWebP(file, 1280),
        },
        {
          name: `360p/${file.name}`,
          blob: await _browser_convertToWebP(file, 640),
        },
      ];
    case AssetType.CHARACTER_PIC:
      return [
        {
          name: `256p/${file.name}`,
          blob: await _browser_convertToWebP(file, 256, 256),
        },
        {
          name: `40p/${file.name}`,
          blob: await _browser_convertToWebP(file, 40, 40),
        },
      ];
    case AssetType.EMOTION_IMAGE:
      return [
        {
          name: `1080p/${file.name}`,
          blob: await _browser_convertToWebP(file, undefined, 1080),
        },
        {
          name: `720p/${file.name}`,
          blob: await _browser_convertToWebP(file, undefined, 720),
        },
        {
          name: `360p/${file.name}`,
          blob: await _browser_convertToWebP(file, undefined, 360),
        },
      ];
    case AssetType.MAP_IMAGE:
      return [
        {
          name: `1080p/${file.name}`,
          blob: await _browser_convertToWebP(file, undefined, 1080),
        },
        {
          name: `720p/${file.name}`,
          blob: await _browser_convertToWebP(file, undefined, 720),
        },
        {
          name: `360p/${file.name}`,
          blob: await _browser_convertToWebP(file, undefined, 360),
        },
      ];
    case AssetType.MAP_IMAGE_PREVIEW:
      return [
        {
          name: `360p/${file.name}`,
          blob: await _browser_convertToWebP(file, undefined, 360),
        },
      ];
    case AssetType.MAP_MASK:
      return [
        {
          name: `1080p/${file.name}`,
          blob: await _browser_convertToWebP(file, undefined, 1080),
        },
        {
          name: `720p/${file.name}`,
          blob: await _browser_convertToWebP(file, undefined, 720),
        },
        {
          name: `360p/${file.name}`,
          blob: await _browser_convertToWebP(file, undefined, 360),
        },
      ];
    default:
      return [
        {
          name: file.name,
          blob: file,
        },
      ];
  }
};
