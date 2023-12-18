import { useEffect, useRef } from 'react'
import {
  selectCurrentSwipeResponses,
  selectLastLoadedCharacters,
  selectLastLoadedResponse,
} from '../../state/selectors'
import { FaDice } from 'react-icons/fa'
import { IoIosBookmarks } from 'react-icons/io'

import { useAppDispatch, useAppSelector } from '../../state/store'
import TextFormatter from '../common/TextFormatter'
import { regenerationStart, swipeResponse } from '../../state/narrationSlice'
import './ResponseBox.scss'

const ResponseBox = (): JSX.Element | null => {
  const dispatch = useAppDispatch()
  const responseDiv = useRef<HTMLDivElement>(null)
  const lastReponse = useAppSelector(selectLastLoadedResponse)
  const lastCharacters = useAppSelector(selectLastLoadedCharacters)
  const swipes = useAppSelector(selectCurrentSwipeResponses)
  const { disabled } = useAppSelector((state) => state.narration.input)

  const onRegenerateClick = () => {
    dispatch(regenerationStart())
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
      {!disabled && lastReponse?.parentInteractionId ? (
        <button className="ResponseBox__regenerate" onClick={onRegenerateClick}>
          <FaDice />
          Regenerate
        </button>
      ) : null}
      {(swipes?.length || 0) > 1 ? (
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
