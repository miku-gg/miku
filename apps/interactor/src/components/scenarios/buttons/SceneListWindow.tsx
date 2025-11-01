import { useAppDispatch, useAppSelector } from '../../../state/store';
import { selectScenes, selectCurrentIndicators, selectCurrentScene } from '../../../state/selectors';
import { Button, Modal } from '@mikugg/ui-kit';
import { setModalOpened } from '../../../state/slices/creationSlice';
import { useAppContext } from '../../../App.context';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { navigateToScene } from '../../../state/slices/narrationSlice';
import { addIndicatorToScene } from '../../../state/slices/novelSlice';
import { setMapModal } from '../../../state/slices/settingsSlice';
import { toast } from 'react-toastify';
import { fillTextTemplate } from '../../../libs/prompts/strategies';
import EmotionRenderer from '../../emotion-render/EmotionRenderer';
import { useI18n } from '../../../libs/i18n';
import { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './SceneListWindow.scss';
import { CustomEventType, postMessage } from '../../../libs/stateEvents';

interface SceneListWindowProps {
  availableScenes: string[];
  onClose: () => void;
}

export const SceneListWindow = ({ availableScenes, onClose }: SceneListWindowProps) => {
  const dispatch = useAppDispatch();
  const { assetLinkLoader, isInteractionDisabled } = useAppContext();
  const { i18n } = useI18n();
  const scenes = useAppSelector(selectScenes);
  const currentIndicators = useAppSelector(selectCurrentIndicators);
  const currentScene = useAppSelector(selectCurrentScene);
  const userName = useAppSelector((state) => state.settings.user.name);
  const isPremium = useAppSelector((state) => state.settings.user.isPremium);

  const [topFadeSize, setTopFadeSize] = useState(0);
  const [bottomFadeSize, setBottomFadeSize] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const maxFadeSize = 60;

    // Calculate top fade size (0 to 60px based on scroll position)
    const topFade = Math.min(maxFadeSize, Math.max(0, scrollTop));
    setTopFadeSize(topFade);

    // Calculate bottom fade size (0 to 60px based on distance from bottom)
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const bottomFade = Math.min(maxFadeSize, Math.max(0, distanceFromBottom));
    setBottomFadeSize(bottomFade);
  };

  useEffect(() => {
    // Add a small delay to ensure the element is fully rendered
    const timer = setTimeout(() => {
      const scrollElement = scrollRef.current;
      if (!scrollElement) return;

      handleScroll();
      scrollElement.addEventListener('scroll', handleScroll);
    }, 100);

    return () => {
      clearTimeout(timer);
      const scrollElement = scrollRef.current;
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [availableScenes]);

  const handleGoToScene = (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    const isLocked = scene && scene.characters.length > 2 && !isPremium;

    if (isLocked) {
      postMessage(CustomEventType.OPEN_PREMIUM);
      return;
    }

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

    dispatch(
      navigateToScene({
        sceneId,
        isNewScene: true,
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
      <div className="SceneListWindow__container">
        <div className="SceneListWindow__header">
          <Button theme="secondary" onClick={onClose}>
            <FaTimes size={20} />
          </Button>
        </div>
        <div
          className="SceneListWindow__scroll-container scrollbar"
          ref={scrollRef}
          style={{
            mask: `linear-gradient(to bottom, transparent 0px, black ${Math.max(
              1,
              topFadeSize,
            )}px, black calc(100% - ${Math.max(1, bottomFadeSize)}px), transparent 100%)`,
            WebkitMask: `linear-gradient(to bottom, transparent 0px, black ${Math.max(
              1,
              topFadeSize,
            )}px, black calc(100% - ${Math.max(1, bottomFadeSize)}px), transparent 100%)`,
          }}
        >
          <div className="SceneListWindow__content">
            {(() => {
              // Move current scene to index 0 if it exists in availableScenes
              // Then move locked scenes to the end
              const orderedScenes = [...availableScenes];
              let currentSceneId: string | null = null;

              if (currentScene && availableScenes.includes(currentScene.id)) {
                currentSceneId = currentScene.id;
                const currentIndex = orderedScenes.indexOf(currentScene.id);
                orderedScenes.splice(currentIndex, 1);
              }

              // Separate locked and unlocked scenes
              const lockedScenes: string[] = [];
              const unlockedScenes: string[] = [];

              orderedScenes.forEach((sceneId) => {
                const sceneData = scenes.find((s) => s.id === sceneId);
                const isLocked = sceneData && sceneData.characters.length > 2 && !isPremium;
                if (isLocked) {
                  lockedScenes.push(sceneId);
                } else {
                  unlockedScenes.push(sceneId);
                }
              });

              const finalOrder: string[] = [];
              if (currentSceneId) {
                finalOrder.push(currentSceneId);
              }
              finalOrder.push(...unlockedScenes);
              finalOrder.push(...lockedScenes);

              return finalOrder.map((sceneId) => {
                const sceneData = scenes.find((s) => s.id === sceneId);
                if (!sceneData) return null;

                const isCurrentScene = currentScene && sceneId === currentScene.id;
                const isLocked = sceneData.characters.length > 2 && !isPremium;
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
                  <div
                    key={sceneId}
                    className={`SceneListWindow__scene-button ${
                      isCurrentScene || isLocked ? 'SceneListWindow__scene-button--disabled' : ''
                    }`}
                  >
                    <div className="SceneListWindow__scene-button__content">
                      <img
                        className="SceneListWindow__scene-button__background-image"
                        src={assetLinkLoader(
                          sceneData.backgroundImage || '',
                          AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL,
                        )}
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
                        <h2 className="SceneListWindow__scene-button__title">{sceneData.name || 'Next scene'}</h2>
                        <p className="SceneListWindow__scene-button__prompt">{description || prompt}</p>
                      </div>
                      <div className="SceneListWindow__scene-button__buttons">
                        <Button
                          theme="gradient"
                          disabled={isCurrentScene || isLocked}
                          onClick={() => !isCurrentScene && !isLocked && handleGoToScene(sceneId)}
                        >
                          {isCurrentScene ? i18n('you_are_here') : isLocked ? i18n('locked') : i18n('go_to_scene')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SceneListWindow;
