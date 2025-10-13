import { useEffect, useRef } from 'react';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { selectCharacterOutfits } from '../../state/selectors';
import { useAppSelector, RootState } from '../../state/store';

interface EmotionSoundPlayerProps {
  lastCharacters: Array<{
    id: string;
    emotion: string;
    outfit: string;
  }>;
  selectedCharacterId: string;
  assetLinkLoader: (asset: string, type: AssetDisplayPrefix) => string;
}

export default function EmotionSoundPlayer({
  lastCharacters,
  selectedCharacterId,
  assetLinkLoader,
}: EmotionSoundPlayerProps) {
  const previousEmotionsRef = useRef<Record<string, string>>({});
  const attemptedSoundsRef = useRef<Record<string, boolean>>({});
  const musicVolume = useAppSelector((state) => state.settings.music.volume);
  const musicEnabled = useAppSelector((state) => state.settings.music.enabled);
  const characters = useAppSelector((state) => state.novel.characters);

  const getEmotionSoundUrl = (characterId: string, emotionId: string, outfitId: string) => {
    const outfits = selectCharacterOutfits({ novel: { characters } } as RootState, characterId);
    const currentOutfit = outfits.find((o) => o.id === outfitId);
    const currentEmotion = currentOutfit?.emotions.find((e) => e.id === emotionId);
    return currentEmotion?.sources.sound
      ? assetLinkLoader(currentEmotion.sources.sound, AssetDisplayPrefix.EMOTION_SOUND)
      : undefined;
  };

  useEffect(() => {
    const selectedCharacter = lastCharacters.find((character) => character.id === selectedCharacterId);

    if (!selectedCharacter) {
      return;
    }

    const { id, emotion, outfit } = selectedCharacter;
    const previousEmotion = previousEmotionsRef.current[id];
    const emotionKey = `${id}-${emotion}`;

    if (emotion !== previousEmotion) {
      const emotionSoundUrl = getEmotionSoundUrl(id, emotion, outfit);
      if (emotionSoundUrl) {
        attemptedSoundsRef.current[emotionKey] = true;
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
  }, [lastCharacters, musicVolume, musicEnabled]);

  // This component is just for sound playback
  return null;
}
