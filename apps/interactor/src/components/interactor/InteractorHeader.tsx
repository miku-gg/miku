import { useAppContext } from '../../App.context'
import { useAppSelector } from '../../state/store'
import SceneSelector from '../scenarios/SceneSelector'
import History from '../history/History'
import MusicPlayer from './MusicPlayer'
import ScreenSizer from './ScreenSizer'
import './InteractorHeader.scss'
import Settings from './Settings'
import ModelSelector from './ModelSelector'
import InteractiveMap from '../scenarios/InteractiveMap'
import { SceneChangeModal } from '../scenarios/SceneChangeModal'
import { InventoryTrigger } from './Inventory'
import AnimatedText from '../common/AnimatedText'
import { CustomEventType, postMessage } from '../../libs/stateEvents'

const InteractorHeader = () => {
  const { assetLinkLoader } = useAppContext()
  const title = useAppSelector((state) => state.novel.title)
  const firstCharacter = useAppSelector(
    (state) => Object.values(state.novel.characters)[0]
  )
  const isMobileWidth = document.body.clientWidth < 600

  if (!firstCharacter) {
    return null
  }

  return (
    <div className="InteractorHeader">
      <div className="InteractorHeader__left">
        <div
          className="InteractorHeader__profile_pic"
          style={{
            backgroundImage: firstCharacter.profile_pic
              ? `url(${assetLinkLoader(firstCharacter.profile_pic, true)})`
              : '',
          }}
          onClick={() => postMessage(CustomEventType.NOVEL_PROFILE_CLICK, true)}
        />
        {!isMobileWidth && (
          <div className="InteractorHeader__header-name">
            {<AnimatedText text={title} minLength={20} />}
          </div>
        )}
        <SceneSelector />
        <InteractiveMap />
        <SceneChangeModal />
        <InventoryTrigger />
      </div>
      <div className="InteractorHeader__right">
        <ModelSelector />
        <MusicPlayer />
        <History />
        <ScreenSizer />
        <Settings />
      </div>
    </div>
  )
}

export default InteractorHeader
