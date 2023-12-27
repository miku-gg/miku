import { useEffect, useRef } from 'react'
import {
  selectCurrentScene,
  selectCurrentSwipeResponses,
  selectLastLoadedCharacters,
  selectLastLoadedResponse,
} from '../../state/selectors'
import { FaDice, FaPlusCircle } from 'react-icons/fa'
import { FaPencil } from 'react-icons/fa6'
import { IoIosBookmarks } from 'react-icons/io'

import { useAppDispatch, useAppSelector } from '../../state/store'
import TextFormatter, { TextFormatterStatic } from '../common/TextFormatter'
import TTSPlayer from './TTSPlayer'
import {
  continueResponse,
  regenerationStart,
  swipeResponse,
} from '../../state/slices/narrationSlice'
import './ResponseBox.scss'
import { setEditModal } from '../../state/slices/settingsSlice'
import { useFillTextTemplate } from '../../libs/hooks'
import { useAppContext } from '../../App.context'
import { trackEvent } from '../../libs/analytics'

const ResponseBox = (): JSX.Element | null => {
  const dispatch = useAppDispatch()
  const { servicesEndpoint, isInteractionDisabled } = useAppContext()
  const responseDiv = useRef<HTMLDivElement>(null)
  const lastReponse = useAppSelector(selectLastLoadedResponse)
  const isLastResponseFetching = useAppSelector(
    (state) =>
      state.narration.responses[state.narration.currentResponseId]?.fetching ||
      false
  )
  const scene = useAppSelector(selectCurrentScene)
  const characters = useAppSelector((state) => state.novel.characters)
  const lastCharacters = useAppSelector(selectLastLoadedCharacters)
  const swipes = useAppSelector(selectCurrentSwipeResponses)
  const { disabled } = useAppSelector((state) => state.narration.input)
  const displayText = useFillTextTemplate(lastCharacters[0].text)
  const novelTitle = useAppSelector((state) => state.novel.title)

  const handleRegenerateClick = () => {
    trackEvent('bot_regenerate', {
      bot: novelTitle,
    })
    dispatch(
      regenerationStart({
        servicesEndpoint,
        roles: (scene?.roles || []).map((r) => {
          const character = characters[r.characterId]
          const chracterOutfitId = character?.roles[r.role] || ''
          const outfit = character?.outfits[chracterOutfitId]
          const randomIndex = Math.floor(
            Math.random() * (outfit?.emotions?.length || 0)
          )
          const randomEmotion = outfit?.emotions[randomIndex]
          if (randomEmotion) {
            return {
              role: r.role,
              emotion: randomEmotion.id || '',
            }
          }

          return {
            role: r.role,
            emotion: '',
          }
        }),
      })
    )
  }

  const handleContinueClick = () => {
    trackEvent('bot_continue', {
      bot: novelTitle,
    })
    dispatch(
      continueResponse({
        servicesEndpoint
      })
    )
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
        {isLastResponseFetching ? (
          <TextFormatterStatic text="*Typing...*" />
        ) : (
          <TextFormatter text={displayText} />
        )}
      </div>
      <div className="ResponseBox__actions">
        {!disabled ? <TTSPlayer /> : null}
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
        {!disabled &&
          lastReponse?.parentInteractionId ? (
          <button className="ResponseBox__continue" onClick={handleContinueClick}>
            <FaPlusCircle />
            <span>Continue</span>
          </button>
        ) : null}
        {!disabled && !isInteractionDisabled ? (
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
                className={`ResponseBox__swipe ${lastReponse?.id === swipe.id ? 'selected' : ''
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
