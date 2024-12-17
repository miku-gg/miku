import { Button, Modal } from '@mikugg/ui-kit';
import { useAppContext } from '../../App.context';
import { fillTextTemplate } from '../../libs/prompts/strategies';
import { selectCurrentIndicators, selectScenes } from '../../state/selectors';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './SceneChangeModal.scss';
import { setModalOpened } from '../../state/slices/creationSlice';
import { toast } from 'react-toastify';
import { interactionStart } from '../../state/slices/narrationSlice';
import EmotionRenderer from '../emotion-render/EmotionRenderer';
import { setMapModal } from '../../state/slices/settingsSlice';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { useI18n } from '../../libs/i18n';
import { addIndicatorToScene } from '../../state/slices/novelSlice';

export const SceneChangeModal = ({ customSceneId }: { customSceneId?: string }) => {
  const { assetLinkLoader, isInteractionDisabled, servicesEndpoint, apiEndpoint } = useAppContext();
  const { i18n } = useI18n();
  const dispatch = useAppDispatch();
  const userName = useAppSelector((state) => state.settings.user.name);
  const currentIndicators = useAppSelector(selectCurrentIndicators);
  const { opened, sceneId } = useAppSelector((state) => state.creation.scene.scenePreview);
  const scene = useAppSelector(selectScenes).find((s) => s.id === (customSceneId || sceneId));
  const currentCharacterName = useAppSelector(
    (state) => state.novel.characters.find((c) => c.id === scene?.characters[0].characterId)?.name,
  );

  const handleConfirm = () => {
    if (isInteractionDisabled) {
      toast.warn('Please log in to interact.', {
        position: 'top-center',
        style: {
          top: 10,
        },
      });
      return;
    }
    if (!scene) {
      toast.warn('Scene not found.', {
        position: 'top-center',
        style: {
          top: 10,
        },
      });
      return;
    }
    dispatch(setModalOpened({ id: 'scene-preview', opened: false }));
    dispatch(setModalOpened({ id: 'slidepanel', opened: false }));
    dispatch(setMapModal(false));
    currentIndicators
      ?.filter((i) => i.persistent)
      .forEach((i) => {
        dispatch(
          addIndicatorToScene({
            sceneId: scene.id,
            indicator: {
              ...i,
              initialValue: i.currentValue,
            },
          }),
        );
      });
    dispatch(
      interactionStart({
        sceneId,
        isNewScene: true,
        text: scene.prompt || '',
        characters: scene.characters.map((r) => r.characterId) || [],
        servicesEndpoint,
        apiEndpoint,
        selectedCharacterId:
          (scene.characters.length &&
            scene.characters[Math.floor(Math.random() * (scene.characters.length || 0))].characterId) ||
          '',
      }),
    );
  };

  const handleCloseModal = () => {
    dispatch(setModalOpened({ id: 'scene-preview', opened: false }));
  };

  const prompt = fillTextTemplate(scene?.prompt || '', {
    user: userName,
    bot: currentCharacterName || '{{char}}',
  });

  const description = scene?.description
    ? fillTextTemplate(scene.description, {
        user: userName,
        bot: currentCharacterName || '{{char}}',
      })
    : '';

  return (
    <Modal className="SceneChangeModal" opened={opened} onCloseModal={() => handleCloseModal()}>
      <div className="SceneChangeModal__content">
        <img
          className="SceneChangeModal__background-image"
          src={assetLinkLoader(scene?.backgroundImage || '', AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL)}
        />
        <div className="SceneChangeModal__characters">
          {scene?.characterImages?.map((image, index) => {
            return (
              <EmotionRenderer
                key={`scene-character-${index}`}
                className="SceneChangeModal__character-emotion"
                assetLinkLoader={assetLinkLoader}
                assetUrl={image}
                isSmall
              />
            );
          })}
        </div>
        <div className="SceneChangeModal__text-container">
          <h2 className="SceneChangeModal__title">{scene?.name || 'Next scene'}</h2>
          <p className="SceneChangeModal__prompt">{description || prompt}</p>
        </div>
        <div className="SceneChangeModal__buttons">
          <Button theme="secondary" onClick={() => handleCloseModal()}>
            {i18n('cancel')}
          </Button>
          <Button theme="gradient" onClick={() => handleConfirm()}>
            {i18n('go_to_scene')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
