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
import { useState, useEffect } from "react";
import { RiEdit2Line } from "react-icons/ri";

export default function SceneEditModal() {
  const dispatch = useAppDispatch();
  const { openModal: openAreYouSure } = AreYouSure.useAreYouSure();
  const scene = useAppSelector(selectEditingScene);
  const backgrounds = useAppSelector(selectBackgrounds);
  const characters = useAppSelector((state) => state.novel.characters);

  const [sceneName, setSceneName] = useState(scene?.name || "");
  const [scenePrompt, setScenePrompt] = useState(scene?.prompt || "");
  const [selectedBackground, setSelectedBackground] = useState(
    scene?.background || backgrounds[0]
  );
  const [selectedCharacters, setSelectedCharacters] = useState(
    scene?.characters || []
  );
  const [selectedMusic, setSelectedMusic] = useState(scene?.music || "");

  useEffect(() => {
    if (scene) {
      setSceneName(scene.name);
      setScenePrompt(scene.prompt);
      setSelectedBackground(scene.background);
      setSelectedCharacters(scene.characters);
      setSelectedMusic(scene.music);
    }
  }, [scene]);

  const handleSceneNameChange = (e) => {
    const newName = e.target.value;
    setSceneName(newName);
    if (scene) {
      dispatch(updateScene({ ...scene, name: newName }));
    }
  };

  const handleScenePromptChange = (e) => {
    const newPrompt = e.target.value;
    setScenePrompt(newPrompt);
    if (scene) {
      dispatch(updateScene({ ...scene, prompt: newPrompt }));
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
            value={sceneName}
            onChange={handleSceneNameChange}
          />
          <div className="SceneEditModal_background">
            <img
              src={config.genAssetLink(selectedBackground.source.jpg)}
              alt="Background"
            />
            <RiEdit2Line className="SceneEditModal_edit-icon" />
          </div>
          {/* TODO: Add character selection list */}
          {/* TODO: Add music selection */}
          <Input
            label="Scene Prompt"
            value={scenePrompt}
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
