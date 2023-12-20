import { useAppContext } from '../../App'
import { useAppSelector } from '../../state/store'
import { GiBrain } from 'react-icons/gi'
import { SlSettings } from 'react-icons/sl'
import SceneSelector from '../scenarios/SceneSelector'
import History from '../history/History'
import MusicPlayer from './MusicPlayer'
import ScreenSizer from './ScreenSizer'
import './InteractorHeader.scss'

const InteractorHeader = () => {
  const { assetLinkLoader } = useAppContext()
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
        <div className="InteractorHeader__header-name">
          {firstCharacter.name}
        </div>
        <div className="InteractorHeader__scenario-selector">
          <SceneSelector />
        </div>
        <div className="InteractorHeader__history">
          <History />
        </div>
      </div>
      <div className="InteractorHeader__right">
        <button className="InteractorHeader__brain icon-button">
          <GiBrain />
        </button>
        <MusicPlayer />
        <ScreenSizer />
        <button className="InteractorHeader__settings icon-button">
          <SlSettings />
        </button>
      </div>
    </div>
  )
}

export default InteractorHeader
