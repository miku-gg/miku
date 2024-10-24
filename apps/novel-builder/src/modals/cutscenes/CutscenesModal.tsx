import { Button, Input, Modal, Tooltip } from '@mikugg/ui-kit';
import { RootState, useAppDispatch, useAppSelector } from '../../state/store';
import { v4 as randomUUID } from 'uuid';
import { createCutscene, deleteCutscene, updateCutscene } from '../../state/slices/novelFormSlice';
import { closeModal, openModal } from '../../state/slices/inputSlice';
import { selectEditingCutscene, selectEditingScene } from '../../state/selectors';
import { NovelV3 } from '@mikugg/bot-utils';
import { FaTrashAlt } from 'react-icons/fa';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import './CutsceneModal.scss';
import { CutScenePartsRender } from './CutscenesPartsRender';

export const CutscenesModal = () => {
  const dispatch = useAppDispatch();
  const cutsceneModal = useAppSelector((state: RootState) => state.input.modals.cutscenes);
  const currentCutscene = useAppSelector(selectEditingCutscene);
  const currentScene = useAppSelector(selectEditingScene);
  const currentCutsceneByScene = currentScene?.cutScene;

  const handleCreateCutscene = () => {
    if (!currentScene) return;
    if (currentCutsceneByScene) {
      dispatch(openModal({ modalType: 'cutscenes', editId: currentCutsceneByScene.id }));
      return;
    }
    const id = randomUUID();
    dispatch(createCutscene({ cutsceneId: id, sceneId: currentScene.id }));
    dispatch(openModal({ modalType: 'cutscenes', editId: id }));
  };

  const handleEditCutscene = (cutscene: NovelV3.CutScene) => {
    dispatch(updateCutscene(cutscene));
  };

  const handleDeleteCutscene = () => {
    if (!currentCutscene || !currentScene) return;
    dispatch(deleteCutscene({ cutsceneId: currentCutscene.id, sceneId: currentScene.id }));
    dispatch(closeModal({ modalType: 'cutscenes' }));
  };

  return (
    <>
      <Button theme="gradient" onClick={handleCreateCutscene}>
        {currentCutsceneByScene ? 'Edit Cutscene' : 'Add Cutscene'}
      </Button>
      {currentCutscene && (
        <Modal opened={cutsceneModal.opened} onCloseModal={() => dispatch(closeModal({ modalType: 'cutscenes' }))}>
          <div className="CutsceneModal">
            <div className="CutsceneModal__buttons">
              <FaTrashAlt
                className="CutsceneModal__buttons__removePlace"
                data-tooltip-id="delete-cutscene-tooltip"
                data-tooltip-content="Delete cutscene"
                onClick={() => {
                  handleDeleteCutscene();
                }}
              />
              <IoIosCloseCircleOutline
                className="CutsceneModal__buttons__closeModal"
                onClick={() => {
                  dispatch(closeModal({ modalType: 'cutscenes' }));
                }}
              />
              <Tooltip id="delete-cutscene-tooltip" place="bottom" />
            </div>
            <h2>Add Cutscene</h2>
            <div>
              <Input
                label="Name"
                value={currentCutscene.name}
                onChange={(e) => handleEditCutscene({ ...currentCutscene, name: e.target.value })}
              />
            </div>
            <div>
              <CutScenePartsRender />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
