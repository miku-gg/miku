import {
  Accordion,
  AccordionItem,
  AreYouSure,
  Button,
  Input,
  Modal,
  TagAutocomplete,
  Tooltip,
} from "@mikugg/ui-kit";
import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { selectEditingLorebook } from "../state/selectors";
import { closeModal } from "../state/slices/inputSlice";
import {
  createEntry,
  deleteLorebook,
  updateEntry,
  updateLorebook,
} from "../state/slices/novelFormSlice";
import { useAppSelector } from "../state/store";
import "./LorebookEditModal.scss";

export default function LorebookEditModal() {
  const lorebook = useAppSelector(selectEditingLorebook);
  const dispatch = useDispatch();
  const { openModal } = AreYouSure.useAreYouSure();
  const [selectedEntry, setSelectedEntry] = useState<number>(0);

  if (!lorebook) {
    return null;
  }
  const handleDeleteLorebook = () => {
    openModal({
      title: "Are you sure?",
      description: "This action cannot be undone",
      onYes: () => {
        dispatch(closeModal({ modalType: "lorebookEdit" }));
        dispatch(deleteLorebook({ lorebookId: lorebook.id }));
      },
    });
  };

  return (
    <Modal
      opened={!!lorebook}
      shouldCloseOnOverlayClick
      onCloseModal={() => dispatch(closeModal({ modalType: "lorebookEdit" }))}
    >
      {lorebook ? (
        <div className="CharacterLorebooks scrollbar">
          <h2 className="CharacterLorebooks__title">Edit Lorebook</h2>
          <Tooltip id="delete-tooltip" place="bottom" />
          <FaTrashAlt
            className="CharacterLorebooks__remove"
            data-tooltip-id="delete-tooltip"
            data-tooltip-content="Delete lorebook"
            onClick={() => {
              handleDeleteLorebook();
            }}
          />
          <div>
            <label>Book name</label>
            <Input
              placeHolder="Name for your memory book"
              value={lorebook?.name}
              onChange={(e) =>
                dispatch(
                  updateLorebook({
                    lorebookId: lorebook.id,
                    lorebook: { ...lorebook, name: e.target.value },
                  })
                )
              }
            />
          </div>
          <div>
            <label>Book description</label>
            <Input
              placeHolder="Description of your memory book"
              value={lorebook?.description}
              onChange={(e) =>
                dispatch(
                  updateLorebook({
                    lorebookId: lorebook.id,
                    lorebook: {
                      ...lorebook!,
                      description: e.target.value,
                    },
                  })
                )
              }
            />
          </div>
          <div className="CharacterLorebooks__createEntry">
            <label>Entries</label>
            <Button
              theme="gradient"
              onClick={() =>
                dispatch(
                  createEntry({
                    lorebookId: lorebook.id,
                  })
                )
              }
            >
              + Entry
            </Button>
          </div>
          <Accordion
            selectedIndex={selectedEntry}
            onChange={(index) => {
              setSelectedEntry(index);
            }}
            // onRemoveItem={(index) => {
            //   dispatch(deleteEntry({ characterId, entryIndex: index }));
            // }}
          >
            {lorebook?.entries &&
              lorebook?.entries.map((entry, index) => (
                <AccordionItem
                  title={entry.name ? entry.name : `Entry ${index + 1}`}
                  key={`Entry-${index + 1}`}
                >
                  <div
                    className="CharacterLorebooks__entries"
                    id={`${entry.name!}-${index}`}
                  >
                    <Input
                      label="Entry name"
                      className="CharacterLorebooks__entryName__input"
                      placeHolder="Entry name. E.g. Food memories."
                      value={entry.name}
                      onChange={(e) => {
                        dispatch(
                          updateEntry({
                            entryIndex: index,
                            lorebookId: lorebook.id,
                            entry: { ...entry, name: e.target.value },
                          })
                        );
                      }}
                    />
                    <TagAutocomplete
                      label="Keywords"
                      description="Keywords for this entry."
                      value={entry.keys.map((_key) => ({
                        label: _key,
                        value: _key,
                      }))}
                      onChange={(e) => {
                        dispatch(
                          updateEntry({
                            entryIndex: index,
                            lorebookId: lorebook.id,
                            entry: { ...entry, keys: e.target.value },
                          })
                        );
                      }}
                      tags={[]}
                    />
                    <Input
                      isTextArea
                      label="Content"
                      description="This text will be send when one of the keywords is used."
                      placeHolder="Memory entry. E.g. {{user}} likes a lot of coffee."
                      value={entry.content}
                      onChange={(e) => {
                        dispatch(
                          updateEntry({
                            entryIndex: index,
                            lorebookId: lorebook.id,
                            entry: { ...entry, content: e.target.value },
                          })
                        );
                      }}
                    />
                  </div>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      ) : null}
    </Modal>
  );
}
