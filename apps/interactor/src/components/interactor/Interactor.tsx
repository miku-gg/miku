import ProgressiveImage from 'react-progressive-graceful-image'
import './Interactor.scss'
import { useAppSelector } from '../../state/store'
import {
  selectCurrentScene,
  selectLastLoadedCharacters,
} from '../../state/selectors'
import EmotionRenderer from '../emotion-render/EmotionRenderer'
import { useAppContext } from '../../App'
import InteractorHeader from './InteractorHeader'

const Interactor = () => {
  const { assetLinkLoader } = useAppContext()
  const scene = useAppSelector(selectCurrentScene)
  const lastCharacters = useAppSelector(selectLastLoadedCharacters)

  if (!scene) {
    return null
  }

  return (
    <div className="Interactor">
      <div className="Interactor__content">
        <InteractorHeader />
        <div className="Interactor__main-image-container">
          <ProgressiveImage
            src={scene.background ? assetLinkLoader(scene.background) : ''}
            placeholder={
              scene.background ? assetLinkLoader(scene.background, true) : ''
            }
          >
            {(src) => (
              <img
                className="Interactor__background-image"
                src={`${src}`}
                alt="background"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null
                  currentTarget.src = '/images/default_background.png'
                }}
              />
            )}
          </ProgressiveImage>
          {lastCharacters.map(({ id, image }) => {
            if (!image) {
              return null
            }
            return (
              <EmotionRenderer
                key={`character-emotion-render-${id}`}
                assetLinkLoader={assetLinkLoader}
                assetUrl={image}
                upDownAnimation
                className="Interactor__emotion-renderer"
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Interactor
