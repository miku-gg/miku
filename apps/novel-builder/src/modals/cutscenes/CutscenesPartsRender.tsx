import { v4 as randomUUID } from 'uuid';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { Button, CheckBox, Tooltip } from '@mikugg/ui-kit';
import { selectEditingScene } from '../../state/selectors';
import { createCutscene, createCutscenePart, updateTriggerOnlyOnce } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { openModal } from '../../state/slices/inputSlice';
import './CutscenesPartsRender.scss';
import { FaPencilAlt } from 'react-icons/fa';
import config from '../../config';
import { PartEditModal } from './PartEditModal';
import { IoInformationCircleOutline } from 'react-icons/io5';

export const CutScenePartsRender = () => {
  const dispatch = useAppDispatch();
  const scene = useAppSelector(selectEditingScene);
  const cutscenes = useAppSelector((state) => state.novel.cutscenes);
  const currentCutscene = cutscenes?.find((c) => c.id === scene?.cutScene?.id);
  const parts = currentCutscene?.parts || [];
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const characters = useAppSelector((state) => state.novel.characters);
  const songs = useAppSelector((state) => state.novel.songs);

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

  const getBackgroundAssetSRC = (backgroundId: string) => {
    const background = backgrounds.find((b) => b.id === backgroundId);
    const src = background?.source.mp4 ? background.source.mp4 : background?.source.jpg;
    if (!src) return '';
    if (background?.source.mp4) {
      return config.genAssetLink(src, AssetDisplayPrefix.BACKGROUND_VIDEO);
    }
    return config.genAssetLink(src, AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL);
  };

  const getCharacterAssetSRC = (character: { id: string; outfitId: string; emotionId: string }) => {
    const characterData = characters.find((c) => c.id === character.id);
    if (!characterData) return '';
    const outfit = characterData.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === character.outfitId);
    if (!outfit) return '';
    const emotion = outfit.emotions.find((e) => e.id === character.emotionId);
    if (!emotion) return '';
    return config.genAssetLink(emotion?.sources.png, AssetDisplayPrefix.EMOTION_IMAGE_SMALL);
  };

  const getMusicAssetSRC = (musicId: string) => {
    const song = songs.find((s) => s.id === musicId);
    if (!song) return '';
    return config.genAssetLink(song.source, AssetDisplayPrefix.MUSIC);
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
          <div key={part.id} className="CutScenePartsRender__part">
            <div className="CutScenePartsRender__part__buttons">
              <FaPencilAlt
                className="CutScenePartsRender__part__buttons__icon"
                onClick={() => {
                  dispatch(openModal({ modalType: 'cutscenePartEdit', editId: part.id }));
                }}
              />
            </div>
            <div className="CutScenePartsRender__part__assets">
              <h3>{part.type === 'dialogue' ? 'Dialogue' : 'Description'}</h3>
              <img
                className="CutScenePartsRender__part__assets__background"
                src={getBackgroundAssetSRC(part.background)}
              />
              {part.characters.map((character) => {
                return (
                  <img
                    className="CutScenePartsRender__part__assets__character"
                    key={character.id}
                    src={getCharacterAssetSRC(character)}
                  />
                );
              })}
            </div>

            <div className="CutScenePartsRender__part__content">
              <p>{part.text}</p>
            </div>
            <div className="CutScenePartsRender__part__music">
              <h3>Music</h3>
              {part.music && <audio src={getMusicAssetSRC(part.music)} controls />}
            </div>
          </div>
        ))}
      </div>
      <PartEditModal />
    </div>
  );
};
