import { useAppSelector } from '../../state/store';
import { selectLastLoadedCharacters, selectCharacterOutfits, selectCurrentScene } from '../../state/selectors';
import { useAppContext } from '../../App.context';

/**
 * Returns the appropriate background source based on fullscreen emotions
 */
const useFullscreenEmotions = () => {
  const { isMobileApp } = useAppContext();
  const scene = useAppSelector(selectCurrentScene);
  const lastCharacters = useAppSelector(selectLastLoadedCharacters);  
  const selectedCharacter = lastCharacters.find(c => c.selected);
  
  // Get all character outfits in a single selector call
  const allCharacterOutfits = useAppSelector(state => {
    const outfits: Record<string, any[]> = {};
    lastCharacters.forEach(char => {
      outfits[char.id] = selectCharacterOutfits(state, char.id);
    });
    return outfits;
  });

  // Helper function to get outfit for a character
  const getCharacterOutfit = (char: any) => {
    const characterOutfitId = scene?.characters.find(c => c.characterId === char.id)?.outfit;
    const characterOutfits = allCharacterOutfits[char.id] || [];
    return characterOutfits.find(o => o.id === characterOutfitId);
  };

  let fullscreenCharacter: (typeof selectedCharacter & { isFullscreenBackground: boolean }) | null = null;

  // Count non-fullscreen characters for styling
  const nonFullscreenCharacters = lastCharacters.filter(char => {
    const outfit = getCharacterOutfit(char);
    return !outfit?.isFullscreen;
  });

  if (selectedCharacter) {
    const outfit = getCharacterOutfit(selectedCharacter);

    if (outfit?.isFullscreen && selectedCharacter.emotion) {
      const emotion = outfit.emotions.find((e: any) => e.id === selectedCharacter.emotion);
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

  return { fullscreenCharacter, nonFullscreenCharacters };
};

export { useFullscreenEmotions };
