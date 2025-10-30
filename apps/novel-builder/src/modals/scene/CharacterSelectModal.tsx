import { Button, Carousel, Modal } from '@mikugg/ui-kit';
import { useState, useEffect } from 'react';
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdComputer, MdPhoneAndroid } from 'react-icons/md';
import Characters from '../../panels/assets/characters/Characters';
import config from '../../config';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { useAppSelector } from '../../state/store';
import { selectEditingScene } from '../../state/selectors';
import './CharacterSelectModal.scss';

interface CharacterSelectModalProps {
  opened: boolean;
  onCloseModal: () => void;
  selectedCharacterId?: string;
  onSelect: (characterId: string, outfitId?: string, emotionId?: string) => void;
  ignoreIds?: string[];
  showNone?: boolean;
  showOutfitSelection?: boolean;
}

export default function CharacterSelectModal({
  opened,
  onCloseModal,
  selectedCharacterId,
  onSelect,
  ignoreIds,
  showNone,
  showOutfitSelection = true,
}: CharacterSelectModalProps) {
  const scene = useAppSelector(selectEditingScene);
  const characters = useAppSelector((state) => state.novel.characters);
  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState(0);
  const [showingEmotion, setShowingEmotion] = useState('neutral');
  const [internalSelectedCharacterId, setInternalSelectedCharacterId] = useState(selectedCharacterId || '');
  const [showCharacterPreview, setShowCharacterPreview] = useState(false);
  const [fullscreenPreviewMode, setFullscreenPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const selectedCharacter = characters.find((char) => char.id === internalSelectedCharacterId);
  const outfits = selectedCharacter?.card?.data.extensions.mikugg_v2.outfits || [];
  const selectedOutfit = outfits[selectedOutfitIndex];
  const emotions = selectedOutfit?.emotions || [];

  const selectedEmotion = emotions.find((emotion) => emotion.id === showingEmotion) || emotions[0];

  useEffect(() => {
    if (selectedCharacter && scene) {
      const outfits = selectedCharacter.card?.data.extensions.mikugg_v2.outfits || [];
      let outfitIndex = 0;
      const sceneCharacter = scene.characters.find((char) => char.id === internalSelectedCharacterId);
      if (sceneCharacter?.outfit) {
        outfitIndex = Math.max(
          outfits.findIndex((outfit) => outfit.id === sceneCharacter.outfit),
          0,
        );
      }

      setSelectedOutfitIndex(outfitIndex);
      setShowingEmotion('neutral');
    }
  }, [internalSelectedCharacterId, scene]);

  useEffect(() => {
    if (opened) {
      setInternalSelectedCharacterId(selectedCharacterId || '');
      if (selectedCharacterId) {
        setShowCharacterPreview(true);
      } else {
        setShowCharacterPreview(false);
      }
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
  };

  const handleSave = () => {
    if (internalSelectedCharacterId) {
      onSelect(internalSelectedCharacterId, selectedOutfit?.id, selectedEmotion?.id);
    }
    onCloseModal();
  };

  const handleCancel = () => {
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
        <div className="CharacterSelectModal__header-title">Select Character</div>
        <div className="CharacterSelectModal__header-actions">
          <Button theme="primary" onClick={handleSave} className="CharacterSelectModal__save-btn">
            Save
          </Button>
          <Button theme="primary" onClick={handleCancel} className="CharacterSelectModal__cancel-btn">
            Cancel
          </Button>
        </div>
      </div>
      <div className="CharacterSelectModal__content">
        <div
          className={`CharacterSelectModal__character-selection ${
            showCharacterPreview && showOutfitSelection ? 'CharacterSelectModal__character-selection--hidden' : ''
          }`}
        >
          {(!showCharacterPreview || !showOutfitSelection) && (
            <Characters
              ignoreIds={ignoreIds}
              showNone={showNone}
              selected={internalSelectedCharacterId}
              onSelect={handleCharacterSelect}
              hideHeader={true}
            />
          )}
        </div>

        {selectedCharacter && selectedOutfit && showOutfitSelection && (
          <div className="CharacterSelectModal__character-customization">
            <div className="CharacterSelectModal__toggle-container">
              {showCharacterPreview && <span className="CharacterSelectModal__show-list-text">See character List</span>}
              <button onClick={toggleCharacterPreview} className="CharacterSelectModal__toggle-btn">
                {showCharacterPreview ? <MdKeyboardArrowDown /> : <MdKeyboardArrowUp />}
              </button>
            </div>

            {showCharacterPreview && (
              <div className="CharacterSelectModal__outfit-selection">
                <div className="CharacterSelectModal__outfit-container">
                  {/* Outfit Buttons */}
                  <div className="CharacterSelectModal__outfit-buttons">
                    {outfits.map((outfit, index) => (
                      <button
                        key={outfit.id}
                        className={`CharacterSelectModal__outfit-button ${
                          index === selectedOutfitIndex ? 'CharacterSelectModal__outfit-button--selected' : ''
                        }`}
                        onClick={() => {
                          setSelectedOutfitIndex(index);
                          setShowingEmotion('neutral');
                        }}
                      >
                        {outfit.name}
                      </button>
                    ))}
                  </div>

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

                  {selectedOutfit?.isFullscreen && (
                    <div className="CharacterSelectModal__fullscreen-controls">
                      <button
                        className="CharacterSelectModal__fullscreen-toggle-btn"
                        onClick={() =>
                          setFullscreenPreviewMode(fullscreenPreviewMode === 'desktop' ? 'mobile' : 'desktop')
                        }
                      >
                        {fullscreenPreviewMode === 'desktop' ? <MdPhoneAndroid /> : <MdComputer />}
                      </button>
                    </div>
                  )}

                  <div className="emotion-display">
                    {selectedEmotion && (
                      <>
                        <img
                          src={config.genAssetLink(
                            selectedOutfit?.isFullscreen
                              ? fullscreenPreviewMode === 'desktop'
                                ? selectedEmotion?.sources.desktop || ''
                                : selectedEmotion?.sources.mobile || ''
                              : selectedEmotion?.sources.png || '',
                            AssetDisplayPrefix.EMOTION_IMAGE,
                          )}
                          alt={selectedEmotion.id}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
