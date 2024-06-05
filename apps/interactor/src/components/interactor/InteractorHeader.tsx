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

const InteractorHeader = () => {
  const { assetLinkLoader } = useAppContext()
  const title = useAppSelector((state) => state.novel.title)
  const firstCharacter = useAppSelector(
    (state) => Object.values(state.novel.characters)[0]
  )

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
        />
        <div className="InteractorHeader__header-name">{title}</div>
        <SceneSelector />
        <History />
        <InteractiveMap />
      </div>
      <div className="InteractorHeader__right">
        <ModelSelector />
        <MusicPlayer />
        <ScreenSizer />
        <Settings />
      </div>
    </div>
  )
}

export default InteractorHeader
