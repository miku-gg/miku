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

export default function SceneSelector(): JSX.Element | null {
  const dispatch = useAppDispatch()
  const scenes = useAppSelector(selectAvailableScenes)
  const { assetLinkLoader, servicesEndpoint } = useAppContext()
  const slidePanelOpened = useAppSelector(
    (state) => state.creation.scene.slidePanelOpened
  )
  const createSceneOpened = useAppSelector(
    (state) => state.creation.scene.sceneOpened
  )

  const handleItemClick = (id: string, prompt: string) => {
    const scene = scenes.find((s) => s.id === id)
    dispatch(setModalOpened({ id: 'slidepanel', opened: false }))
    dispatch(
      interactionStart({
        sceneId: id,
        text: prompt,
        roles: scene?.roles.map((r) => r.role) || [],
        servicesEndpoint,
        selectedRole:
          scene?.roles[Math.floor(Math.random() * (scene?.roles.length || 0))]
            .role || '',
      })
    )
  }
  return (
    <div
      className={`SceneSelector ${
        slidePanelOpened ? 'SceneSelector--expanded' : ''
      }`}
    >
      <button
        className="SceneSelector__trigger icon-button"
        onClick={() =>
          dispatch(setModalOpened({ id: 'slidepanel', opened: true }))
        }
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
          <h2>{createSceneOpened ? 'Create Scene' : 'Scenes'}</h2>
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
                          scene.background,
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
                onClick={() =>
                  dispatch(
                    setModalOpened({
                      id: 'scene',
                      opened: true,
                    })
                  )
                }
              >
                <div
                  className="SceneSelector__item-background"
                  style={{ backgroundColor: 'gray' }}
                />
                <div className="SceneSelector__item-text">Create new scene</div>
              </button>
            </div>
          )}
        </div>
      </SlidePanel>
    </div>
  )
}
