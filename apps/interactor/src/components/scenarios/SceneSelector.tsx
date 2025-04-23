import { BiCameraMovie } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { useAppContext } from '../../App.context';
import { trackEvent } from '../../libs/analytics';
import { selectAvailableScenes } from '../../state/selectors';
import { setModalOpened } from '../../state/slices/creationSlice';
import { userDataFetchStart } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import EmotionRenderer from '../emotion-render/EmotionRenderer';
import CreateScene from './CreateScene';
import './SceneSelector.scss';
import SlidePanel from './SlidePanel';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { useI18n } from '../../libs/i18n';

export default function SceneSelector(): JSX.Element | null {
  const dispatch = useAppDispatch();
  const scenes = useAppSelector(selectAvailableScenes);
  const { apiEndpoint, assetLinkLoader, isInteractionDisabled, isPublishedDemo } = useAppContext();

  const slidePanelOpened = useAppSelector((state) => state.creation.scene.slidePanelOpened);
  const createSceneOpened = useAppSelector((state) => state.creation.scene.sceneOpened);
  const { disabled: inputDisabled } = useAppSelector((state) => state.narration.input);
  const { i18n } = useI18n();

  return (
    <div className={`SceneSelector ${slidePanelOpened ? 'SceneSelector--expanded' : ''}`}>
      <button
        className="SceneSelector__trigger icon-button"
        disabled={inputDisabled}
        onClick={() => {
          dispatch(setModalOpened({ id: 'slidepanel', opened: true }));
          trackEvent('scene-sidebar-open');
        }}
      >
        <BiCameraMovie />
      </button>
      <SlidePanel
        opened={slidePanelOpened}
        onClose={() => {
          dispatch(setModalOpened({ id: 'scene', opened: false }));
          dispatch(setModalOpened({ id: 'slidepanel', opened: false }));
        }}
      >
        <div className="SceneSelector__list-container">
          <h2>{createSceneOpened ? i18n('create_scene') : i18n('change_scene')}</h2>
          {createSceneOpened ? (
            <CreateScene />
          ) : (
            <div className="SceneSelector__list">
              {scenes.map((scene, index) => {
                return (
                  <button
                    className="SceneSelector__item"
                    key={`scene-selector-${scene.id}-${index}`}
                    onClick={() => {
                      trackEvent('scene-select');
                      dispatch(
                        setModalOpened({
                          id: 'scene-preview',
                          opened: true,
                          itemId: scene.id,
                        }),
                      );
                    }}
                  >
                    <div
                      className="SceneSelector__item-background"
                      style={{
                        backgroundImage: `url(${assetLinkLoader(
                          scene.backgroundImage || '',
                          AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL,
                        )})`,
                      }}
                    />
                    {scene.characterImages ? (
                      <EmotionRenderer
                        className="SceneSelector__item-emotion"
                        assetLinkLoader={assetLinkLoader}
                        assetUrl={scene.characterImages[0] || ''}
                        isSmall
                      />
                    ) : null}
                    <div className="SceneSelector__item-text">{scene.name}</div>
                  </button>
                );
              })}
              <button
                className="SceneSelector__item"
                onClick={() => {
                  if (isInteractionDisabled) {
                    toast.warn(i18n('please_log_in_to_interact'), {
                      position: 'top-center',
                      style: {
                        top: 10,
                      },
                    });
                    return;
                  }
                  dispatch(
                    setModalOpened({
                      id: 'scene',
                      opened: true,
                    }),
                  );
                  trackEvent('scene-create');
                }}
              >
                <div className="SceneSelector__item-background" style={{ backgroundColor: 'gray' }} />
                <div className="SceneSelector__item-text">{i18n('create_new_scene')}</div>
              </button>

              {!isPublishedDemo ? (
                <button
                  className="SceneSelector__item"
                  onClick={() => {
                    if (isInteractionDisabled) {
                      toast.warn(i18n('please_log_in_to_interact'), {
                        position: 'top-center',
                        style: {
                          top: 10,
                        },
                      });
                      return;
                    }
                    dispatch(
                      setModalOpened({
                        id: 'scene-suggestions',
                        opened: true,
                      }),
                    );
                    dispatch(
                      userDataFetchStart({
                        apiEndpoint,
                      }),
                    );
                    trackEvent('scene-generate');
                  }}
                >
                  <div className="SceneSelector__item-background SceneSelector__item-background--aero">
                    <StarsEffect />
                  </div>
                  <div className="SceneSelector__item-text">
                    {i18n('generate_scene')} <BsStars />
                  </div>
                </button>
              ) : null}
            </div>
          )}
        </div>
      </SlidePanel>
    </div>
  );
}

const StarsEffect = () => {
  const stars = Array.from({ length: 50 }, (_, i) => i);
  return (
    <div className="StarsEffect">
      {stars.map((_, i) => (
        <div className="StarsEffect__star" key={`star-${i}`} />
      ))}
    </div>
  );
};
