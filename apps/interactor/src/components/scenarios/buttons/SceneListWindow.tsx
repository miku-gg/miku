import { useAppDispatch, useAppSelector } from '../../../state/store';
import { selectScenes, selectCurrentIndicators, selectCurrentScene } from '../../../state/selectors';
import { Button, Modal } from '@mikugg/ui-kit';
import { setModalOpened } from '../../../state/slices/creationSlice';
import { useAppContext } from '../../../App.context';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { interactionStart } from '../../../state/slices/narrationSlice';
import { addIndicatorToScene } from '../../../state/slices/novelSlice';
import { setMapModal } from '../../../state/slices/settingsSlice';
import { toast } from 'react-toastify';
import { fillTextTemplate } from '../../../libs/prompts/strategies';
import EmotionRenderer from '../../emotion-render/EmotionRenderer';
import { useI18n } from '../../../libs/i18n';
import './SceneListWindow.scss';

interface SceneListWindowProps {
  availableScenes: string[];
  onClose: () => void;
}

export const SceneListWindow = ({ availableScenes, onClose }: SceneListWindowProps) => {
  const dispatch = useAppDispatch();
  const { assetLinkLoader, isInteractionDisabled, servicesEndpoint, apiEndpoint } = useAppContext();
  const { i18n } = useI18n();
  const scenes = useAppSelector(selectScenes);
  const currentIndicators = useAppSelector(selectCurrentIndicators);
  const currentScene = useAppSelector(selectCurrentScene);
  const userName = useAppSelector((state) => state.settings.user.name);

  const handleGoToScene = (sceneId: string) => {
    if (isInteractionDisabled) {
      toast.warn('Please log in to interact.', {
        position: 'top-center',
        style: {
          top: 10,
        },
      });
      return;
    }
    
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) {
      toast.warn('Scene not found.', {
        position: 'top-center',
        style: {
          top: 10,
        },
      });
      return;
    }

    // Close all modals
    dispatch(setModalOpened({ id: 'scene-preview', opened: false }));
    dispatch(setModalOpened({ id: 'slidepanel', opened: false }));
    dispatch(setMapModal(false));
    onClose();

    // Transfer persistent indicators
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

    // Start the scene interaction
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

  return (
    <Modal
      className="SceneListWindow__modal"
      overlayClassName="InteractiveMap__overlay"
      opened={true}
      onCloseModal={onClose}
      shouldCloseOnOverlayClick
    >
      <div className="SceneListWindow__content">
        {(() => {
          // Move current scene to index 0 if it exists in availableScenes
          const orderedScenes = [...availableScenes];
          if (currentScene && availableScenes.includes(currentScene.id)) {
            const currentIndex = orderedScenes.indexOf(currentScene.id);
            orderedScenes.splice(currentIndex, 1);
            orderedScenes.unshift(currentScene.id);
          }
          
          return orderedScenes.map((sceneId) => {
            const sceneData = scenes.find((s) => s.id === sceneId);
            if (!sceneData) return null;
            
            const isCurrentScene = currentScene && sceneId === currentScene.id;
            const currentCharacterName = useAppSelector(
              (state) => state.novel.characters.find((c) => c.id === sceneData.characters[0]?.characterId)?.name,
            );
            
            const prompt = fillTextTemplate(sceneData.prompt || '', {
              user: userName,
              bot: currentCharacterName || '{{char}}',
            });

            const description = sceneData.description
              ? fillTextTemplate(sceneData.description, {
                  user: userName,
                  bot: currentCharacterName || '{{char}}',
                })
              : '';
            
            return (
              <div key={sceneId} className={`SceneListWindow__scene-button ${isCurrentScene ? 'SceneListWindow__scene-button--disabled' : ''}`}>
                <div className="SceneListWindow__scene-button__content">
                  <img
                    className="SceneListWindow__scene-button__background-image"
                    src={assetLinkLoader(sceneData.backgroundImage || '', AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL)}
                    alt={sceneData.name}
                  />
                  <div className="SceneListWindow__scene-button__characters">
                    {sceneData.characterImages?.map((image, index) => {
                      return (
                        <EmotionRenderer
                          key={`scene-character-${index}`}
                          className="SceneListWindow__scene-button__character-emotion"
                          assetLinkLoader={assetLinkLoader}
                          assetUrl={image}
                          isSmall
                        />
                      );
                    })}
                  </div>
                  <div className="SceneListWindow__scene-button__text-container">
                    <h2 className="SceneListWindow__scene-button__title">
                      {sceneData.name || 'Next scene'}
                    </h2>
                    <p className="SceneListWindow__scene-button__prompt">{description || prompt}</p>
                  </div>
                  <div className="SceneListWindow__scene-button__buttons">
                    <Button
                      theme="gradient"
                      disabled={isCurrentScene}
                      onClick={() => !isCurrentScene && handleGoToScene(sceneId)}
                    >
                      {isCurrentScene ? i18n('go_to_scene') : i18n('go_to_scene')}
                    </Button>
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </Modal>
  );
};

export default SceneListWindow;
