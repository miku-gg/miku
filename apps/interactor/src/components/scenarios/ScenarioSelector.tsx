import { useState } from 'react'
import EmotionRenderer from '../emotion-render/EmotionRenderer'
import { AiFillPicture } from 'react-icons/ai'
import './ScenarioSelector.scss'
import { useAppDispatch, useAppSelector } from '../../state/store'
import {
  selectAvailableScenes,
  selectCurrentScene,
} from '../../state/selectors'
import { useAppContext } from '../../App'
import { interactionStart } from '../../state/narrationSlice'

export default function ScenarioSelector(): JSX.Element | null {
  const dispatch = useAppDispatch()
  const scenes = useAppSelector(selectAvailableScenes)
  const currentScene = useAppSelector(selectCurrentScene)
  const { assetLinkLoader } = useAppContext()
  const [expanded, setExpended] = useState<boolean>(false)

  const handleItemClick = (scenarioId: string) => {
    setExpended(false)
    console.log('handleItemClick', scenarioId)
  }

  // if (!scenes?.length) return null

  return (
    <div
      className={`ScenarioSelector ${
        expanded ? 'ScenarioSelector--expanded' : ''
      }`}
      onClick={setExpended.bind(null, !expanded)}
    >
      <button
        className="ScenarioSelector__trigger"
        onClick={() =>
          dispatch(
            interactionStart({
              sceneId: currentScene?.id || '',
              text: '*Change of scene*',
            })
          )
        }
      >
        <AiFillPicture />
      </button>
      <div
        className="ScenarioSelector__list-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ScenarioSelector__list">
          {scenes.map((scene, index) => {
            return (
              <button
                className="ScenarioSelector__item"
                key={`scenario-selector-${scene.id}-${index}`}
                onClick={handleItemClick.bind(null, scene.id)}
              >
                <div
                  className="ScenarioSelector__item-background"
                  style={{
                    backgroundImage: `url(${assetLinkLoader(
                      scene.background,
                      true
                    )})`,
                  }}
                />
                {scene.emotion ? (
                  <EmotionRenderer
                    className="ScenarioSelector__item-emotion"
                    assetLinkLoader={assetLinkLoader}
                    assetUrl={scene.emotion}
                  />
                ) : null}
                <div className="ScenarioSelector__item-text">{scene.name}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
