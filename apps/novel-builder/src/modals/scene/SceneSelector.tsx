import { Modal } from "@mikugg/ui-kit";
import classNames from "classnames";
import config from "../../config";
import { selectScenes } from "../../state/selectors";
import { useAppSelector } from "../../state/store";
import "./SceneSelector.scss";
import { IoIosCloseCircleOutline } from "react-icons/io";

interface SceneSelectorProps {
  opened: boolean;
  onCloseModal: () => void;
  selectedSceneId?: string;
  onSelectScene: (sceneId: string) => void;
  selectedScenes?: string[];
}

export default function SceneSelector({
  opened,
  onCloseModal,
  onSelectScene,
  selectedSceneId,
  selectedScenes,
}: SceneSelectorProps) {
  const scenes = useAppSelector(selectScenes);
  const isSelected = (sceneId: string) => {
    return selectedScenes?.includes(sceneId);
  };

  return (
    <Modal
      title="Select a Scene"
      opened={opened}
      onCloseModal={() => onCloseModal()}
    >
      <div className="SceneSelector__scene-selection">
        <IoIosCloseCircleOutline
          className="SceneSelector__closeModal"
          onClick={() => {
            onCloseModal();
          }}
        />
        <div className="SceneSelector__scene-selection-list">
          {scenes.map((scene) => (
            <div
              className={classNames({
                "SceneSelector__scene-selection-item": true,
                "SceneSelector__scene-selection-item--selected": selectedScenes
                  ? isSelected(scene.id)
                  : scene.id === selectedSceneId,
              })}
              key={scene.id}
              onClick={() => {
                onSelectScene(scene.id);
                if (!selectedScenes) {
                  onCloseModal();
                }
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
