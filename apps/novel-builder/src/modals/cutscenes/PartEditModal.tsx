import { AreYouSure, Button, Carousel, ImageSlider, Input, Modal, Tooltip } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { selectEditingCutscene, selectEditingCutscenePart, selectEditingScene } from '../../state/selectors';
import { closeModal } from '../../state/slices/inputSlice';
import ButtonGroup from '../../components/ButtonGroup';
import { deleteCutscenePart, updateCutscenePart } from '../../state/slices/novelFormSlice';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { FaTrashAlt, FaUser } from 'react-icons/fa';
import './PartEditModal.scss';
import { useEffect, useState } from 'react';
import Songs from '../../panels/assets/songs/Songs';
import Backgrounds from '../../panels/assets/backgrounds/Backgrounds';
import config from '../../config';
import { AiOutlinePicture } from 'react-icons/ai';
import classNames from 'classnames';
import Characters from '../../panels/assets/characters/Characters';
import './PartEditModal.scss';

export const PartEditModal = () => {
  const dispatch = useAppDispatch();
  const { openModal } = AreYouSure.useAreYouSure();
  const part = useAppSelector(selectEditingCutscenePart);
  const opened = useAppSelector((state) => state.input.modals.cutscenePartEdit.opened);
  const currentCutscene = useAppSelector(selectEditingCutscene);
  const selectedMusic = useAppSelector((state) => state.novel.songs.find((s) => s.id === part?.music));
  const selectedBackground = useAppSelector((state) => state.novel.backgrounds.find((b) => b.id === part?.background));
  const characters = useAppSelector(selectEditingScene)?.characters || [];

  const [selectSongModalOpened, setSelectSongModalOpened] = useState(false);
  const [selectBackgroundModalOpened, setSelectBackgroundModalOpened] = useState(false);
  const [selectCharacterModal, setSelectCharacterModal] = useState({
    opened: false,
    characterIndex: 0,
  });

  const [showingEmotionChar1, setShowingEmotionChar1] = useState<string | undefined>(undefined);
  const [showingEmotionChar2, setShowingEmotionChar2] = useState<string | undefined>(undefined);

  const handleClose = () => {
    dispatch(closeModal({ modalType: 'cutscenePartEdit' }));
  };

  const updatePart = (part: NovelV3.CutScenePart) => {
    if (!currentCutscene) return;
    dispatch(updateCutscenePart({ cutsceneId: currentCutscene.id, part }));
  };

  const deletePart = () => {
    if (!currentCutscene || !part) return;
    handleClose();
    dispatch(closeModal({ modalType: 'cutscenes' }));
    openModal({
      title: 'Are you sure?',
      description: 'This action cannot be undone',
      onYes: () => {
        dispatch(deleteCutscenePart({ cutsceneId: currentCutscene.id, partId: part.id }));
      },
    });
  };

  const handleCloseAllModals = () => {
    switch (true) {
      case selectCharacterModal.opened:
        setSelectCharacterModal((_state) => ({ ..._state, opened: false }));
        break;
      case selectBackgroundModalOpened:
        setSelectBackgroundModalOpened(false);
        break;
      case selectSongModalOpened:
        setSelectSongModalOpened(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setShowingEmotionChar1(part?.characters[0]?.emotionId || 'neutral');
    setShowingEmotionChar2(part?.characters[1]?.emotionId || 'neutral');
  }, [part]);

  if (!part) return null;

  return (
    <Modal opened={opened} onCloseModal={handleClose}>
      <div className="PartEditModal">
        <div className="PartEditModal__header">
          <h2>Edit Part</h2>
        </div>
        <div className="PartEditModal__buttons">
          <FaTrashAlt
            className="PartEditModal__buttons__removePlace"
            data-tooltip-id="delete-cutscene-tooltip"
            data-tooltip-content="Delete cutscene"
            onClick={() => {
              deletePart();
            }}
          />
          <IoIosCloseCircleOutline
            className="PartEditModal__buttons__closeModal"
            onClick={() => {
              handleClose();
            }}
          />
          <Tooltip id="delete-cutscene-part-tooltip" place="bottom" />
        </div>

        <div className="SceneEditModal__background-container">
          <img
            className="SceneEditModal__background"
            src={config.genAssetLink(selectedBackground?.source.jpg || '', AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL)}
          />
          <div
            className="SceneEditModal__background-edit-btn"
            onClick={() => setSelectBackgroundModalOpened(true)}
            tabIndex={0}
            role="button"
          >
            <AiOutlinePicture />
          </div>
          <div
            className="SceneEditModal__character-select1-btn"
            onClick={() =>
              setSelectCharacterModal({
                opened: true,
                characterIndex: 0,
              })
            }
            tabIndex={0}
            role="button"
          >
            <FaUser /> 1
          </div>
          <div
            className={classNames({
              'SceneEditModal__character-select2-btn': true,
              'SceneEditModal__character-select2-btn--disabled': part.characters.length < 2,
            })}
            onClick={() =>
              setSelectCharacterModal({
                opened: true,
                characterIndex: 1,
              })
            }
            tabIndex={0}
            role="button"
          >
            <FaUser /> 2
          </div>
          <div className="SceneEditModal__characters">
            {characters.map((character, characterIndex) => {
              const outfits = character.card?.data.extensions.mikugg_v2.outfits || [];
              const selectedOutfitIndex = Math.max(
                outfits.findIndex((outfit) => outfit.id === character.outfit),
                0,
              );
              const selectedEmotion = outfits[selectedOutfitIndex].emotions.find(
                (emotion) => emotion.id === (characterIndex === 0 ? showingEmotionChar1 : showingEmotionChar2),
              ) ||
                outfits[selectedOutfitIndex].emotions[0] || {
                  id: 'neutral',
                  sources: {
                    png: '',
                  },
                };
              return (
                <div key={character.id} className="SceneEditModal__character">
                  <ImageSlider
                    images={outfits.map((outfit) => ({
                      source: config.genAssetLink(selectedEmotion.sources.png, AssetDisplayPrefix.EMOTION_IMAGE),
                      label: outfit.name,
                    }))}
                    backgroundImageSource=""
                    selectedIndex={selectedOutfitIndex}
                    onChange={(delta) => {
                      let newOutfitIndex = selectedOutfitIndex + delta;
                      if (newOutfitIndex < 0) {
                        newOutfitIndex = outfits.length - 1;
                      } else if (newOutfitIndex >= outfits.length) {
                        newOutfitIndex = 0;
                      }
                      updatePart({
                        ...part,
                        characters: part.characters.map((character) => ({
                          ...character,
                          outfitId: outfits[newOutfitIndex].id,
                        })),
                      });
                    }}
                  />
                  <Carousel
                    items={outfits[selectedOutfitIndex].emotions.map((emotion) => ({
                      title: emotion.id,
                    }))}
                    selectedIndex={
                      outfits[selectedOutfitIndex].emotions.findIndex((emotion) => emotion.id === selectedEmotion.id) ||
                      0
                    }
                    onClick={(index) => {
                      if (characterIndex === 0) {
                        setShowingEmotionChar1(outfits[selectedOutfitIndex].emotions[index]?.id || '');
                        updatePart({
                          ...part,
                          characters: part.characters.map((char, idx) =>
                            idx === 0
                              ? { ...char, emotionId: outfits[selectedOutfitIndex].emotions[index]?.id || '' }
                              : char,
                          ),
                        });
                      } else {
                        setShowingEmotionChar2(outfits[selectedOutfitIndex].emotions[index]?.id || '');
                        updatePart({
                          ...part,
                          characters: part.characters.map((char, idx) =>
                            idx === 1
                              ? { ...char, emotionId: outfits[selectedOutfitIndex].emotions[index]?.id || '' }
                              : char,
                          ),
                        });
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="PartEditModal__text">
          <div className="PartEditModal__text__header">
            <p>Text</p>
            <div className="PartEditModal__type">
              <ButtonGroup
                buttons={[
                  { content: 'Dialogue', value: 'dialogue' },
                  { content: 'Description', value: 'description' },
                ]}
                selected={part.type}
                onButtonClick={(b) => updatePart({ ...part, type: b as 'dialogue' | 'description' })}
              />
            </div>
          </div>
          <Input value={part.text} isTextArea onChange={(e) => updatePart({ ...part, text: e.target.value })} />
        </div>

        <div className="PartEditModal__music">
          <p>{selectedMusic?.name || 'No music selected'}</p>
          <Button theme="secondary" onClick={() => setSelectSongModalOpened(true)}>
            Select Music
          </Button>
        </div>

        <div className="PartEditModal__select-modal">
          <Modal
            opened={selectCharacterModal.opened || selectBackgroundModalOpened || selectSongModalOpened}
            onCloseModal={handleCloseAllModals}
            className="SceneEditModal__select-character-modal"
          >
            {selectCharacterModal.opened && (
              <Characters
                ignoreIds={
                  selectCharacterModal.characterIndex == 0
                    ? characters[1]?.id
                      ? [characters[1]?.id]
                      : []
                    : characters[0]?.id
                    ? [characters[0]?.id]
                    : []
                }
                showNone={selectCharacterModal.characterIndex === 1}
                selected={characters[selectCharacterModal.characterIndex]?.id}
                onSelect={(characterId) => {
                  if (characters) {
                    const newCharacters = characters.map((character) => ({
                      id: character.id || '',
                      outfitId: character.outfit || '',
                      emotionId: character.card?.data.extensions.mikugg_v2.outfits[0].emotions[0].id || '',
                    }));
                    const newCharacter = characters.find((character) => character.id === characterId);
                    if (newCharacter) {
                      newCharacters[selectCharacterModal.characterIndex || 0] = {
                        id: newCharacter?.id || '',
                        outfitId: newCharacter?.card?.data.extensions.mikugg_v2.outfits[0].id || '',
                        emotionId: newCharacter?.card?.data.extensions.mikugg_v2.outfits[0].emotions[0].id || '',
                      };
                    } else {
                      newCharacters.splice(selectCharacterModal.characterIndex, 1);
                    }
                    updatePart({ ...part, characters: newCharacters });
                    setSelectCharacterModal({
                      opened: false,
                      characterIndex: 0,
                    });
                  }
                }}
              />
            )}
            {selectBackgroundModalOpened && (
              <Backgrounds
                selected={part?.background}
                onSelect={(backgroundId) => {
                  updatePart({ ...part, background: backgroundId });

                  setSelectBackgroundModalOpened(false);
                }}
              />
            )}
            {selectSongModalOpened && (
              <Songs
                selected={part.music}
                onSelect={(musicId) => {
                  updatePart({ ...part, music: musicId });
                  setSelectSongModalOpened(false);
                }}
              />
            )}
          </Modal>
        </div>
      </div>
    </Modal>
  );
};
