import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  TagAutocomplete,
} from "@mikugg/ui-kit";
import { useState } from "react";
import {
  createEntry,
  deleteEntry,
  updateEntry,
  updateLorebook,
} from "../../state/slices/novelFormSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import "./CharacterLorebooks.scss";

interface CharacterLorebooksProps {
  characterId: string;
}

export const CharacterLorebooks = ({
  characterId,
}: CharacterLorebooksProps) => {
  const [selectedEntry, setSelectedEntry] = useState<number>(0);
  const dispatch = useAppDispatch();
  const character = useAppSelector((state) =>
    state.novel.characters.find((c) => c.id === characterId)
  );
  if (!character || !characterId) {
    return null;
  }
  const { lorebook } = character;

  return (
    <div className="CharacterLorebooks scrollbar">
      <div>
        <label>Book name</label>
        <Input
          placeHolder="Name for your memory book"
          value={lorebook?.name}
          onChange={(e) =>
            dispatch(
              updateLorebook({
                characterId,
                lorebook: { ...lorebook!, name: e.target.value },
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
                characterId,
                lorebook: { ...lorebook!, description: e.target.value },
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
                characterId,
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
        onRemoveItem={(index) => {
          dispatch(deleteEntry({ characterId, entryIndex: index }));
        }}
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
                        characterId,
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
                        characterId,
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
                        characterId,
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
  );
};
