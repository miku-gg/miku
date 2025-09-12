import React, { useRef, useState, useCallback } from 'react';
import { Button, Tooltip } from '@mikugg/ui-kit';
import { AssetDisplayPrefix, MikuCardV2, NovelV3 } from '@mikugg/bot-utils';
import config from '../config';
import AudioPreview from './AudioPreview';
import { handleEmotionSoundUpload, removeCharacterEmotionSound } from '../libs/emotionSoundUpload';
import { updateCharacter } from '../state/slices/novelFormSlice';
import { useAppDispatch } from '../state/store';
import { FaVolumeUp, FaTrashAlt } from 'react-icons/fa';
import './EmotionSoundUpload.scss';

// Constants
const ACCEPTED_AUDIO_TYPES = 'audio/*';
const UPLOADING_TEXT = '...';

// Types
type Emotion = MikuCardV2['data']['extensions']['mikugg_v2']['outfits'][number]['emotions'][number];

interface EmotionSoundUploadProps {
  character: NovelV3.NovelCharacter;
  outfitIndex: number;
  emotionId: string;
  emotion: Emotion;
  size?: 'sm' | 'md' | 'lg';
}

export default function EmotionSoundUpload({
  character,
  outfitIndex,
  emotionId,
  emotion,
  size = 'sm',
}: EmotionSoundUploadProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSound = emotion?.sources.sound;

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    
    try {
      await handleEmotionSoundUpload(
        file,
        emotionId,
        character,
        outfitIndex,
        dispatch,
        updateCharacter
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio file');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [emotionId, character, outfitIndex, dispatch]);

  const handleRemoveSound = useCallback(() => {
    const updatedCharacter = removeCharacterEmotionSound(
      character,
      outfitIndex,
      emotionId
    );
    dispatch(updateCharacter(updatedCharacter));
    setError(null);
  }, [character, outfitIndex, emotionId, dispatch]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);


  return (
    <div className={`EmotionSoundUpload EmotionSoundUpload--${size}`}>
      {hasSound ? (
        <div className="EmotionSoundUpload__controls">
          <Button
            theme="transparent"
            onClick={handleRemoveSound}
            className="EmotionSoundUpload__remove"
            data-tooltip-id="remove-audio-tooltip"
            data-tooltip-content="Remove audio"
            data-tooltip-delay-show={200}
            data-tooltip-delay-hide={100}
          >
            <FaTrashAlt />
          </Button>
          <AudioPreview 
            src={config.genAssetLink(emotion.sources.sound!, AssetDisplayPrefix.EMOTION_SOUND)} 
          />
        </div>
      ) : (
        <Button
          theme="transparent"
          onClick={handleUploadClick}
          disabled={isUploading}
          data-tooltip-id="upload-audio-tooltip"
          data-tooltip-content={isUploading ? "Uploading..." : "Upload audio"}
          data-tooltip-delay-show={200}
          data-tooltip-delay-hide={100}
        >
          {isUploading ? UPLOADING_TEXT : <FaVolumeUp />}
        </Button>
      )}
      
      {error && (
        <div className="EmotionSoundUpload__error" role="alert">
          {error}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_AUDIO_TYPES}
        onChange={handleFileChange}
        className="EmotionSoundUpload__file-input"
      />
      
      <Tooltip 
        id="remove-audio-tooltip" 
        place="top" 
        delayShow={200}
        delayHide={100}
        noArrow={false}
      />
      <Tooltip 
        id="upload-audio-tooltip" 
        place="top" 
        delayShow={200}
        delayHide={100}
        noArrow={false}
      />
    </div>
  );
}
