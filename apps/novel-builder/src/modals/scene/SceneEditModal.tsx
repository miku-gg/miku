import { AreYouSure, Button, Carousel, CheckBox, ImageSlider, Input, Modal, Tooltip } from '@mikugg/ui-kit';
import classNames from 'classnames';
import { useState } from 'react';
import { AiOutlinePicture } from 'react-icons/ai';
import { FaUser } from 'react-icons/fa6';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { TokenDisplayer } from '../../components/TokenDisplayer';
import config from '../../config';
import { TOKEN_LIMITS } from '../../data/tokenLimits';
import Backgrounds from '../../panels/assets/backgrounds/Backgrounds';
import Characters from '../../panels/assets/characters/Characters';
import Songs from '../../panels/assets/songs/Songs';
import { LorebookList } from '../../panels/details/LorebookList';
import { MapList } from '../../panels/maps/MapList';
import { selectBackgrounds, selectEditingScene } from '../../state/selectors';
import { closeModal } from '../../state/slices/inputSlice';
import { deleteSceneById, updateObjective, updateScene } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { NovelObjectives } from './NovelObjectives';
import './SceneEditModal.scss';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { CutScenePartsRenderForScene } from '../cutscenes/CutscenePartsRenderForScene';
import { v4 as uuidv4 } from 'uuid';
import { NovelV3 } from '@mikugg/bot-utils';
import {
  addIndicatorToScene,
  updateIndicatorInScene,
  deleteIndicatorFromScene,
} from '../../state/slices/novelFormSlice';
import { IndicatorEditor } from './IndicatorEditor';

export default function SceneEditModal() {
  const dispatch = useAppDispatch();
  const { openModal: openAreYouSure } = AreYouSure.useAreYouSure();
  const scene = useAppSelector(selectEditingScene);
  const maps = useAppSelector((state) => state.novel.maps);
  const backgrounds = useAppSelector(selectBackgrounds);
  const characters = useAppSelector((state) => state.novel.characters);
  const indicators = scene?.indicators || [];

  const objectives = useAppSelector((state) => state.novel.objectives);
  const objectiveLockedsByScenes = objectives?.filter((obj) => {
    return obj.stateCondition?.config?.sceneIds?.includes(scene?.id || '');
  });
  const [selectBackgroundModalOpened, setSelectBackgroundModalOpened] = useState(false);
  const [selectSongModalOpened, setSelectSongModalOpened] = useState(false);
  const [selectCharacterModal, setSelectCharacterModal] = useState({
    opened: false,
    characterIndex: 0,
  });
  const [showingEmotionChar1, setShowingEmotionChar1] = useState('neutral');
  const [showingEmotionChar2, setShowingEmotionChar2] = useState('neutral');

  const getObjectiveData = (id: string) => {
    return objectives?.find((objective) => objective.id === id);
  };

  const handleDeleteScene = () => {
    if (scene) {
      openAreYouSure({
        description: 'Are you sure you what to delete this scene?',
        onYes: () => {
          dispatch(deleteSceneById(scene.id));
          dispatch(closeModal({ modalType: 'scene' }));
        },
      });
    }
  };

  const handleLorebookSelect = (id: string) => {
    if (!scene) return;
    dispatch(
      updateScene({
        ...scene._source,
        lorebookIds: scene.lorebookIds
          ? scene.lorebookIds.includes(id)
            ? scene.lorebookIds.filter((lid) => lid !== id)
            : [...scene.lorebookIds, id]
          : [id],
      }),
    );
  };

  const handleSelectMaps = (id: string) => {
    if (!scene) return;
    dispatch(
      updateScene({
        ...scene._source,
        parentMapIds: scene.parentMapIds
          ? scene.parentMapIds.includes(id)
            ? scene.parentMapIds.filter((mid) => mid !== id)
            : [...scene.parentMapIds, id]
          : [id],
      }),
    );
  };

  const handleAddIndicator = () => {
    if (indicators.length >= 6) return;

    const newIndicator: NovelV3.NovelIndicator = {
      id: uuidv4(),
      name: '',
      description: '',
      type: 'percentage', // default type
      values: [],
      initialValue: '',
      inferred: false,
      step: 1,
      min: 0,
      max: 100,
      hidden: false,
      editable: false,
      persistent: false,
      color: '#4caf50',
    };
    dispatch(addIndicatorToScene({ sceneId: scene?.id || '', indicator: newIndicator }));
  };

  const handleUpdateIndicator = (indicator: NovelV3.NovelIndicator) => {
    const index = indicators.findIndex((m) => m.id === indicator.id);
    if (index !== -1) {
      dispatch(updateIndicatorInScene({ sceneId: scene?.id || '', indicatorId: indicator.id, indicator }));
    }
  };

  const handleDeleteIndicator = (indicatorId: string) => {
    dispatch(deleteIndicatorFromScene({ sceneId: scene?.id || '', indicatorId }));
  };

  return (
    <>
      <Modal
        opened={!!scene}
        title="Edit Scene"
        className="SceneEditModal"
        overlayClassName="scrollbar"
        shouldCloseOnOverlayClick
        onCloseModal={() => dispatch(closeModal({ modalType: 'scene' }))}
      >
        {scene ? (
          <div className="SceneEditModal__content">
            <div className="SceneEditModal__background-container">
              <img
                className="SceneEditModal__background"
                src={config.genAssetLink(
                  scene?.background?.source.jpg || backgrounds[0].source.jpg,
                  AssetDisplayPrefix.BACKGROUND_IMAGE,
                )}
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
                  'SceneEditModal__character-select2-btn--disabled': scene.characters.length < 2,
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
                {scene.characters.map((character, characterIndex) => {
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
                          dispatch(
                            updateScene({
                              ...scene._source,
                              characters: scene.characters.map((char) => {
                                if (char.id === character.id) {
                                  return {
                                    characterId: char.id || '',
                                    objective: char.objective,
                                    outfit: outfits[newOutfitIndex].id,
                                  };
                                }
                                return {
                                  characterId: char.id || '',
                                  objective: char.objective,
                                  outfit: char.outfit,
                                };
                              }),
                            }),
                          );
                        }}
                      />
                      <Carousel
                        items={outfits[selectedOutfitIndex].emotions.map((emotion) => ({
                          title: emotion.id,
                        }))}
                        selectedIndex={
                          outfits[selectedOutfitIndex].emotions.findIndex(
                            (emotion) => emotion.id === selectedEmotion.id,
                          ) || 0
                        }
                        onClick={(index) => {
                          characterIndex === 0
                            ? setShowingEmotionChar1(outfits[selectedOutfitIndex].emotions[index]?.id || '')
                            : setShowingEmotionChar2(outfits[selectedOutfitIndex].emotions[index]?.id || '');
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="SceneEditModal__scene-details">
              <div className="SceneEditModal__scene-details-row">
                <Input
                  id="scene-name"
                  name="name"
                  placeHolder="school"
                  label="Scene name"
                  value={scene?.name}
                  onChange={(e) =>
                    dispatch(
                      updateScene({
                        ...scene._source,
                        name: e.target.value,
                      }),
                    )
                  }
                  maxLength={256}
                />
                <Input
                  id="scene-description"
                  name="description"
                  className="SceneEditModal__scene-details-description"
                  placeHolder="{{user}} finds Nino in the classroom working on a project."
                  label="Scene Description"
                  value={scene?.description}
                  onChange={(e) =>
                    dispatch(
                      updateScene({
                        ...scene._source,
                        description: e.target.value,
                      }),
                    )
                  }
                  maxLength={256}
                />
                <Input
                  id="scene-actionText"
                  name="actionText"
                  placeHolder="Go to the classroom"
                  label="Call to action"
                  description="The text that will be displayed when the scene is suggested."
                  value={scene?.actionText}
                  onChange={(e) =>
                    dispatch(
                      updateScene({
                        ...scene._source,
                        actionText: e.target.value,
                      }),
                    )
                  }
                  maxLength={256}
                />
                <div className="SceneEditModal__scene-details-nsfw">
                  <CheckBox
                    id="scene-nsfw"
                    name="nsfw"
                    label="Is NSFW"
                    value={scene?.nsfw > 0}
                    onChange={(e) =>
                      dispatch(
                        updateScene({
                          ...scene._source,
                          nsfw: e.target.checked ? 1 : 0,
                        }),
                      )
                    }
                  />
                  <CheckBox
                    id="scene-nsfw-2"
                    name="nsfw-2"
                    label="Has explicit content"
                    value={scene?.nsfw === 2}
                    onChange={(e) => {
                      dispatch(
                        updateScene({
                          ...scene._source,
                          nsfw: e.target.checked ? 2 : 1,
                        }),
                      );
                    }}
                  />
                </div>
              </div>
              <div className="SceneEditModal__scene-details-row">
                <div className="SceneEditModal__scene-details-row__prompt">
                  <div className="SceneEditModal__scene-details-row__label">
                    <label className="Input__label">
                      Prompt <IoInformationCircleOutline data-tooltip-id="scene-prompt-tooltip" />
                    </label>
                    <Tooltip
                      id="scene-prompt-tooltip"
                      content="Instruction for the AI when this scene is triggered."
                      place="right"
                    />
                    <TokenDisplayer text={scene.prompt} limits={TOKEN_LIMITS.SCENE_PROMPT} />
                  </div>
                  <Input
                    id="context"
                    name="context"
                    placeHolder="*{{user}} and Nino are at the classroom working on a project.*"
                    value={scene.prompt}
                    onChange={(e) => {
                      dispatch(
                        updateScene({
                          ...scene._source,
                          prompt: e.target.value,
                        }),
                      );
                    }}
                    isTextArea
                  />
                </div>
              </div>
              <div className="SceneEditModal__scene-details-row">
                <Input
                  id="hint"
                  name="hint"
                  placeHolder="Give nino a hug."
                  label="Hint"
                  description="OPTIONAL. A small hint to advance in the story."
                  value={scene.hint || ''}
                  onChange={(e) => {
                    dispatch(
                      updateScene({
                        ...scene._source,
                        hint: e.target.value || undefined,
                      }),
                    );
                  }}
                  maxLength={34}
                />
              </div>
              <div className="SceneEditModal__scene-details-row">
                <Input
                  id="context"
                  name="context"
                  placeHolder="{{user}} should have invited Nino to the classroom."
                  label="Condition"
                  description="OPTIONAL. This condition must be met for the scene to be suggested."
                  value={scene.condition || ''}
                  onChange={(e) => {
                    dispatch(
                      updateScene({
                        ...scene._source,
                        condition: e.target.value || null,
                      }),
                    );
                  }}
                  isTextArea
                />
              </div>
              <div>
                <CheckBox
                  id="scene-generation-prevention"
                  name="scene-generation-prevention"
                  label="Don't suggest 'Generate new scene' in this scene"
                  value={scene?.preventSceneGenerationSuggestion}
                  onChange={(e) => {
                    dispatch(
                      updateScene({
                        ...scene._source,
                        preventSceneGenerationSuggestion: e.target.checked ? true : false,
                      }),
                    );
                  }}
                />
              </div>
            </div>
            <div className="SceneEditModal__scene-objectives">
              <NovelObjectives
                tooltipText="Select objectives that are relevant to this scene."
                selectedObjectiveIds={objectiveLockedsByScenes?.map((obj) => obj.id) || []}
                onSelectObjective={(id) => {
                  const objective = getObjectiveData(id);
                  if (!objective) return;
                  dispatch(
                    updateObjective({
                      id,
                      objective: {
                        ...objective,
                        stateCondition: {
                          type: 'IN_SCENE',
                          config: {
                            sceneIds: objective.stateCondition?.config?.sceneIds?.includes(scene?.id)
                              ? objective.stateCondition?.config?.sceneIds?.filter((id) => id !== scene?.id)
                              : [...(objective.stateCondition?.config?.sceneIds || []), scene?.id],
                          },
                        },
                      },
                    }),
                  );
                }}
              />
            </div>
            <div className="SceneEditModal__scene-music">
              <div className="SceneEditModal__scene-music-label">
                {scene.music?.name || 'No music'}
                <Button theme="secondary" onClick={() => setSelectSongModalOpened(true)}>
                  Change
                </Button>
              </div>
              <div className="SceneEditModal__scene-music-audio">
                <audio
                  controls
                  src={
                    scene.music?.source ? config.genAssetLink(scene.music?.source, AssetDisplayPrefix.MUSIC) : undefined
                  }
                ></audio>
              </div>
            </div>
            <div className="SceneEditModal__scene-objectives">
              <div className="SceneEditModal__scene-objectives-header">
                <div className="SceneEditModal__scene-objectives-title">Character Objectives</div>
                <div className="SceneEditModal__scene-objectives-description">
                  [Optional] Indicate what each character is trying to achieve in this scene.
                </div>
              </div>
              <div className="SceneEditModal__scene-objectives-list">
                {scene.characters.map((character) => {
                  return (
                    <div className="SceneEditModal__scene-objective" key={`objective-${scene.id}-${character.id}`}>
                      <div className="SceneEditModal__scene-objective__character">
                        <img src={config.genAssetLink(character.profile_pic || '', AssetDisplayPrefix.PROFILE_PIC)} />
                        <span>{character.name}</span>
                      </div>
                      <div className="SceneEditModal__scene-objective__input">
                        <Input
                          id={`objective-${character.id}`}
                          name={`objective-${character.id}`}
                          placeHolder={`What is ${character.name} trying to achieve?`}
                          value={character.objective || ''}
                          onChange={(e) => {
                            dispatch(
                              updateScene({
                                ...scene._source,
                                characters: scene.characters.map((char) => {
                                  if (char.id === character.id) {
                                    return {
                                      characterId: char.id || '',
                                      objective: e.target.value,
                                      outfit: char.outfit,
                                    };
                                  }
                                  return {
                                    characterId: char.id || '',
                                    objective: char.objective,
                                    outfit: char.outfit,
                                  };
                                }),
                              }),
                            );
                          }}
                          isTextArea
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="SceneEditModal__scene-cutscene">
              <CutScenePartsRenderForScene />
            </div>
            <div className="SceneEditModal__scene-maps">
              {maps ? (
                <MapList
                  onSelectMap={(id) => {
                    handleSelectMaps(id);
                  }}
                  selectedMapId={scene?.parentMapIds || []}
                  tooltipText="Select maps reachable from this scene."
                />
              ) : null}
            </div>
            <div className="SceneEditModal__scene-lorebooks">
              <LorebookList
                selectedLorebookId={scene?.lorebookIds || []}
                tooltipText="Select lorebooks relevant to this scene."
                onSelectLorebook={(id) => handleLorebookSelect(id)}
              />
            </div>
            <div className="SceneEditModal__scene-indicators">
              <div className="SceneEditModal__scene-indicators-header">
                <div className="SceneEditModal__scene-indicators-header-title">
                  <h2>Indicators</h2>
                  <IoInformationCircleOutline
                    data-tooltip-id="Info-indicators"
                    className="SceneEditModal__scene-indicators-header-title-infoIcon"
                    data-tooltip-content="[Optional] Define optional values that will be tracked in the scene. They will be considered by the AI."
                  />
                  <Tooltip id="Info-indicators" place="top" />
                </div>
                <Button
                  theme="gradient"
                  onClick={handleAddIndicator}
                  disabled={indicators.length >= 6}
                  data-tooltip-id="add-indicator-tooltip"
                  data-tooltip-content={indicators.length >= 6 ? 'Maximum of 6 indicators reached' : undefined}
                >
                  Add Indicator
                </Button>
                <Tooltip id="add-indicator-tooltip" place="bottom" />
              </div>
              {indicators.map((indicator) => (
                <IndicatorEditor
                  key={indicator.id}
                  indicator={indicator}
                  onUpdate={(updatedIndicator) => handleUpdateIndicator(updatedIndicator)}
                  onDelete={() => handleDeleteIndicator(indicator.id)}
                />
              ))}
            </div>
            <div className="SceneEditModal__scene-actions">
              <Button theme="primary" onClick={handleDeleteScene}>
                Delete Scene
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
      <Modal
        opened={selectBackgroundModalOpened}
        onCloseModal={() => setSelectBackgroundModalOpened(false)}
        className="SceneEditModal__select-background-modal"
      >
        <Backgrounds
          selected={scene?.background?.id}
          onSelect={(backgroundId) => {
            if (scene?._source) {
              dispatch(
                updateScene({
                  ...scene._source,
                  backgroundId,
                }),
              );
              setSelectBackgroundModalOpened(false);
            }
          }}
        />
      </Modal>
      <Modal
        opened={selectCharacterModal.opened}
        onCloseModal={() => setSelectCharacterModal((_state) => ({ ..._state, opened: false }))}
        className="SceneEditModal__select-character-modal"
      >
        <Characters
          ignoreIds={
            selectCharacterModal.characterIndex == 0
              ? scene?.characters[1]?.id
                ? [scene?.characters[1]?.id]
                : []
              : scene?.characters[0]?.id
              ? [scene?.characters[0]?.id]
              : []
          }
          showNone={selectCharacterModal.characterIndex === 1}
          selected={scene?.characters[selectCharacterModal.characterIndex]?.id}
          onSelect={(characterId) => {
            if (scene?._source) {
              const newSceneCharacters = scene.characters.map((character) => ({
                characterId: character.id || '',
                outfit: character.outfit || '',
              }));
              const newCharacter = characters.find((character) => character.id === characterId);
              if (newCharacter) {
                newSceneCharacters[selectCharacterModal.characterIndex || 0] = {
                  characterId,
                  outfit: newCharacter?.card.data.extensions.mikugg_v2.outfits[0].id || '',
                };
              } else {
                newSceneCharacters.splice(selectCharacterModal.characterIndex, 1);
              }
              dispatch(
                updateScene({
                  ...scene._source,
                  characters: newSceneCharacters,
                }),
              );
              setSelectCharacterModal({
                opened: false,
                characterIndex: 0,
              });
            }
          }}
        />
      </Modal>
      <Modal
        opened={selectSongModalOpened}
        onCloseModal={() => setSelectSongModalOpened(false)}
        className="SceneEditModal__select-song-modal"
      >
        <Songs
          selected={scene?.musicId}
          onSelect={(musicId) => {
            if (scene?._source && musicId) {
              dispatch(
                updateScene({
                  ...scene._source,
                  musicId: musicId || '',
                }),
              );
              setSelectSongModalOpened(false);
            }
          }}
        />
      </Modal>
    </>
  );
}
