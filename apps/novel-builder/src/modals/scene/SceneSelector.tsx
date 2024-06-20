import { Modal } from "@mikugg/ui-kit";
import classNames from "classnames";
import config from "../../config";
import { selectScenes } from "../../state/selectors";
import { useAppSelector } from "../../state/store";
import "./SceneSelector.scss";

interface SceneSelectorProps {
  opened: boolean;
  onCloseModal: () => void;
  selectedSceneId: string;
  onSelectScene: (sceneId: string) => void;
}

export default function SceneSelector({
  opened,
  onCloseModal,
  onSelectScene,
  selectedSceneId,
}: SceneSelectorProps) {
  const scenes = useAppSelector(selectScenes);

  return (
    <Modal
      title="Select a Scene"
      opened={opened}
      onCloseModal={() => onCloseModal()}
    >
      <div className="StartsPanel__scene-selection">
        <div className="StartsPanel__scene-selection-list">
          {scenes.map((scene) => (
            <div
              className={classNames({
                "StartsPanel__scene-selection-item": true,
                "StartsPanel__scene-selection-item--selected":
                  scene.id === selectedSceneId,
              })}
              key={scene.id}
              onClick={() => {
                onSelectScene(scene.id);
                onCloseModal();
              }}
            >
              <div
                className="SceneNode"
                style={{
                  backgroundImage: `url(${config.genAssetLink(
                    scene.background?.source.jpg || ""
                  )})`,
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
  );
}
