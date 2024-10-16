import { Button, Input, Modal, Tooltip } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { selectEditingCutscene, selectEditingCutscenePart } from '../../state/selectors';
import { closeModal } from '../../state/slices/inputSlice';
import ButtonGroup from '../../components/ButtonGroup';
import { deleteCutscenePart, updateCutscenePart } from '../../state/slices/novelFormSlice';
import { NovelV3 } from '@mikugg/bot-utils';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { FaTrashAlt } from 'react-icons/fa';
import './PartEditModal.scss';

export const PartEditModal = () => {
  const dispatch = useAppDispatch();
  const part = useAppSelector(selectEditingCutscenePart);
  const opened = useAppSelector((state) => state.input.modals.cutscenePartEdit.opened);
  const currentCutscene = useAppSelector(selectEditingCutscene);

  const handleClose = () => {
    dispatch(closeModal({ modalType: 'cutscenePartEdit' }));
  };

  const updatePart = (part: NovelV3.CutScenePart) => {
    if (!currentCutscene) return;
    dispatch(updateCutscenePart({ cutsceneId: currentCutscene.id, part }));
  };

  const deletePart = () => {
    if (!currentCutscene || !part) return;
    dispatch(deleteCutscenePart({ cutsceneId: currentCutscene.id, partId: part.id }));
    dispatch(closeModal({ modalType: 'cutscenePartEdit' }));
  };

  if (!part) return null;

  return (
    <>
      <Modal opened={opened} onCloseModal={handleClose}>
        <div className="PartEditModal">
          <div className="PartEditModal__buttons">
            <FaTrashAlt
              className="PartEditModal__buttons__removePlace"
              data-tooltip-id="delete-cutscene-tooltip"
              data-tooltip-content="Delete cutscene"
              onClick={() => {
                deletePart();
              }}
            />
            <IoIosCloseCircleOutline
              className="PartEditModal__buttons__closeModal"
              onClick={() => {
                handleClose();
              }}
            />
            <Tooltip id="delete-cutscene-part-tooltip" place="bottom" />
          </div>
          <h1>Edit Part</h1>
          <div key={part.id}>
            <Input value={part.text} onChange={(e) => updatePart({ ...part, text: e.target.value })} />
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
        </div>
      </Modal>
    </>
  );
};
