import {
  AreYouSure,
  Button,
  Carousel,
  CheckBox,
  ImageSlider,
  Input,
  Modal,
  MusicSelector,
} from "@mikugg/ui-kit";
import { useAppSelector, useAppDispatch } from "../../state/store";
import { selectEditingScene, selectBackgrounds } from "../../state/selectors";
import {
  updateScene,
  deleteSceneById,
} from "../../state/slices/novelFormSlice";
import { closeModal } from "../../state/slices/inputSlice";
import config from "../../config";
import { AiOutlinePicture } from "react-icons/ai";
import "./SceneEditModal.scss";
import Backgrounds from "../../panels/assets/backgrounds/Backgrounds";
import { useState } from "react";
import { FaUser } from "react-icons/fa6";
import classNames from "classnames";
import Characters from "../../panels/assets/characters/Characters";
import Songs from "../../panels/assets/songs/Songs";

export default function SceneEditModal() {
  const dispatch = useAppDispatch();
  const { openModal: openAreYouSure } = AreYouSure.useAreYouSure();
  const scene = useAppSelector(selectEditingScene);
  const backgrounds = useAppSelector(selectBackgrounds);
  const characters = useAppSelector((state) => state.novel.characters);
  const [selectBackgroundModalOpened, setSelectBackgroundModalOpened] =
    useState(false);
  const [selectSongModalOpened, setSelectSongModalOpened] = useState(false);
  const [selectCharacterModal, setSelectCharacterModal] = useState({
    opened: false,
    characterIndex: 0,
  });
  const [showingEmotionChar1, setShowingEmotionChar1] = useState("neutral");
  const [showingEmotionChar2, setShowingEmotionChar2] = useState("neutral");

  const handleDeleteScene = () => {
    if (scene) {
      openAreYouSure({
        description: "Are you sure you what to delete this scene?",
        onYes: () => {
          dispatch(deleteSceneById(scene.id));
          dispatch(closeModal({ modalType: "scene" }));
        },
      });
    }
  };

  return (
    <>
      <Modal
        opened={!!scene}
        title="Edit Scene"
        className="SceneEditModal"
        overlayClassName="scrollbar"
        shouldCloseOnOverlayClick
        onCloseModal={() => dispatch(closeModal({ modalType: "scene" }))}
      >
        {scene ? (
          <div className="SceneEditModal__content">
            <div className="SceneEditModal__background-container">
              <img
                className="SceneEditModal__background"
                src={config.genAssetLink(
                  scene?.background?.source.jpg || backgrounds[0].source.jpg
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
                  "SceneEditModal__character-select2-btn": true,
                  "SceneEditModal__character-select2-btn--disabled":
                    scene.characters.length < 2,
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
                  const outfits =
                    character.card?.data.extensions.mikugg_v2.outfits || [];
                  const selectedOutfitIndex = Math.max(
                    outfits.findIndex(
                      (outfit) => outfit.id === character.outfit
                    ),
                    0
                  );
                  const selectedEmotion = outfits[
                    selectedOutfitIndex
                  ].emotions.find(
                    (emotion) =>
                      emotion.id ===
                      (characterIndex === 0
                        ? showingEmotionChar1
                        : showingEmotionChar2)
                  ) ||
                    outfits[selectedOutfitIndex].emotions[0] || {
                      id: "neutral",
                      sources: {
                        png: "",
                      },
                    };
                  return (
                    <div
                      key={character.id}
                      className="SceneEditModal__character"
                    >
                      <ImageSlider
                        images={outfits.map((outfit) => ({
                          source: config.genAssetLink(
                            selectedEmotion.sources.png
                          ),
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
                                    characterId: char.id || "",
                                    objective: char.objective,
                                    outfit: outfits[newOutfitIndex].id,
                                  };
                                }
                                return {
                                  characterId: char.id || "",
                                  objective: char.objective,
                                  outfit: char.outfit,
                                };
                              }),
                            })
                          );
                        }}
                      />
                      <Carousel
                        items={outfits[selectedOutfitIndex].emotions.map(
                          (emotion) => ({
                            title: emotion.id,
                          })
                        )}
                        selectedIndex={
                          outfits[selectedOutfitIndex].emotions.findIndex(
                            (emotion) => emotion.id === selectedEmotion.id
                          ) || 0
                        }
                        onClick={(index) => {
                          characterIndex === 0
                            ? setShowingEmotionChar1(
                                outfits[selectedOutfitIndex].emotions[index]
                                  ?.id || ""
                              )
                            : setShowingEmotionChar2(
                                outfits[selectedOutfitIndex].emotions[index]
                                  ?.id || ""
                              );
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
                      })
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
                        name: e.target.value,
                      })
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
                        })
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
                        })
                      );
                    }}
                  />
                </div>
              </div>
              <div className="SceneEditModal__scene-details-row">
                <Input
                  id="context"
                  name="context"
                  placeHolder="*{{user}} and Nino are at the classroom working on a project.*"
                  label="Prompt"
                  description="Instruction for the AI when this scene is triggered."
                  value={scene.prompt}
                  onChange={(e) => {
                    dispatch(
                      updateScene({
                        ...scene._source,
                        prompt: e.target.value,
                      })
                    );
                  }}
                  isTextArea
                />
              </div>
              <div className="SceneEditModal__scene-details-row">
                <Input
                  id="context"
                  name="context"
                  placeHolder="{{user}} should have invited Nino to the classroom."
                  label="Condition"
                  // description="OPTIONAL. This condition must be met for the scene to be suggested."
                  description="OPTIONAL. This field has no effect at the moment."
                  value={scene.condition || ""}
                  onChange={(e) => {
                    dispatch(
                      updateScene({
                        ...scene._source,
                        condition: e.target.value || null,
                      })
                    );
                  }}
                  isTextArea
                />
              </div>
            </div>
            <div className="SceneEditModal__scene-music">
              <div className="SceneEditModal__scene-music-label">
                {scene.music?.name || "No music"}
                <Button
                  theme="secondary"
                  onClick={() => setSelectSongModalOpened(true)}
                >
                  Change
                </Button>
              </div>
              <div className="SceneEditModal__scene-music-audio">
                <audio
                  controls
                  src={
                    scene.music?.source
                      ? config.genAssetLink(scene.music?.source)
                      : undefined
                  }
                ></audio>
              </div>
            </div>
            <div className="SceneEditModal__scene-objectives">
              <div className="SceneEditModal__scene-objectives-header">
                <div className="SceneEditModal__scene-objectives-title">
                  Character Objectives
                </div>
                <div className="SceneEditModal__scene-objectives-description">
                  [Optional] Indicate what each character is trying to achieve
                  in this scene.
                </div>
              </div>
              <div className="SceneEditModal__scene-objectives-list">
                {scene.characters.map((character) => {
                  return (
                    <div className="SceneEditModal__scene-objective">
                      <div className="SceneEditModal__scene-objective__character">
                        <img
                          src={config.genAssetLink(character.profile_pic || "")}
                        />
                        <span>{character.name}</span>
                      </div>
                      <div className="SceneEditModal__scene-objective__input">
                        <Input
                          id={`objective-${character.id}`}
                          name={`objective-${character.id}`}
                          placeHolder={`What is ${character.name} trying to achieve?`}
                          value={character.objective || ""}
                          onChange={(e) => {
                            dispatch(
                              updateScene({
                                ...scene._source,
                                characters: scene.characters.map((char) => {
                                  if (char.id === character.id) {
                                    return {
                                      characterId: char.id || "",
                                      objective: e.target.value,
                                      outfit: char.outfit,
                                    };
                                  }
                                  return {
                                    characterId: char.id || "",
                                    objective: char.objective,
                                    outfit: char.outfit,
                                  };
                                }),
                              })
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
                })
              );
              setSelectBackgroundModalOpened(false);
            }
          }}
        />
      </Modal>
      <Modal
        opened={selectCharacterModal.opened}
        onCloseModal={() =>
          setSelectCharacterModal((_state) => ({ ..._state, opened: false }))
        }
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
                characterId: character.id || "",
                outfit: character.outfit || "",
              }));
              const newCharacter = characters.find(
                (character) => character.id === characterId
              );
              if (newCharacter) {
                newSceneCharacters[selectCharacterModal.characterIndex || 0] = {
                  characterId,
                  outfit:
                    newCharacter?.card.data.extensions.mikugg_v2.outfits[0]
                      .id || "",
                };
              } else {
                newSceneCharacters.splice(
                  selectCharacterModal.characterIndex,
                  1
                );
              }
              dispatch(
                updateScene({
                  ...scene._source,
                  characters: newSceneCharacters,
                })
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
            if (scene?._source) {
              dispatch(
                updateScene({
                  ...scene._source,
                  musicId,
                })
              );
              setSelectSongModalOpened(false);
            }
          }}
        />
      </Modal>
    </>
  );
}
