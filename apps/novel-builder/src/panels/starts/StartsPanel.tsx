import { Button, Dropdown, Input, AreYouSure, Modal } from "@mikugg/ui-kit";
import { useAppDispatch, useAppSelector } from "../../state/store";
import {
  createStart,
  deleteStart,
  updateStart
} from "../../state/slices/novelFormSlice";
import { selectScenes } from "../../state/selectors";
import config from "../../config";
import "./StartsPanel.scss";
import { useState } from "react";
import classNames from "classnames";
import { TokenDisplayer } from "../../components/TokenDisplayer";
import { TOKEN_LIMITS } from "../../data/tokenLimits";

export default function StartsPanel() {
  const dispatch = useAppDispatch();
  const starts = useAppSelector((state) => state.novel.starts);
  const characters = useAppSelector((state) => state.novel.characters);
  const scenes = useAppSelector(selectScenes);
  const { openModal: openAreYouSureModal } = AreYouSure.useAreYouSure();
  const [sceneSelection, setSceneSelection] = useState<{
    opened: boolean;
    selectedSceneId: string | null;
    startId: string | null;
  }>({
    opened: false,
    selectedSceneId: null,
    startId: null
  });

  return (
    <div className="StartsPanel">
      <h1 className="StartsPanel__title">Starts</h1>
      <div className="StartsPanel__description">
        List all possible starting points for your novel. For each, indicate the
        start scene and character's message.
      </div>
      <div className="StartsPanel__list">
        {starts.map((start) => {
          const scene = scenes.find((scene) => scene.id === start.sceneId);
          return (
            <div className="StartsPanel__item" key={start.id}>
              <div className="StartsPanel__item-spec">
                <div className="StartsPanel__item-scene">
                  <div
                    className="SceneNode"
                    style={{
                      backgroundImage: `url(${config.genAssetLink(
                        scene?.background?.source.jpg || ""
                      )})`
                    }}
                    onClick={() =>
                      setSceneSelection({
                        opened: true,
                        selectedSceneId: start.sceneId,
                        startId: start.id
                      })
                    }
                  >
                    <div className="SceneNode__title">{scene?.name || ""}</div>
                    <div className="SceneNode__characters">
                      {scene?.characters.map((character, index) => (
                        <img
                          key={index}
                          src={config.genAssetLink(character.profile_pic || "")}
                          alt={`Character ${index}`}
                          className="SceneNode__character"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="StartsPanel__item-docs">
                  <Input
                    label="Title"
                    placeHolder="Title of this starting point..."
                    value={start.title || ""}
                    onChange={(e) =>
                      dispatch(updateStart({ ...start, title: e.target.value }))
                    }
                  />
                  <Input
                    label="Description"
                    value={start.description || ""}
                    placeHolder="Description of this starting point..."
                    onChange={(e) =>
                      dispatch(
                        updateStart({ ...start, description: e.target.value })
                      )
                    }
                  />
                </div>
              </div>
              <div className="StartsPanel__item-prompt">
                {start.characters.map((_character, index) => {
                  const character = characters.find(
                    (char) => char.id === _character.characterId
                  );
                  const characterSceneOutfit = scene?.characters.find(
                    (char) => char.id === character?.id
                  )?.outfit;
                  const outfit =
                    character?.card.data.extensions.mikugg_v2.outfits.find(
                      (outfit) => outfit.id === characterSceneOutfit
                    );
                  const selectedEmotionIndex = Math.max(
                    outfit?.emotions.findIndex(
                      (emotion) => emotion.id === _character.emotion
                    ) || 0,
                    0
                  );
                  return (
                    <div
                      className="StartsPanel__item-prompt-character"
                      key={`start-message-${start.id}-${character?.id}`}
                    >
                      <div className="StartsPanel__item-prompt-character-header">
                        <div className="StartsPanel__item-prompt-character-title">
                          {character?.name} first message
                        </div>
                        <div className="StartsPanel__item-prompt-character-title-right">
                          <div className="StartsPanel__item-prompt-character-emotion">
                            <Dropdown
                              items={
                                outfit?.emotions.map((emotion) => ({
                                  name: emotion.id,
                                  value: emotion.id
                                })) || []
                              }
                              selectedIndex={selectedEmotionIndex}
                              onChange={(indexEmotion) => {
                                dispatch(
                                  updateStart({
                                    ...start,
                                    characters: start.characters.map(
                                      (char, i) =>
                                        i === index
                                          ? {
                                              ...char,
                                              emotion:
                                                outfit?.emotions[indexEmotion]
                                                  ?.id || ""
                                            }
                                          : char
                                    )
                                  })
                                );
                              }}
                            />
                          </div>
                          <TokenDisplayer
                            text={_character.text || ""}
                            limits={TOKEN_LIMITS.STARTS_FIRST_MESSAGE}
                          />
                        </div>
                      </div>
                      <Input
                        value={_character.text || ""}
                        isTextArea
                        placeHolder="Type the character's first message here..."
                        onChange={(e) =>
                          dispatch(
                            updateStart({
                              ...start,
                              characters: start.characters.map((char, i) =>
                                i === index
                                  ? { ...char, text: e.target.value }
                                  : char
                              )
                            })
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
              <div className="StartsPanel__item-remove">
                <Button
                  theme="primary"
                  onClick={() => {
                    openAreYouSureModal({
                      onYes: () => {
                        dispatch(deleteStart(start.id));
                      },
                      description:
                        "Are you sure you want to remove this start?",
                      yesLabel: "Remove"
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="StartsPanel__add-button">
        <Button
          theme="secondary"
          onClick={() =>
            setSceneSelection({
              opened: true,
              selectedSceneId: null,
              startId: null
            })
          }
        >
          Add Start
        </Button>
      </div>
      <Modal
        title="Select a Scene"
        opened={sceneSelection.opened}
        onCloseModal={() =>
          setSceneSelection({
            opened: false,
            selectedSceneId: null,
            startId: null
          })
        }
      >
        <div className="StartsPanel__scene-selection">
          <div className="StartsPanel__scene-selection-list">
            {scenes.map((scene) => (
              <div
                className={classNames({
                  "StartsPanel__scene-selection-item": true,
                  "StartsPanel__scene-selection-item--selected":
                    scene.id === sceneSelection.selectedSceneId
                })}
                key={scene.id}
                onClick={() => {
                  const start = starts.find(
                    (start) => start.id === sceneSelection.startId
                  );
                  const characters = scene.characters.map((character) => {
                    const outfit =
                      character.card?.data.extensions.mikugg_v2.outfits.find(
                        (outfit) => outfit.id === character.outfit
                      );
                    return {
                      characterId: character.id || "",
                      emotion: outfit?.emotions[0]?.id || "",
                      text: "",
                      pose: "standing"
                    };
                  });
                  if (start) {
                    dispatch(
                      updateStart({
                        ...start,
                        sceneId: scene.id,
                        characters
                      })
                    );
                  } else {
                    dispatch(createStart(scene.id));
                  }
                  setSceneSelection({
                    opened: false,
                    selectedSceneId: null,
                    startId: null
                  });
                }}
              >
                <div
                  className="SceneNode"
                  style={{
                    backgroundImage: `url(${config.genAssetLink(
                      scene.background?.source.jpg || ""
                    )})`
                  }}
                >
                  <div className="SceneNode__title">{scene.name}</div>
                  <div className="SceneNode__characters">
                    {scene.characters.map((character, index) => (
                      <img
                        key={index}
                        src={config.genAssetLink(character.profile_pic || "")}
                        alt={`Character ${index}`}
                        className="SceneNode__character"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
