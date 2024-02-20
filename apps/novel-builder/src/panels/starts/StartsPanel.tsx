import { Button, Dropdown, Input, AreYouSure } from "@mikugg/ui-kit";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { createStart, updateStart } from "../../state/slices/novelFormSlice";
import { selectScenes } from "../../state/selectors";
import config from "../../config";
import "./StartsPanel.scss";

export default function StartsPanel() {
  const dispatch = useAppDispatch();
  const starts = useAppSelector((state) => state.novel.starts);
  const characters = useAppSelector((state) => state.novel.characters);
  const scenes = useAppSelector(selectScenes);
  const { openModal: openAreYouSureModal } = AreYouSure.useAreYouSure();

  const handleAddStartClick = () => {
    dispatch(createStart(scenes[0].id));
  };

  return (
    <div className="StartsPanel">
      <div className="StartsPanel__title">Starts</div>
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
                      )})`,
                    }}
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
                    value={start.title || ""}
                    onChange={(e) =>
                      dispatch(updateStart({ ...start, title: e.target.value }))
                    }
                  />
                  <Input
                    label="Description"
                    value={start.description || ""}
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
                        <div className="StartsPanel__item-prompt-character-emotion">
                          <Dropdown
                            items={
                              outfit?.emotions.map((emotion) => ({
                                name: emotion.id,
                                value: emotion.id,
                              })) || []
                            }
                            selectedIndex={selectedEmotionIndex}
                            onChange={(index) =>
                              dispatch(
                                updateStart({
                                  ...start,
                                  characters: start.characters.map((char, i) =>
                                    i === index
                                      ? {
                                          ...char,
                                          emotion:
                                            outfit?.emotions[index].id || "",
                                        }
                                      : char
                                  ),
                                })
                              )
                            }
                          />
                        </div>
                      </div>
                      <Input
                        value={_character.text || ""}
                        isTextArea
                        onChange={(e) =>
                          dispatch(
                            updateStart({
                              ...start,
                              characters: start.characters.map((char, i) =>
                                i === index
                                  ? { ...char, text: e.target.value }
                                  : char
                              ),
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
                    // openAreYouSureModal
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
        <Button theme="secondary" onClick={handleAddStartClick}>
          Add Start
        </Button>
      </div>
    </div>
  );
}
