import { useAppContext } from '../../App'
import { useAppSelector } from '../../state/store'
import { FaInfoCircle } from 'react-icons/fa'
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
        <div className="inline-flex">
          <button className="rounded-full">
            <FaInfoCircle />
          </button>
        </div>
        <div className="inline-flex">scneario selector</div>
      </div>
      <div className="InteractorHeader__right"></div>
    </div>
  )
}

export default InteractorHeader
