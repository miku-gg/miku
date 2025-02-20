import { AreYouSure, Button, Carousel, Dropdown, ImageSlider, Input, Modal, Tooltip } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { closeModal } from '../../state/slices/inputSlice';
import { deleteCutscenePart, updateCutscenePart } from '../../state/slices/novelFormSlice';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import { FaMusic, FaTrashAlt, FaUser } from 'react-icons/fa';
import './PartEditor.scss';
import { useEffect, useState } from 'react';
import Songs from '../../panels/assets/songs/Songs';
import Backgrounds from '../../panels/assets/backgrounds/Backgrounds';
import config from '../../config';
import { AiOutlinePicture } from 'react-icons/ai';
import classNames from 'classnames';
import Characters from '../../panels/assets/characters/Characters';
import './PartEditor.scss';
import { CutScenePart } from '@mikugg/bot-utils/dist/lib/novel/NovelV3';
import { BsChatLeftText } from 'react-icons/bs';

export const PartEditor = ({ part, cutsceneId }: { part: CutScenePart; cutsceneId: string }) => {
  const dispatch = useAppDispatch();
  const { openModal } = AreYouSure.useAreYouSure();
  const currentCutscene = useAppSelector((state) => state.novel.cutscenes?.find((c) => c.id === cutsceneId));
  const selectedMusic = useAppSelector((state) => state.novel.songs.find((s) => s.id === part?.music));
  const selectedBackground = useAppSelector((state) => state.novel.backgrounds.find((b) => b.id === part?.background));
  const characters = useAppSelector((state) => state.novel.characters);
  const partCharacters = part?.characters.filter((c) => c) || [];

  const [selectSongModalOpened, setSelectSongModalOpened] = useState(false);
  const [selectTextModalOpened, setSelectTextModalOpened] = useState(false);
  const [selectBackgroundModalOpened, setSelectBackgroundModalOpened] = useState(false);
  const [selectCharacterModal, setSelectCharacterModal] = useState<{
    opened: boolean;
    characterIndex: number;
  }>({
    opened: false,
    characterIndex: 0,
  });

  const [showingEmotionChar1, setShowingEmotionChar1] = useState<string | undefined>(undefined);
  const [showingEmotionChar2, setShowingEmotionChar2] = useState<string | undefined>(undefined);

  const getCharacterAssetSRC = (character: { id: string; outfitId: string; emotionId: string }) => {
    const characterData = characters.find((c) => c.id === character.id);
    if (!characterData) return '';
    const outfit = characterData.card?.data.extensions.mikugg_v2.outfits.find((o) => o.id === character.outfitId);
    if (!outfit) return '';
    const emotion = outfit.emotions.find((e) => e.id === character.emotionId);
    if (!emotion) return '';
    return config.genAssetLink(emotion?.sources.png, AssetDisplayPrefix.EMOTION_IMAGE_SMALL);
  };

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
      case selectTextModalOpened:
        setSelectTextModalOpened(false);
        break;
      default:
        break;
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (!part?.text || index < 0 || index >= part.text.length) return;

    const newText = [...part.text];
    newText[index] = {
      ...newText[index],
      content: value,
    };

    updatePart({ ...part, text: newText });
  };

  const createTextPart = () => {
    const newText = [...part.text];
    newText.push({ type: 'description', content: '' });
    updatePart({ ...part, text: newText });
  };

  const handleTextTypeChange = (index: number, type: 'description' | 'dialogue') => {
    if (!part?.text || index < 0 || index >= part.text.length) return;

    const newText = [...part.text];
    newText[index] = {
      ...newText[index],
      type: type as 'description' | 'dialogue',
    };

    updatePart({ ...part, text: newText });
  };

  const handleDeleteTextPart = (index: number) => {
    if (!part?.text || index < 0 || index >= part.text.length) return;

    const newText = [...part.text];
    newText.splice(index, 1);

    updatePart({ ...part, text: newText });
  };

  const dropdownItems = [
    { name: 'Description', value: 'description' },
    { name: 'Dialogue', value: 'dialogue' },
  ];

  useEffect(() => {
    setShowingEmotionChar1(part?.characters[0]?.emotionId || 'neutral');
    setShowingEmotionChar2(part?.characters[1]?.emotionId || 'neutral');
  }, [part]);

  if (!part) return null;

  return (
    <div className="PartEditor">
      <div className="PartEditor__background-container">
        <img
          className="PartEditor__background"
          src={config.genAssetLink(selectedBackground?.source.jpg || '', AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL)}
        />
        <FaTrashAlt
          className="PartEditor__removePlace"
          data-tooltip-id="delete-cutscene-part-tooltip"
          data-tooltip-content="Delete cutscene"
          onClick={() => {
            deletePart();
          }}
        />
        <Tooltip id="delete-cutscene-part-tooltip" place="bottom" />
        <div className="PartEditor__background-container__controls">
          <div
            className={classNames({
              'PartEditor__background-edit-btn': true,
              'PartEditor__background-edit-btn--selected': part.background,
            })}
            onClick={() => setSelectBackgroundModalOpened(true)}
            tabIndex={0}
            role="button"
            data-tooltip-id="cutscene-part-data"
            data-tooltip-content={part.background ? 'Edit background' : 'Add background'}
          >
            <AiOutlinePicture />
          </div>
          <button
            className={classNames({
              'PartEditor__character-select1-btn': true,
              'PartEditor__character-select1-btn--selected': part.characters.length > 0,
            })}
            onClick={() =>
              setSelectCharacterModal({
                opened: true,
                characterIndex: 0,
              })
            }
            tabIndex={0}
            role="button"
            data-tooltip-id="cutscene-part-data"
            data-tooltip-content={part.characters.length > 0 ? 'Edit character 1' : 'Add character 1'}
          >
            <FaUser /> 1
          </button>
          <button
            className={classNames({
              'PartEditor__character-select2-btn': true,
              'PartEditor__character-select2-btn--disabled': characters.length < 2,
              'PartEditor__character-select2-btn--selected': part.characters.length === 2,
            })}
            onClick={() =>
              setSelectCharacterModal({
                opened: true,
                characterIndex: 1,
              })
            }
            tabIndex={0}
            disabled={characters.length < 2}
            role="button"
            data-tooltip-id="cutscene-part-data"
            data-tooltip-content={part.characters.length > 1 ? 'Edit character 2' : 'Add character 2'}
          >
            <FaUser /> 2
          </button>
          <div
            className={classNames({
              'PartEditor__music-select-btn': true,
              'PartEditor__music-select-btn--selected': part.music,
            })}
            onClick={() => setSelectSongModalOpened(true)}
            tabIndex={0}
            role="button"
            data-tooltip-id="cutscene-part-data"
            data-tooltip-content={part.music ? `Music: ${selectedMusic?.name}` : 'Add music'}
          >
            <FaMusic />
          </div>
          <div
            className={classNames({
              'PartEditor__text-input-btn': true,
              'PartEditor__text-input-btn--selected': part.text.length > 0,
            })}
            onClick={() => setSelectTextModalOpened(true)}
            tabIndex={0}
            role="button"
            data-tooltip-id="cutscene-part-data"
            data-tooltip-content="Text sections"
          >
            <BsChatLeftText />
          </div>
          <Tooltip id="cutscene-part-data" place="bottom" />
        </div>
        <div className="PartEditor__selected-characters">
          {partCharacters.map((character) => {
            return <img key={character.id} src={getCharacterAssetSRC(character)} />;
          })}
        </div>
      </div>

      <div className="PartEditor__select-modal">
        <Modal
          opened={
            selectCharacterModal.opened || selectBackgroundModalOpened || selectSongModalOpened || selectTextModalOpened
          }
          onCloseModal={handleCloseAllModals}
          className="PartEditor__modal"
        >
          {selectCharacterModal.opened && (
            <div className="PartEditor__modal__characters">
              <Characters
                ignoreIds={
                  selectCharacterModal.characterIndex == 0
                    ? partCharacters[1]?.id
                      ? [partCharacters[1]?.id]
                      : []
                    : partCharacters[0]?.id
                    ? [partCharacters[0]?.id]
                    : []
                }
                showNone
                selected={partCharacters.length > 0 ? partCharacters[selectCharacterModal.characterIndex]?.id : ''}
                onSelect={(characterId) => {
                  if (characters) {
                    const newCharacters = [...part.characters];
                    const newCharacter = characters.find((character) => character.id === characterId);
                    if (newCharacter) {
                      newCharacters[selectCharacterModal.characterIndex] = {
                        id: newCharacter.id || '',
                        outfitId: newCharacter.card?.data.extensions.mikugg_v2.outfits[0].id || '',
                        emotionId: newCharacter.card?.data.extensions.mikugg_v2.outfits[0].emotions[0].id || '',
                      };
                    } else {
                      newCharacters.splice(selectCharacterModal.characterIndex, 1);
                    }
                    updatePart({ ...part, characters: newCharacters.filter((c) => c) });
                  }
                }}
              />
              {partCharacters.length > 0 && (
                <div className="PartEditor__character">
                  {partCharacters.map((character, characterIndex) => {
                    if (characterIndex !== selectCharacterModal.characterIndex) return null;
                    const characterData = characters.find((c) => c.id === character.id);
                    if (!characterData) return null;

                    const outfits = characterData.card?.data.extensions.mikugg_v2.outfits || [];
                    const selectedOutfitIndex = Math.max(
                      outfits.findIndex((outfit) => outfit.id === character.outfitId),
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
                      <div key={character.id}>
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
                              characters: part.characters.map((char, idx) =>
                                idx === characterIndex ? { ...char, outfitId: outfits[newOutfitIndex].id } : char,
                              ),
                            });
                          }}
                        />
                        <Carousel
                          items={outfits[selectedOutfitIndex].emotions.map((emotion) => ({
                            title: emotion.id,
                          }))}
                          selectedIndex={outfits[selectedOutfitIndex].emotions.findIndex(
                            (emotion) =>
                              emotion.id === (characterIndex === 0 ? showingEmotionChar1 : showingEmotionChar2),
                          )}
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
              )}
              <div className="PartEditor__modal__done-btn">
                <Button theme="gradient" onClick={() => setSelectCharacterModal({ opened: false, characterIndex: 0 })}>
                  Done
                </Button>
              </div>
            </div>
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
              displayNoneButton
              onSelect={(musicId) => {
                updatePart({ ...part, music: musicId });
                setSelectSongModalOpened(false);
              }}
            />
          )}
          {selectTextModalOpened && (
            <div className="PartEditor__modal__text">
              <div className="PartEditor__modal__text__header">
                <h3>Text Parts</h3>
                <Button theme="secondary" onClick={createTextPart}>
                  Create
                </Button>
              </div>
              {part.text.length > 0 && (
                <div className="PartEditor__modal__text__parts scrollbar">
                  {part.text.map((text, index) => (
                    <div key={`${text.type}-${index}`} className="PartEditor__modal__text__part">
                      <Input
                        className={classNames({
                          PartEditor__modal__text__input: true,
                          'PartEditor__modal__text__input--dialogue': text.type === 'dialogue',
                        })}
                        value={text.content}
                        maxLength={100}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                      />

                      <Dropdown
                        className="PartEditor__modal__text__dropdown"
                        items={dropdownItems}
                        selectedIndex={dropdownItems.findIndex((item) => item.value === text.type)}
                        onChange={(selectedIndex) =>
                          handleTextTypeChange(index, dropdownItems[selectedIndex].value as 'description' | 'dialogue')
                        }
                      />
                      {part.text.length > 1 && (
                        <Button theme="primary" onClick={() => handleDeleteTextPart(index)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
