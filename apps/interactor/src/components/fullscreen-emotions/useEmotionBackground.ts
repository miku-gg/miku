import { useAppSelector } from '../../state/store';
import { selectLastLoadedCharacters, selectCharacterOutfits, selectCurrentScene } from '../../state/selectors';
import { useAppContext } from '../../App.context';

/**
 * Returns the appropriate background source based on fullscreen emotions
 */
const useEmotionBackground = () => {
  const { isMobileApp } = useAppContext();
  const scene = useAppSelector(selectCurrentScene);
  const lastCharacters = useAppSelector(selectLastLoadedCharacters);
  
  // Get all character outfits for the selected character
  const selectedCharacter = lastCharacters.find(c => c.selected);
  const selectedCharacterOutfits = useAppSelector(state => 
    selectedCharacter ? selectCharacterOutfits(state, selectedCharacter.id) : []
  );
  
  let fullscreenCharacter: (typeof selectedCharacter & { isFullscreenBackground: boolean }) | null = null;

  if (selectedCharacter) {
    const characterOutfitId = scene?.characters.find(c => c.characterId === selectedCharacter.id)?.outfit;
    const outfit = selectedCharacterOutfits.find(o => o.id === characterOutfitId);

    if (outfit?.isFullscreen && selectedCharacter.emotion) {
      const emotion = outfit.emotions.find(e => e.id === selectedCharacter.emotion);
      if (emotion?.sources) {
        const isMobile = isMobileApp || window.innerWidth < 600;
        const fullscreenAsset = emotion.sources[isMobile ? 'mobile' : 'desktop'] || 
                               emotion.sources.desktop || 
                               emotion.sources.mobile;
        if (fullscreenAsset) {
          fullscreenCharacter = {
            ...selectedCharacter,
            image: fullscreenAsset,
            isFullscreenBackground: true
          };
        }
      }
    }
  }

  return { fullscreenCharacter };
};

export { useEmotionBackground };
