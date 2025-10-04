import { Button, Carousel, ImageSlider, Modal } from '@mikugg/ui-kit';
import { useState, useEffect } from 'react';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import Characters from '../../panels/assets/characters/Characters';
import config from '../../config';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { useAppSelector, useAppDispatch } from '../../state/store';
import { selectEditingScene } from '../../state/selectors';
import './CharacterSelectModal.scss';

interface CharacterSelectModalProps {
  opened: boolean;
  onCloseModal: () => void;
  selectedCharacterId?: string;
  onSelect: (characterId: string, outfitId?: string, emotionId?: string) => void;
  ignoreIds?: string[];
  showNone?: boolean;
}

export default function CharacterSelectModal({
  opened,
  onCloseModal,
  selectedCharacterId,
  onSelect,
  ignoreIds,
  showNone,
}: CharacterSelectModalProps) {
  const dispatch = useAppDispatch();
  const scene = useAppSelector(selectEditingScene);
  const characters = useAppSelector((state) => state.novel.characters);
  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState(0);
  const [showingEmotion, setShowingEmotion] = useState('neutral');
  const [internalSelectedCharacterId, setInternalSelectedCharacterId] = useState(selectedCharacterId || '');
  const [showCharacterPreview, setShowCharacterPreview] = useState(false);

  const selectedCharacter = characters.find((char) => char.id === internalSelectedCharacterId);
  const outfits = selectedCharacter?.card?.data.extensions.mikugg_v2.outfits || [];
  const selectedOutfit = outfits[selectedOutfitIndex];
  const emotions = selectedOutfit?.emotions || [];
  
  // Find the selected emotion exactly like Scene Edit Modal does
  const selectedEmotion = emotions.find((emotion) => emotion.id === showingEmotion) || emotions[0];

  // Initialize with current outfit or reset to first outfit when character changes
  useEffect(() => {
    if (selectedCharacter && scene) {
      const outfits = selectedCharacter.card?.data.extensions.mikugg_v2.outfits || [];
      let outfitIndex = 0;
      
      // Find the current outfit from the scene character data
      const sceneCharacter = scene.characters.find((char) => char.id === internalSelectedCharacterId);
      if (sceneCharacter?.outfit) {
        // Find the index of the current selected outfit
        outfitIndex = Math.max(
          outfits.findIndex((outfit) => outfit.id === sceneCharacter.outfit),
          0,
        );
      }
      
      setSelectedOutfitIndex(outfitIndex);
      setShowingEmotion('neutral');
    }
  }, [internalSelectedCharacterId, scene]);

  // Initialize when modal opens with existing character
  useEffect(() => {
    if (opened && selectedCharacterId) {
      setInternalSelectedCharacterId(selectedCharacterId);
      setShowCharacterPreview(true);
    }
  }, [opened, selectedCharacterId]);

  const handleCharacterSelect = (characterId: string) => {
    if (characterId === '') {
      setInternalSelectedCharacterId('');
      setShowCharacterPreview(false);
      onSelect('');
      return;
    }
    setInternalSelectedCharacterId(characterId);
    setShowCharacterPreview(true);
    // Don't call onSelect immediately - let the user customize first
    // The useEffect above will handle resetting the outfit and emotion
  };

  const handleSave = () => {
    // Save the character and customizations
    if (internalSelectedCharacterId) {
      onSelect(internalSelectedCharacterId, selectedOutfit?.id, selectedEmotion?.id);
    }
    onCloseModal();
  };

  const handleCancel = () => {
    // Don't save anything, just close
    onCloseModal();
  };

  const toggleCharacterPreview = () => {
    setShowCharacterPreview(!showCharacterPreview);
  };


  return (
    <Modal
      opened={opened}
      onCloseModal={handleCancel}
      className="CharacterSelectModal__modal"
      overlayClassName="scrollbar"
    >
      <div className="CharacterSelectModal__header">
        <div className="CharacterSelectModal__header-title">
          Select Character
        </div>
        <div className="CharacterSelectModal__header-actions">
          <Button theme="primary" onClick={handleSave} className="CharacterSelectModal__save-btn">Save</Button>
          <Button theme="primary" onClick={handleCancel} className="CharacterSelectModal__cancel-btn">Cancel</Button>
        </div>
      </div>
      <div className="CharacterSelectModal__content">
        <div className={`CharacterSelectModal__character-selection ${showCharacterPreview ? 'CharacterSelectModal__character-selection--compact' : ''}`}>
          <Characters
            ignoreIds={ignoreIds}
            showNone={showNone}
            selected={internalSelectedCharacterId}
            onSelect={handleCharacterSelect}
            hideHeader={true}
          />
        </div>

        {selectedCharacter && selectedOutfit && (
          <div className="CharacterSelectModal__character-customization">
            <div className="CharacterSelectModal__toggle-container">
              <button 
                onClick={toggleCharacterPreview} 
                className="CharacterSelectModal__toggle-btn"
              >
                {showCharacterPreview ? <MdKeyboardArrowDown /> : <MdKeyboardArrowUp />}
              </button>
            </div>
            
            {showCharacterPreview && (
              <div className="CharacterSelectModal__outfit-selection">
              <div className="CharacterSelectModal__emotion-selection">
                <Carousel
                  items={emotions.map((emotion) => ({
                    title: emotion.id,
                  }))}
                  selectedIndex={emotions.findIndex((emotion) => emotion.id === selectedEmotion.id) || 0}
                  onClick={(index) => {
                    setShowingEmotion(emotions[index]?.id || 'neutral');
                  }}
                />
              </div>
              
              <ImageSlider
                images={outfits.map((outfit) => {
                  const selectedEmotion = outfit.emotions.find((emotion) => emotion.id === showingEmotion) || outfit.emotions[0];
                  return {
                    source: config.genAssetLink(
                      selectedEmotion?.sources.png || '',
                      AssetDisplayPrefix.EMOTION_IMAGE,
                    ),
                    label: outfit.name,
                  };
                })}
                backgroundImageSource=""
                selectedIndex={selectedOutfitIndex}
                onChange={(delta) => {
                  let newOutfitIndex = selectedOutfitIndex + delta;
                  if (newOutfitIndex < 0) {
                    newOutfitIndex = outfits.length - 1;
                  } else if (newOutfitIndex >= outfits.length) {
                    newOutfitIndex = 0;
                  }
                  setSelectedOutfitIndex(newOutfitIndex);
                  setShowingEmotion('neutral');
                }}
              />
            </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
