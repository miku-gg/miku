import { v4 as randomUUID } from 'uuid';
import { Button, Tooltip } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import {
  createCutscene,
  createCutscenePart,
  deleteCutscene,
  updateGlobalCutscene,
} from '../../state/slices/novelFormSlice';
import './CutscenePartsRender.scss';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { PartEditor } from './PartEditor';
import { useEffect } from 'react';

/**
 * Renders and edits the globalCutscene. If it doesn't exist, we can create it.
 * If it has no parts, we can remove it again.
 */
export const CutScenePartsRenderForGlobal = () => {
  const dispatch = useAppDispatch();
  const { globalStartCutsceneId, cutscenes } = useAppSelector((state) => state.novel);
  const globalStartCutscene = cutscenes?.find((c) => c.id === globalStartCutsceneId);
  const parts = globalStartCutscene?.parts || [];

  // If we have no global cutscene set, we won't show any editor until the user clicks 'Create'
  const hasGlobalCutscene = !!globalStartCutscene;

  const handleCreateCutscene = () => {
    const id = randomUUID();
    dispatch(
      createCutscene({
        cutsceneId: id,
        sceneId: null,
      }),
    );
    dispatch(updateGlobalCutscene(id));
    return id;
  };

  const handleAddPart = () => {
    let cutsceneId: string | undefined = globalStartCutscene?.id;
    if (!cutsceneId) {
      cutsceneId = handleCreateCutscene();
    }
    dispatch(createCutscenePart({ cutsceneId: cutsceneId || '', partId: randomUUID() }));
  };

  // If a user wants to remove the global cutscene entirely, we can just delete it from cutscenes[].
  // Or optionally, set state.novel.globalStartCutscene = undefined
  const handleDeleteCutscene = () => {
    if (!globalStartCutscene) return;
    dispatch(deleteCutscene({ cutsceneId: globalStartCutscene.id, sceneId: '' }));
    dispatch(updateGlobalCutscene(null));
  };

  // If user removes all parts, remove the cutscene entirely
  useEffect(() => {
    if (globalStartCutscene && parts.length === 0) {
      handleDeleteCutscene();
    }
  }, [parts]);

  if (!hasGlobalCutscene) {
    return (
      <div className="CutScenePartsRender">
        <div className="CutScenePartsRender__header">
          <div className="CutScenePartsRender__header__title">
            <h2>Global Start Cutscene</h2>
            <IoInformationCircleOutline
              data-tooltip-id="Info-global-cutscene"
              className="CutScenePartsRender__header__title__infoIcon"
              data-tooltip-content="This cutscene is played once before all other starts/scenes."
            />
            <Tooltip id="Info-global-cutscene" place="top" />
          </div>
          <Button theme="gradient" onClick={handleAddPart}>
            Create
          </Button>
        </div>
      </div>
    );
  }

  // If we do have a globalCutscene, let users edit the parts
  return (
    <div className="CutScenePartsRender">
      <div className="CutScenePartsRender__header">
        <div className="CutScenePartsRender__header__title">
          <h2>Global Start Cutscene</h2>
          <IoInformationCircleOutline
            data-tooltip-id="Info-global-cutscene"
            className="CutScenePartsRender__header__title__infoIcon"
            data-tooltip-content="This cutscene is played once before all other starts/scenes."
          />
          <Tooltip id="Info-global-cutscene" place="top" />
        </div>
        <div className="CutScenePartsRender__header__controls">
          <Button theme="gradient" onClick={handleAddPart}>
            Add Part
          </Button>
          <Button theme="primary" onClick={handleDeleteCutscene}>
            Remove
          </Button>
        </div>
      </div>

      {parts.length > 0 && globalStartCutscene && (
        <div className="CutScenePartsRender__container">
          {parts.map((part) => (
            <PartEditor key={part.id} part={part} cutsceneId={globalStartCutscene.id} />
          ))}
        </div>
      )}
    </div>
  );
};
