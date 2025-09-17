import { AssetType } from '@mikugg/bot-utils';
import config from '../config';
import { toast } from 'react-toastify';

export interface EmotionSoundUploadResult {
  success: boolean;
  assetId?: string;
  error?: string;
}

export const uploadEmotionSound = async (
  file: File,
  _emotionId: string
): Promise<EmotionSoundUploadResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return {
        success: false,
        error: 'File must be an audio file (MP3, WAV, OGG, FLAC, M4A, etc.)',
      };
    }

    // Upload the file
    const { assetId, success } = await config.uploadAsset(file, AssetType.EMOTION_SOUND);
    
    if (!success || !assetId) {
      return {
        success: false,
        error: 'Failed to upload sound file',
      };
    }

    return {
      success: true,
      assetId,
    };
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred during upload',
    };
  }
};

// returns updated character object
export const updateCharacterEmotionSound = (
  character: any,
  outfitIndex: number,
  emotionId: string,
  soundAssetId: string
) => {
  const outfits = [...(character.card.data.extensions.mikugg_v2?.outfits || [])];
  const emotions = [...(outfits[outfitIndex].emotions || [])];
  
  const emotionIndex = emotions.findIndex((e: any) => e.id === emotionId);
  
  if (emotionIndex >= 0) {
    // Update existing emotion
    emotions[emotionIndex] = {
      ...emotions[emotionIndex],
      sources: {
        ...emotions[emotionIndex].sources,
        sound: soundAssetId,
      },
    };
  } else {
    // Add new emotion with sound
    emotions.push({
      id: emotionId,
      sources: {
        png: '',
        sound: soundAssetId,
      },
    });
  }

  outfits[outfitIndex] = {
    ...outfits[outfitIndex],
    emotions,
  };

  return {
    ...character,
    card: {
      ...character.card,
      data: {
        ...character.card.data,
        extensions: {
          ...character.card.data.extensions,
          mikugg_v2: {
            ...character.card.data.extensions.mikugg_v2,
            outfits,
          },
        },
      },
    },
  };
};

// returns updated character object
export const removeCharacterEmotionSound = (
  character: any,
  outfitIndex: number,
  emotionId: string
) => {
  const outfits = [...(character.card.data.extensions.mikugg_v2?.outfits || [])];
  const emotions = [...(outfits[outfitIndex].emotions || [])];
  
  const emotionIndex = emotions.findIndex((e: any) => e.id === emotionId);
  
  if (emotionIndex >= 0) {
    const { sound, ...otherSources } = emotions[emotionIndex].sources;
    emotions[emotionIndex] = {
      ...emotions[emotionIndex],
      sources: otherSources,
    };
  }

  outfits[outfitIndex] = {
    ...outfits[outfitIndex],
    emotions,
  };

  return {
    ...character,
    card: {
      ...character.card,
      data: {
        ...character.card.data,
        extensions: {
          ...character.card.data.extensions,
          mikugg_v2: {
            ...character.card.data.extensions.mikugg_v2,
            outfits,
          },
        },
      },
    },
  };
};

export const handleEmotionSoundUpload = async (
  file: File,
  emotionId: string,
  character: any,
  outfitIndex: number,
  dispatch: any,
  updateCharacterAction: any
): Promise<boolean> => {
  const uploadResult = await uploadEmotionSound(file, emotionId);
  
  if (!uploadResult.success) {
    toast.error(uploadResult.error || `Failed to upload sound for ${emotionId}`);
    return false;
  }

  const updatedCharacter = updateCharacterEmotionSound(
    character,
    outfitIndex,
    emotionId,
    uploadResult.assetId!
  );

  dispatch(updateCharacterAction(updatedCharacter));
  
  return true;
};
