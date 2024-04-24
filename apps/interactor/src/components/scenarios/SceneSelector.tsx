import EmotionRenderer from '../emotion-render/EmotionRenderer'
import { BiCameraMovie } from 'react-icons/bi'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { selectAvailableScenes } from '../../state/selectors'
import { useAppContext } from '../../App.context'
import { interactionStart } from '../../state/slices/narrationSlice'
import './SceneSelector.scss'
import SlidePanel from './SlidePanel'
import CreateScene from './CreateScene'
import { setModalOpened } from '../../state/slices/creationSlice'
import { toast } from 'react-toastify'
import { BsStars } from 'react-icons/bs'
import { trackEvent } from '../../libs/analytics'

export default function SceneSelector(): JSX.Element | null {
  const dispatch = useAppDispatch()
  const backgrounds = useAppSelector((state) => state.novel.backgrounds)
  const scenes = useAppSelector(selectAvailableScenes)
  const {
    assetLinkLoader,
    servicesEndpoint,
    isInteractionDisabled,
    isMobileApp,
  } = useAppContext()

  const slidePanelOpened = useAppSelector(
    (state) => state.creation.scene.slidePanelOpened
  )
  const createSceneOpened = useAppSelector(
    (state) => state.creation.scene.sceneOpened
  )
  const { disabled: inputDisabled } = useAppSelector(
    (state) => state.narration.input
  )

  const handleItemClick = (id: string, prompt: string) => {
    if (isInteractionDisabled) {
      toast.warn('Please log in to interact.', {
        position: 'top-center',
        style: {
          top: 10,
        },
      })
      return
    }
    const scene = scenes.find((s) => s.id === id)
    dispatch(setModalOpened({ id: 'slidepanel', opened: false }))
    dispatch(
      interactionStart({
        sceneId: id,
        text: prompt,
        characters: scene?.characters.map((r) => r.characterId) || [],
        servicesEndpoint,
        selectedCharacterId:
          scene?.characters[
            Math.floor(Math.random() * (scene?.characters.length || 0))
          ].characterId || '',
      })
    )
    trackEvent('scene-select')
  }
  return (
    <div
      className={`SceneSelector ${
        slidePanelOpened ? 'SceneSelector--expanded' : ''
      }`}
    >
      <button
        className="SceneSelector__trigger icon-button"
        disabled={inputDisabled}
        onClick={() => {
          dispatch(setModalOpened({ id: 'slidepanel', opened: true }))
          trackEvent('scene-sidebar-open')
        }}
      >
        <BiCameraMovie />
      </button>
      <SlidePanel
        opened={slidePanelOpened}
        onClose={() => {
          dispatch(setModalOpened({ id: 'scene', opened: false }))
          dispatch(setModalOpened({ id: 'slidepanel', opened: false }))
        }}
      >
        <div className="SceneSelector__list-container">
          <h2>{createSceneOpened ? 'Create Scene' : 'Change Scene'}</h2>
          {createSceneOpened ? (
            <CreateScene />
          ) : (
            <div className="SceneSelector__list">
              {scenes.map((scene, index) => {
                return (
                  <button
                    className="SceneSelector__item"
                    key={`scene-selector-${scene.id}-${index}`}
                    onClick={handleItemClick.bind(null, scene.id, scene.prompt)}
                  >
                    <div
                      className="SceneSelector__item-background"
                      style={{
                        backgroundImage: `url(${assetLinkLoader(
                          backgrounds.find((b) => b.id === scene.backgroundId)
                            ?.source.jpg || '',
                          true
                        )})`,
                      }}
                    />
                    {scene.emotion ? (
                      <EmotionRenderer
                        className="SceneSelector__item-emotion"
                        assetLinkLoader={assetLinkLoader}
                        assetUrl={scene.emotion}
                      />
                    ) : null}
                    <div className="SceneSelector__item-text">{scene.name}</div>
                  </button>
                )
              })}
              <button
                className="SceneSelector__item"
                onClick={() => {
                  if (isInteractionDisabled) {
                    toast.warn('Please log in to interact.', {
                      position: 'top-center',
                      style: {
                        top: 10,
                      },
                    })
                    return
                  }
                  dispatch(
                    setModalOpened({
                      id: 'scene',
                      opened: true,
                    })
                  )
                  trackEvent('scene-create')
                }}
              >
                <div
                  className="SceneSelector__item-background"
                  style={{ backgroundColor: 'gray' }}
                />
                <div className="SceneSelector__item-text">Create new scene</div>
              </button>
              {!isMobileApp && (
                <button
                  className="SceneSelector__item"
                  onClick={() => {
                    if (isInteractionDisabled) {
                      toast.warn('Please log in to interact.', {
                        position: 'top-center',
                        style: {
                          top: 10,
                        },
                      })
                      return
                    }
                    dispatch(
                      setModalOpened({
                        id: 'scene-suggestions',
                        opened: true,
                      })
                    )
                    trackEvent('scene-generate')
                  }}
                >
                  <div className="SceneSelector__item-background SceneSelector__item-background--aero">
                    <StarsEffect />
                  </div>
                  <div className="SceneSelector__item-text">
                    Generate Scene <BsStars />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </SlidePanel>
    </div>
  )
}

const StarsEffect = () => {
  const stars = Array.from({ length: 50 }, (_, i) => i)
  return (
    <div className="StarsEffect">
      {stars.map((_, i) => (
        <div className="StarsEffect__star" key={`star-${i}`} />
      ))}
    </div>
  )
}
