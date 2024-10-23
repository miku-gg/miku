import { v4 as randomUUID } from 'uuid';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import { Button } from '@mikugg/ui-kit';
import { selectEditingCutscene } from '../../state/selectors';
import { createCutscenePart, updateCutscenePart } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { openModal } from '../../state/slices/inputSlice';
import './CutscenesPartsRender.scss';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import config from '../../config';
import { PartEditModal } from './PartEditModal';

export const CutScenePartsRender = ({ onDeletePart }: { onDeletePart: (id: string) => void }) => {
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
    <div className="CutScenePartsRender">
      <div className="CutScenePartsRender__header">
        <h2>Parts</h2>
        <Button theme="primary" onClick={handleCreatePart}>
          Create
        </Button>
      </div>
      <div className="CutScenePartsRender__container">
        {parts.length === 0 && <p>No parts yet</p>}
        {parts.map((part) => (
          <div key={part.id} className="CutScenePartsRender__part">
            <div className="CutScenePartsRender__part__buttons">
              <FaPencilAlt
                onClick={() => {
                  updatePart(part);
                }}
              />
              <FaTrashAlt
                onClick={() => {
                  onDeletePart(part.id);
                }}
              />
            </div>
            <div className="CutScenePartsRender__part__content">
              <h3>{part.text}</h3>
              <p>{part.type}</p>
            </div>
            <div className="CutScenePartsRender__part__music">
              <audio src={config.genAssetLink(part.music, AssetDisplayPrefix.MUSIC)} controls />
            </div>
            <div className="CutScenePartsRender__part__assets">
              <img src={config.genAssetLink(part.background, AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL)} />
              {part.characters.map((character) => {
                return (
                  <img
                    key={character.id}
                    src={config.genAssetLink(character.outfitId, AssetDisplayPrefix.ITEM_IMAGE_SMALL)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <PartEditModal />
    </div>
  );
};
