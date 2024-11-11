import { Button, CheckBox, Tooltip } from '@mikugg/ui-kit';
import { CutscenesModal } from './CutscenesModal';
import { IoInformationCircleOutline } from 'react-icons/io5';
import './CutsceneDisplayer.scss';
import { selectCutscenes, selectEditingScene } from '../../state/selectors';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { createCutscene, createCutscenePart, updateTriggerOnlyOnce } from '../../state/slices/novelFormSlice';
import { CutScenePartsRender } from './CutscenesPartsRender';
import { openModal } from '../../state/slices/inputSlice';
import { v4 as randomUUID } from 'uuid';
import { PartEditModal } from './PartEditModal';

export const CutsceneDisplayer = () => {
  const dispatch = useAppDispatch();
  const scene = useAppSelector(selectEditingScene);
  const cutscenes = useAppSelector(selectCutscenes);
  const cutsceneId = scene?.cutScene?.id;
  const cutscene = cutscenes?.find((c) => c.id === cutsceneId);

  const handleCreateCutscene = () => {
    if (!scene) return;
    const id = randomUUID();
    dispatch(createCutscene({ cutsceneId: id, sceneId: scene.id }));
  };

  const handleCreatePart = () => {
    if (!scene?.cutScene) return;
    const id = randomUUID();
    dispatch(createCutscenePart({ cutsceneId: scene.cutScene.id, partId: id }));
    dispatch(openModal({ modalType: 'cutscenePartEdit', editId: id }));
  };

  const handleAddPart = () => {
    if (!scene) return;
    if (!scene.cutScene) {
      handleCreateCutscene();
      handleCreatePart();
    } else {
      handleCreatePart();
    }
  };

  return (
    <div className="CutsceneDisplayer">
      <div className="CutsceneDisplayer__header">
        <div className="CutsceneDisplayer__header__title">
          <h2>Cutscene</h2>
          <IoInformationCircleOutline
            data-tooltip-id="Info-cutscene"
            className="CutsceneDisplayer__header__title__infoIcon"
            data-tooltip-content="[Optional] The cutscene will be triggered before the scene starts, only once or every time the scene is loaded"
          />
          <Tooltip id="Info-cutscene" place="top" />
        </div>
        {/* <CutscenesModal /> */}
        <Button theme="gradient" onClick={handleAddPart}>
          Add Part
        </Button>
      </div>
      {cutscene && scene?.cutScene && (
        <div
        // className="CutsceneDisplayer__info"
        >
          <CheckBox
            value={scene?.cutScene.triggerOnlyOnce}
            onChange={(e) => {
              dispatch(updateTriggerOnlyOnce({ sceneId: scene.id, triggerOnlyOnce: e.target.checked }));
            }}
            label="Trigger only once"
          />
          <CutScenePartsRender />
        </div>
      )}
      <PartEditModal />
    </div>
  );
};
