import { AreYouSure, Button, Input, Modal } from "@mikugg/ui-kit";
import { useAppSelector } from "../../state/store";
import { selectEditingScene } from "../../state/selectors";
import { useDispatch } from "react-redux";
import { closeModal } from "../../state/slices/inputSlice";
import config from "../../config";
import "./BackgroundEditModal.scss";

export default function SceneEditModal() {
  const scene = useAppSelector(selectEditingScene);
  const dispatch = useDispatch();

  return (
    <Modal
      opened={!!scene}
      title="Edit Scene"
      className="SceneEditModal"
      shouldCloseOnOverlayClick
      onCloseModal={() => dispatch(closeModal({ modalType: "scene" }))}
    >
      {scene ? <div className="SceneEditModal_content"></div> : null}
    </Modal>
  );
}
