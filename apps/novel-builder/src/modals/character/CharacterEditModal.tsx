import { Button, Modal } from "@mikugg/ui-kit";
import { useAppDispatch, useAppSelector } from "../../state/store";
import CharacterDescriptionEdit from "./CharacterDescriptionEdit";
import { closeModal } from "../../state/slices/inputSlice";
import ButtonGroup from "../../components/ButtonGroup";
import { useEffect, useState } from "react";
import CharacterOutfitsEdit from "./CharacterOutfitsEdit";
import "./CharacterEditModal.scss";
import { AreYouSure } from "@mikugg/ui-kit";
import { deleteCharacter } from "../../state/slices/novelFormSlice";

export default function CharacterEditModal() {
  const { openModal } = AreYouSure.useAreYouSure();
  const { opened, editId } = useAppSelector(
    (state) => state.input.modals.character
  );
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<string>("prompt");

  useEffect(() => {
    if (opened) {
      setSelected("prompt");
    }
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onCloseModal={() => dispatch(closeModal({ modalType: "character" }))}
      shouldCloseOnOverlayClick
      className="CharacterEditModal"
    >
      <ButtonGroup
        selected={selected}
        onButtonClick={(value) => setSelected(value)}
        buttons={[
          {
            text: "Description",
            value: "prompt",
          },
          {
            text: "Outfits",
            value: "outfits",
          },
        ]}
      />
      <div className="CharacterEditModal__delete">
        <Button
          theme="primary"
          onClick={() =>
            openModal({
              onYes: () => {
                dispatch(closeModal({ modalType: "character" }));
                dispatch(deleteCharacter(editId || ""));
              },
            })
          }
        >
          Delete character
        </Button>
      </div>
      {selected === "prompt" ? (
        <CharacterDescriptionEdit characterId={editId} />
      ) : null}
      {selected === "outfits" ? (
        <CharacterOutfitsEdit characterId={editId} />
      ) : null}
    </Modal>
  );
}