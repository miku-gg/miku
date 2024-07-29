import { AreYouSure } from '@mikugg/ui-kit'
import ProgressiveImage from 'react-progressive-graceful-image'
import './Interactor.scss'
import { useAppSelector } from '../../state/store'
import {
  selectCurrentScene,
  selectLastLoadedCharacters,
  selectLastSelectedCharacter,
} from '../../state/selectors'
import EmotionRenderer from '../emotion-render/EmotionRenderer'
import { useAppContext } from '../../App.context'
import SceneSuggestion from './SceneSuggestion'
import InteractorHeader from './InteractorHeader'
import ChatBox from '../chat-box/ChatBox'
import classNames from 'classnames'
import Inventory from './Inventory'
import DebugModal from './DebugModal'
import ModelSelectorModal from './ModelSelectorModal'

const Interactor = () => {
  const { assetLinkLoader } = useAppContext()
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
                      background.source.webm || background.source.jpg
                    )
                  : ''
              }
              placeholder={
                background ? assetLinkLoader(background.source.jpg, true) : ''
              }
            >
              {(src) => (
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
              )}
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
          <ModelSelectorModal />
        </div>
      </div>
    </AreYouSure.AreYouSureProvider>
  )
}

export default Interactor
