import { AreYouSure, Button, Carousel, ImageSlider, Input, Modal, Tooltip } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { selectEditingCutscenePart, selectEditingScene } from '../../state/selectors';
import { closeModal } from '../../state/slices/inputSlice';
import ButtonGroup from '../../components/ButtonGroup';
import { deleteCutscenePart, updateCutscenePart } from '../../state/slices/novelFormSlice';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import { IoIosCloseCircleOutline } from 'react-icons/io';
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

export const PartEditor = ({ part }: { part: CutScenePart }) => {
  const dispatch = useAppDispatch();
  const { openModal } = AreYouSure.useAreYouSure();
  const scene = useAppSelector(selectEditingScene);
  const currentCutscene = useAppSelector((state) => state.novel.cutscenes?.find((c) => c.id === scene?.cutScene?.id));
  const selectedMusic = useAppSelector((state) => state.novel.songs.find((s) => s.id === part?.music));
  const selectedBackground = useAppSelector((state) => state.novel.backgrounds.find((b) => b.id === part?.background));
  const characters = scene?.characters || [];
  const partCharacters = part?.characters || [];

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
            className="PartEditor__background-edit-btn"
            onClick={() => setSelectBackgroundModalOpened(true)}
            tabIndex={0}
            role="button"
            data-tooltip-id="cutscene-part-data"
            data-tooltip-content={part.background ? 'Edit background' : 'Add background'}
          >
            <AiOutlinePicture />
          </div>
          <div
            className="PartEditor__character-select1-btn"
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
          </div>
          <div
            className={classNames({
              'PartEditor__character-select2-btn': true,
              'PartEditor__character-select2-btn--disabled': part.characters.length < 2,
            })}
            onClick={() =>
              setSelectCharacterModal({
                opened: true,
                characterIndex: 1,
              })
            }
            tabIndex={0}
            role="button"
            data-tooltip-id="cutscene-part-data"
            data-tooltip-content={part.characters.length > 1 ? 'Edit character 2' : 'Add character 2'}
          >
            <FaUser /> 2
          </div>
          <div
            className={classNames({
              'PartEditor__music-select-btn': true,
              'PartEditor__music-select-btn--disabled': false,
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
              'PartEditor__text-input-btn--disabled': false,
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
                    ? characters[1]?.id
                      ? [characters[1]?.id]
                      : []
                    : characters[0]?.id
                    ? [characters[0]?.id]
                    : []
                }
                showNone
                selected={partCharacters.length > 0 ? partCharacters[selectCharacterModal.characterIndex]?.id : ''}
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
                  }
                }}
              />
              {partCharacters.length > 0 &&
                characters.map((character, characterIndex) => {
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
                    <div key={character.id} className="PartEditor__character">
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
          {selectTextModalOpened && <div>Text</div>}
        </Modal>
      </div>
    </div>
  );
};