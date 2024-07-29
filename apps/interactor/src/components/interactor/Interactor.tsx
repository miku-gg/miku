import { AreYouSure } from '@mikugg/ui-kit'
import classNames from 'classnames'
import ProgressiveImage from 'react-progressive-graceful-image'
import { useAppContext } from '../../App.context'
import {
  selectCurrentScene,
  selectLastLoadedCharacters,
  selectLastSelectedCharacter,
} from '../../state/selectors'
import { useAppSelector } from '../../state/store'
import ChatBox from '../chat-box/ChatBox'
import EmotionRenderer from '../emotion-render/EmotionRenderer'
import DebugModal from './DebugModal'
import './Interactor.scss'
import InteractorHeader from './InteractorHeader'
import Inventory from './Inventory'
import SceneSuggestion from './SceneSuggestion'

const Interactor = () => {
  const { assetLinkLoader, isMobileApp } = useAppContext()
  const scene = useAppSelector(selectCurrentScene)
  const lastCharacters = useAppSelector(selectLastLoadedCharacters)
  const displayCharacter = useAppSelector(selectLastSelectedCharacter)
  const backgrounds = useAppSelector((state) => state.novel.backgrounds)

  if (!scene) {
    return null
  }

  const background = backgrounds.find((b) => b.id === scene.backgroundId)
  return (
    <AreYouSure.AreYouSureProvider>
      <div className="Interactor">
        <div className="Interactor__content">
          <InteractorHeader />
          <SceneSuggestion />
          <div className="Interactor__main-image-container">
            <ProgressiveImage
              src={
                background
                  ? assetLinkLoader(
                      isMobileApp && background.source.mp4Mobile
                        ? background.source.mp4Mobile
                        : background.source.mp4 || background.source.jpg
                    )
                  : ''
              }
              placeholder={
                background ? assetLinkLoader(background.source.jpg, true) : ''
              }
            >
              {(src) =>
                isMobileApp && background?.source.mp4Mobile ? (
                  <video className="Interactor__background-mobileVideo" loop autoPlay>
                    <source
                      src={assetLinkLoader(background.source.mp4Mobile)}
                    ></source>
                  </video>
                ) :
                background?.source.mp4 ? (
                  <video className="Interactor__background-video" loop autoPlay>
                    <source
                      src={assetLinkLoader(background.source.mp4)}
                    ></source>
                  </video>
                ) : (
                  <img
                    className="Interactor__background-image"
                    src={`${src}`}
                    alt="background"
                    onError={({ currentTarget }) => {
                      if (
                        currentTarget.src !== '/images/default_background.png'
                      ) {
                        currentTarget.onerror = null
                        currentTarget.src = '/images/default_background.png'
                      }
                    }}
                  />
                )
              }
            </ProgressiveImage>
            <div
              className={classNames({
                Interactor__characters: true,
                'Interactor__characters--multiple': lastCharacters.length > 1,
              })}
            >
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
                    className={classNames({
                      'Interactor__emotion-renderer': true,
                      selected: displayCharacter?.id === id,
                    })}
                  />
                )
              })}
            </div>
          </div>
          <ChatBox />
          <Inventory />
          <DebugModal />
        </div>
      </div>
    </AreYouSure.AreYouSureProvider>
  )
}

export default Interactor
