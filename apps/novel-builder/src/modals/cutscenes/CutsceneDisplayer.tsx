import { Tooltip } from '@mikugg/ui-kit';
import { CutscenesModal } from './CutscenesModal';
import { IoInformationCircleOutline } from 'react-icons/io5';
import './CutsceneDisplayer.scss';
import { selectCutscenes, selectEditingScene } from '../../state/selectors';
import { useAppSelector } from '../../state/store';

export const CutsceneDisplayer = () => {
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
    </div>
  );
};
