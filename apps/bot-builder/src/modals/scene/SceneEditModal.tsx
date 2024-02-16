import { AreYouSure, Button, Input, Modal } from "@mikugg/ui-kit";
import { useAppSelector, useAppDispatch } from "../../state/store";
import { selectEditingScene, selectBackgrounds } from "../../state/selectors";
import {
  updateScene,
  deleteSceneById,
} from "../../state/slices/novelFormSlice";
import { closeModal } from "../../state/slices/inputSlice";
import config from "../../config";
import "./SceneEditModal.scss";
import { RiEdit2Line } from "react-icons/ri";
import { NovelScene } from "../../state/NovelFormState";

export default function SceneEditModal() {
  const dispatch = useAppDispatch();
  const { openModal: openAreYouSure } = AreYouSure.useAreYouSure();
  const scene = useAppSelector(selectEditingScene);
  const backgrounds = useAppSelector(selectBackgrounds);
  const characters = useAppSelector((state) => state.novel.characters);

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
    <Modal
      opened={!!scene}
      title="Edit Scene"
      className="SceneEditModal"
      shouldCloseOnOverlayClick
      onCloseModal={() => dispatch(closeModal({ modalType: "scene" }))}
    >
      {scene ? (
        <div className="SceneEditModal_content">
          <Input
            label="Scene Name"
            value={scene?.name || ""}
            onChange={handleSceneNameChange}
          />
          <div className="SceneEditModal_background">
            <img
              src={config.genAssetLink(
                scene?.background?.source.jpg || backgrounds[0].source.jpg
              )}
              alt="Background"
            />
            <RiEdit2Line className="SceneEditModal_edit-icon" />
          </div>
          {/* TODO: Add character selection list */}
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
  );
}
