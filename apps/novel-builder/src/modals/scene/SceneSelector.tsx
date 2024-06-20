import { Modal } from "@mikugg/ui-kit";
import classNames from "classnames";
import { useDispatch } from "react-redux";
import config from "../../config";
import { selectScenes } from "../../state/selectors";
import { closeModal } from "../../state/slices/inputSlice";
import { useAppSelector } from "../../state/store";
import "./SceneSelector.scss";

export default function SceneSelector() {
  const dispatch = useDispatch();
  const scenes = useAppSelector(selectScenes);
  const currentModal = useAppSelector(
    (state) => state.input.modals.sceneSelector
  );

  return (
    <Modal
      title="Select a Scene"
      opened={currentModal.opened}
      onCloseModal={() =>
        dispatch(
          closeModal({
            modalType: "sceneSelector",
          })
        )
      }
    >
      <div className="StartsPanel__scene-selection">
        <div className="StartsPanel__scene-selection-list">
          {scenes.map((scene) => (
            <div
              className={classNames({
                "StartsPanel__scene-selection-item": true,
                "StartsPanel__scene-selection-item--selected":
                  scene.id === currentModal.text,
              })}
              key={scene.id}
              onClick={() => {
                dispatch(
                  closeModal({
                    modalType: "sceneSelector",
                    text: scene.id,
                  })
                );
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
