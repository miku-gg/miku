import { Accordion, AccordionItem, Button, Input } from "@mikugg/ui-kit";
import { createEntry, updateLorebook } from "../../state/slices/novelFormSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";

interface CharacterLorebooksProps {
  characterId: string;
}

export const CharacterLorebooks = ({
  characterId,
}: CharacterLorebooksProps) => {
  const dispatch = useAppDispatch();
  const character = useAppSelector((state) =>
    state.novel.characters.find((c) => c.id === characterId)
  );
  if (!character || !characterId) {
    return null;
  }
  const { lorebook } = character;
  console.log(lorebook);

  return (
    <div>
      <h2>Create character book</h2>
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
      <div>
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
      <Accordion selectedIndex={0} onChange={() => {}} onRemoveItem={() => {}}>
        {lorebook?.entries &&
          lorebook?.entries.map((entry) => (
            <AccordionItem title={entry.name!} key={`entry-${entry.name}`}>
              xd
            </AccordionItem>
          ))}
      </Accordion>
    </div>
  );
};
