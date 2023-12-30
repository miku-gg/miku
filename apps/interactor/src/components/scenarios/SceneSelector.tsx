import { useState } from 'react'
import EmotionRenderer from '../emotion-render/EmotionRenderer'
import { BiCameraMovie } from 'react-icons/bi'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { selectAvailableScenes } from '../../state/selectors'
import { useAppContext } from '../../App.context'
import { interactionStart } from '../../state/slices/narrationSlice'
import './SceneSelector.scss'

export default function SceneSelector(): JSX.Element | null {
  const dispatch = useAppDispatch()
  const scenes = useAppSelector(selectAvailableScenes)
  const { assetLinkLoader, servicesEndpoint } = useAppContext()
  const [expanded, setExpended] = useState<boolean>(false)

  const handleItemClick = (id: string, prompt: string) => {
    const scene = scenes.find((s) => s.id === id)
    setExpended(false)
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

  if (!scenes?.length) return null

  return (
    <div
      className={`SceneSelector ${expanded ? 'SceneSelector--expanded' : ''}`}
      onClick={setExpended.bind(null, !expanded)}
    >
      <button className="SceneSelector__trigger icon-button">
        <BiCameraMovie />
      </button>
      <div
        className="SceneSelector__list-container"
        onClick={(e) => e.stopPropagation()}
      >
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
        </div>
      </div>
    </div>
  )
}
