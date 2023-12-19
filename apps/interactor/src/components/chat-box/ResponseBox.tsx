import { useEffect, useRef } from 'react'
import {
  selectCurrentSwipeResponses,
  selectLastLoadedCharacters,
  selectLastLoadedResponse,
} from '../../state/selectors'
import { FaDice } from 'react-icons/fa'
import { FaPencil } from 'react-icons/fa6'
import { MdRecordVoiceOver } from 'react-icons/md'
import { IoIosBookmarks } from 'react-icons/io'

import { useAppDispatch, useAppSelector } from '../../state/store'
import TextFormatter from '../common/TextFormatter'
import {
  regenerationStart,
  swipeResponse,
} from '../../state/slices/narrationSlice'
import './ResponseBox.scss'
import { setEditModal } from '../../state/slices/settingsSlice'

const ResponseBox = (): JSX.Element | null => {
  const dispatch = useAppDispatch()
  const responseDiv = useRef<HTMLDivElement>(null)
  const lastReponse = useAppSelector(selectLastLoadedResponse)
  const lastCharacters = useAppSelector(selectLastLoadedCharacters)
  const swipes = useAppSelector(selectCurrentSwipeResponses)
  const { disabled } = useAppSelector((state) => state.narration.input)

  const handleRegenerateClick = () => {
    dispatch(regenerationStart())
  }

  const handleEditClick = () => {
    if (lastReponse) {
      dispatch(
        setEditModal({
          opened: true,
          id: lastReponse?.id,
        })
      )
    }
  }

  useEffect(() => {
    if (responseDiv.current) {
      responseDiv.current.scrollTop = responseDiv.current.scrollHeight
    }
  }, [lastCharacters])

  if (!lastCharacters.length) {
    return null
  }

  return (
    <div className="ResponseBox">
      <div className="ResponseBox__text" ref={responseDiv}>
        <TextFormatter text={lastCharacters[0].text} />
      </div>
      <div className="ResponseBox__actions">
        {!disabled ? (
          <button className="ResponseBox__voice" onClick={handleEditClick}>
            <MdRecordVoiceOver />
            <span>Listen</span>
          </button>
        ) : null}
        {!disabled &&
        lastReponse?.parentInteractionId &&
        (swipes?.length || 0) < 8 ? (
          <button
            className="ResponseBox__regenerate"
            onClick={handleRegenerateClick}
          >
            <FaDice />
            <span>Regenerate</span>
          </button>
        ) : null}
        {!disabled ? (
          <button className="ResponseBox__edit" onClick={handleEditClick}>
            <FaPencil />
            <span>Edit</span>
          </button>
        ) : null}
      </div>
      {!disabled && (swipes?.length || 0) > 1 ? (
        <div className="ResponseBox__swipes">
          {swipes?.map((swipe) => {
            if (!swipe?.id) return null
            return (
              <button
                className={`ResponseBox__swipe ${
                  lastReponse?.id === swipe.id ? 'selected' : ''
                }`}
                key={`swipe-${swipe.id}`}
                onClick={() => dispatch(swipeResponse(swipe.id))}
                disabled={disabled}
              >
                <IoIosBookmarks />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default ResponseBox
