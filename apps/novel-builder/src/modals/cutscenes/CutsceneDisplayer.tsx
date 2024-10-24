import { CheckBox, Tooltip } from '@mikugg/ui-kit';
import { CutscenesModal } from './CutscenesModal';
import { IoInformationCircleOutline } from 'react-icons/io5';
import './CutsceneDisplayer.scss';
import { selectCutscenes, selectEditingScene } from '../../state/selectors';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { updateTriggerOnlyOnce } from '../../state/slices/novelFormSlice';

export const CutsceneDisplayer = () => {
  const dispatch = useAppDispatch();
  const scene = useAppSelector(selectEditingScene);
  const cutscenes = useAppSelector(selectCutscenes);
  const cutsceneId = scene?.cutScene?.id;
  const cutscene = cutscenes?.find((c) => c.id === cutsceneId);
  return (
    <div className="CutsceneDisplayer">
      <div className="CutsceneDisplayer__header">
        <div className="CutsceneDisplayer__header__title">
          <h2>Cutscene</h2>
          <IoInformationCircleOutline
            data-tooltip-id="Info-cutscene"
            className="CutsceneDisplayer__header__title__infoIcon"
            data-tooltip-content="[Optional]"
          />
          <Tooltip id="Info-cutscene" place="top" />
        </div>
        <CutscenesModal />
      </div>
      {cutscene && scene?.cutScene && (
        <div className="CutsceneDisplayer__info">
          <div className="CutsceneDisplayer__info__title">
            <h3>{cutscene?.name}</h3>
            <p>{cutscene?.parts.length} parts</p>
          </div>
          <CheckBox
            value={scene?.cutScene.triggerOnlyOnce}
            onChange={(e) => {
              dispatch(updateTriggerOnlyOnce({ sceneId: scene.id, triggerOnlyOnce: e.target.checked }));
            }}
            label="Trigger only once"
          />
        </div>
      )}
    </div>
  );
};
