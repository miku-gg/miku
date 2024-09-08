import { AssetType } from './novel/NovelUtils';
import axios, { AxiosResponse } from 'axios';

export enum BUCKET {
  BOTS = 'bots',
  ASSETS = 'assets',
}

export enum AssetDisplayPrefix {
  NOVEL_PIC = '256p/',
  NOVEL_PIC_SMALL = '80p/',

  ITEM_IMAGE = '256p/',
  ITEM_IMAGE_SMALL = '128p/',
  ITEM_IMAGE_TINY = '80p/',

  BACKGROUND_IMAGE = '1080p/',
  BACKGROUND_IMAGE_SMALL = '360p/',

  CHARACTER_PIC = '256p/',
  CHARACTER_PIC_SMALL = '80p/',

  EMOTION_IMAGE = '1080p/',
  EMOTION_IMAGE_SMALL = '128p/',

  MAP_IMAGE = '1080p/',
  MAP_IMAGE_SMALL = '720p/',
  MAP_IMAGE_TINY = '360p/',
  MAP_IMAGE_PREVIEW = '360p/',

  MAP_MASK = '1080p/',
  MAP_MASK_SMALL = '720p/',
  MAP_MASK_TINY = '360p/',

  PROFILE_PIC = '256p/',
  PROFILE_PIC_SMALL = '80p/',

  NOVEL_AD = '1080p/',
  NOVEL_AD_SMALL = '272p/',

  NOVEL_SCREENSHOT = '720p/',
  NOVEL_SCREENSHOT_SMALL = '272p/',

  NOVEL_SHARE = '720p/',

  EMOTION_ANIMATED = '',
  EMOTION_SOUND = '',
  BACKGROUND_VIDEO = '',
  MAP_VIDEO = '',
  MUSIC = '',
  NOVEL_AD_VIDEO = '',
}

export const assetTypeToAssetDisplayPrefix: Record<AssetType, AssetDisplayPrefix> = {
  NOVEL_PIC: AssetDisplayPrefix.NOVEL_PIC,
  CHARACTER_PIC: AssetDisplayPrefix.CHARACTER_PIC,
  EMOTION_IMAGE: AssetDisplayPrefix.EMOTION_IMAGE,
  EMOTION_ANIMATED: AssetDisplayPrefix.EMOTION_ANIMATED,
  EMOTION_SOUND: AssetDisplayPrefix.EMOTION_SOUND,
  BACKGROUND_IMAGE: AssetDisplayPrefix.BACKGROUND_IMAGE,
  BACKGROUND_VIDEO: AssetDisplayPrefix.BACKGROUND_VIDEO,
  MAP_IMAGE: AssetDisplayPrefix.MAP_IMAGE,
  MAP_MASK: AssetDisplayPrefix.MAP_MASK,
  MAP_IMAGE_PREVIEW: AssetDisplayPrefix.MAP_IMAGE_PREVIEW,
  MAP_VIDEO: AssetDisplayPrefix.MAP_VIDEO,
  MUSIC: AssetDisplayPrefix.MUSIC,
  ITEM_IMAGE: AssetDisplayPrefix.ITEM_IMAGE,
  PROFILE_PIC: AssetDisplayPrefix.PROFILE_PIC,
  NOVEL_AD: AssetDisplayPrefix.NOVEL_AD,
  NOVEL_SCREENSHOT: AssetDisplayPrefix.NOVEL_SCREENSHOT,
  NOVEL_AD_VIDEO: AssetDisplayPrefix.NOVEL_AD_VIDEO,
  NOVEL_SHARE: AssetDisplayPrefix.NOVEL_SHARE,
};

export const getAssetLink = (
  sources: {
    optimized: string;
    fallback: string;
  } = {
    optimized: '',
    fallback: '',
  },
  asset = '',
  display: AssetDisplayPrefix,
) => {
  if (asset.startsWith('optimized/')) {
    return `${sources.optimized}/${display}${asset}`;
  } else {
    return `${sources.fallback}/${asset}`;
  }
};

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

export async function convertToWebP(image: Blob, width?: number, height?: number): Promise<Blob> {
  try {
    // Convert the image Blob to an HTMLImageElement
    const img = new Image();
    img.src = URL.createObjectURL(image);
    await new Promise((resolve) => (img.onload = resolve));

    // Check if it's gif
    if (image.type === 'image/gif') {
      return image;
    }

    // no image no resize
    if (!img.width || !img.height) {
      return image;
    }

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
      newWidth = img.width;
      newHeight = img.height;
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

export async function dataURLtoFile(dataURI: string, filename: string): Promise<File> {
  const response = await fetch(dataURI);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

export async function fileToDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target) {
        resolve(e.target.result as string);
      } else {
        reject('Failed to read file');
      }
    };
    reader.readAsDataURL(file);
  });
}

interface APIResponse<T> {
  data: T;
  status: number;
}

export async function uploadAsset(url: string, file: File, assetType: AssetType): Promise<APIResponse<string>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('assetType', assetType);
  const response: AxiosResponse<string> = await axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });
  return response;
}
