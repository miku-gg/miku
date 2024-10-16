import { v4 as randomUUID } from 'uuid';
import { NovelV3 } from '@mikugg/bot-utils';
import { Button, Input } from '@mikugg/ui-kit';
import ButtonGroup from '../../components/ButtonGroup';
import { selectEditingCutscene } from '../../state/selectors';
import { createCutscenePart, updateCutscenePart } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { openModal } from '../../state/slices/inputSlice';

export const CutScenePartsRender = ({
  onDeletePart,
}: {
  onDeletePart: (id: string) => void;
}) => {
  const dispatch = useAppDispatch();
  const currentCutscene = useAppSelector(selectEditingCutscene);
  const parts = currentCutscene?.parts || [];
  const handleCreatePart = () => {
    if (!currentCutscene) return;
    const id = randomUUID();
    dispatch(createCutscenePart({ cutsceneId: currentCutscene.id, partId: id }));
    dispatch(openModal({ modalType: 'cutscenePartEdit', editId: id }));
  };

  const updatePart = (part: NovelV3.CutScenePart) => {
    if (!currentCutscene) return;
    dispatch(updateCutscenePart({ cutsceneId: currentCutscene.id, part }));
  };  

  return (
    <div>
      <div>
        <h3>Parts</h3>
        <Button theme="primary" onClick={handleCreatePart}>
          Create
        </Button>
      </div>
      <div>
        {parts.map((part) => (
          <div key={part.id}>
            <Input value={part.text} onChange={(e) => updatePart({ ...part, text: e.target.value })} />
            <Button theme="primary" onClick={() => onDeletePart(part.id)}>
              Delete
            </Button>
            <ButtonGroup
              buttons={[
                { content: 'Dialogue', value: 'dialogue' },
                { content: 'Description', value: 'description' },
              ]}
              selected={part.type}
              onButtonClick={(b) => updatePart({ ...part, type: b as 'dialogue' | 'description' })}
            />
            <div></div>
          </div>
        ))}
      </div>
    </div>
  );
};
