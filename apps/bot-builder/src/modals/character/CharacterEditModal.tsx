import { Modal } from "@mikugg/ui-kit";
import { useAppDispatch, useAppSelector } from "../../state/store";
import CharacterDescriptionEdit from "./CharacterDescriptionEdit";
import { closeModal } from "../../state/slices/inputSlice";

export default function CharacterEditModal() {
  const { opened, editId } = useAppSelector(
    (state) => state.input.modals.character
  );
  const dispatch = useAppDispatch();

  return (
    <Modal
      opened={opened}
      onCloseModal={() => dispatch(closeModal({ modalType: "character" }))}
      shouldCloseOnOverlayClick
    >
      <CharacterDescriptionEdit characterId={editId} />
    </Modal>
  );
}
