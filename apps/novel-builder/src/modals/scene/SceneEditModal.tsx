import {
  AreYouSure,
  Button,
  Carousel,
  ImageSlider,
  Input,
  Modal,
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

export default function SceneEditModal() {
  const dispatch = useAppDispatch();
  const { openModal: openAreYouSure } = AreYouSure.useAreYouSure();
  const scene = useAppSelector(selectEditingScene);
  const backgrounds = useAppSelector(selectBackgrounds);
  const characters = useAppSelector((state) => state.novel.characters);
  const [selectBackgroundModalOpened, setSelectBackgroundModalOpened] =
    useState(false);
  const [selectCharacterModal, setSelectCharacterModal] = useState({
    opened: false,
    characterIndex: 0,
  });
  const [showingEmotionChar1, setShowingEmotionChar1] = useState("neutral");
  const [showingEmotionChar2, setShowingEmotionChar2] = useState("neutral");

  const handleSceneNameChange = (e: { target: { value: string } }) => {
    const newName = String(e.target.value);
    if (scene) {
      dispatch(
        updateScene({
          ...scene._source,
          name: newName,
        })
      );
    }
  };

  const handleScenePromptChange = (e: { target: { value: string } }) => {
    const newPrompt = String(e.target.value);
    if (scene) {
      dispatch(
        updateScene({
          ...scene._source,
          prompt: newPrompt,
        })
      );
    }
  };

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
        shouldCloseOnOverlayClick
        onCloseModal={() => dispatch(closeModal({ modalType: "scene" }))}
      >
        {scene ? (
          <div className="SceneEditModal__content">
            <Input
              label="Scene Name"
              value={scene?.name || ""}
              onChange={handleSceneNameChange}
            />
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
                  const selectedEmotion =
                    outfits[selectedOutfitIndex].emotions.find(
                      (emotion) =>
                        emotion.id ===
                        (characterIndex === 0
                          ? showingEmotionChar1
                          : showingEmotionChar2)
                    ) || outfits[selectedOutfitIndex].emotions[0];
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
                                  .id || ""
                              )
                            : setShowingEmotionChar2(
                                outfits[selectedOutfitIndex].emotions[index]
                                  .id || ""
                              );
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            {/* TODO: Add music selection */}
            <Input
              label="Scene Prompt"
              value={scene?.prompt || ""}
              onChange={handleScenePromptChange}
            />
            <Button theme="primary" onClick={handleDeleteScene}>
              Delete Scene
            </Button>
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
    </>
  );
}
