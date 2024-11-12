import { v4 as randomUUID } from 'uuid';
import { Button, CheckBox, Tooltip } from '@mikugg/ui-kit';
import { selectEditingScene } from '../../state/selectors';
import { createCutscene, createCutscenePart, updateTriggerOnlyOnce } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { openModal } from '../../state/slices/inputSlice';
import './CutscenesPartsRender.scss';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { PartEditor } from './PartEditor';

export const CutScenePartsRender = () => {
  const dispatch = useAppDispatch();
  const scene = useAppSelector(selectEditingScene);
  const cutscenes = useAppSelector((state) => state.novel.cutscenes);
  const currentCutscene = cutscenes?.find((c) => c.id === scene?.cutScene?.id);
  const parts = currentCutscene?.parts || [];

  const handleCreateCutscene = () => {
    if (!scene) return;
    const id = randomUUID();
    dispatch(createCutscene({ cutsceneId: id, sceneId: scene.id }));
    return id;
  };

  const handleCreatePart = () => {
    let cutsceneId: string | undefined;
    if (!currentCutscene || !scene?.cutScene) {
      cutsceneId = handleCreateCutscene();
    }
    const partId = randomUUID();
    dispatch(createCutscenePart({ cutsceneId: cutsceneId || currentCutscene!.id, partId: partId }));
    dispatch(openModal({ modalType: 'cutscenePartEdit', editId: partId }));
  };

  return (
    <div className="CutScenePartsRender">
      <div className="CutScenePartsRender__header">
        <div className="CutScenePartsRender__header__title">
          <h2>Cutscene</h2>
          <IoInformationCircleOutline
            data-tooltip-id="Info-cutscene"
            className="CutScenePartsRender__header__title__infoIcon"
            data-tooltip-content="[Optional] The cutscene will be triggered before the scene starts, only once or every time the scene is loaded"
          />
          <Tooltip id="Info-cutscene" place="top" />
        </div>
        <div className="CutScenePartsRender__header__controls">
          <CheckBox
            value={scene?.cutScene?.triggerOnlyOnce}
            onChange={(e) => {
              if (!scene) return;
              dispatch(updateTriggerOnlyOnce({ sceneId: scene.id, triggerOnlyOnce: e.target.checked }));
            }}
            label="Trigger only once"
          />
          <Button theme="primary" onClick={handleCreatePart}>
            Create
          </Button>
        </div>
      </div>
      <div className="CutScenePartsRender__container">
        {parts.map((part) => (
          <PartEditor key={part.id} part={part} />
        ))}
      </div>
    </div>
  );
};
