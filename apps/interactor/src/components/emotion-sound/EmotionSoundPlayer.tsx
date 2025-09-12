import { useEffect, useRef } from 'react';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import { selectCharacterOutfits } from '../../state/selectors';
import { useAppSelector, RootState } from '../../state/store';

interface EmotionSoundPlayerProps {
  lastCharacters: Array<{
    id: string;
    emotion: string;
    outfit: string;
  }>;
  characters: NovelV3.NovelCharacter[];
  assetLinkLoader: (asset: string, type: AssetDisplayPrefix) => string;
}

export default function EmotionSoundPlayer({
  lastCharacters,
  characters,
  assetLinkLoader,
}: EmotionSoundPlayerProps) {
  const previousEmotionsRef = useRef<Record<string, string>>({});
  const attemptedSoundsRef = useRef<Record<string, boolean>>({});
  const musicVolume = useAppSelector((state) => state.settings.music.volume);
  const musicEnabled = useAppSelector((state) => state.settings.music.enabled);

  // Get emotion sound URL from character data
  const getEmotionSoundUrl = (characterId: string, emotionId: string, outfitId: string) => {
    const outfits = selectCharacterOutfits({ novel: { characters } } as RootState, characterId);
    const currentOutfit = outfits.find((o) => o.id === outfitId);
    const currentEmotion = currentOutfit?.emotions.find((e) => e.id === emotionId);
    return currentEmotion?.sources.sound 
      ? assetLinkLoader(currentEmotion.sources.sound, AssetDisplayPrefix.EMOTION_SOUND)
      : undefined;
  };

  useEffect(() => {
    lastCharacters.forEach(({ id, emotion, outfit }) => {
      const previousEmotion = previousEmotionsRef.current[id];
      const emotionKey = `${id}-${emotion}`;
      
      if (emotion !== previousEmotion) {
        const emotionSoundUrl = getEmotionSoundUrl(id, emotion, outfit);        
        if (emotionSoundUrl) {
          // Mark this sound as attempted
          attemptedSoundsRef.current[emotionKey] = true;          
          // Only play if music is enabled
          if (musicEnabled) {
            const audio = new Audio(emotionSoundUrl);
            audio.volume = musicVolume;
            audio.play().catch((error) => {
              console.warn('Failed to play emotion sound:', error);
            });
          }
        }        
        previousEmotionsRef.current[id] = emotion;
      }
    });
  }, [lastCharacters, characters, assetLinkLoader, musicVolume, musicEnabled]);

  // This component is just for sound playback
  return null;
}
