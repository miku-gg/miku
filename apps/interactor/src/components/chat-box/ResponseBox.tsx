import { useEffect, useRef } from 'react'
import {
  selectCurrentScene,
  selectCurrentSwipeResponses,
  selectLastLoadedCharacters,
  selectLastLoadedResponse,
  selectLastSelectedCharacter,
} from '../../state/selectors'
import { FaDice, FaForward } from 'react-icons/fa'
import { FaPencil } from 'react-icons/fa6'
import { IoIosBookmarks } from 'react-icons/io'

import { useAppDispatch, useAppSelector } from '../../state/store'
import TextFormatter, { TextFormatterStatic } from '../common/TextFormatter'
import TTSPlayer from './TTSPlayer'
import {
  continueResponse,
  regenerationStart,
  roleResponseStart,
  selectRoleOfResponse,
  swipeResponse,
} from '../../state/slices/narrationSlice'
import './ResponseBox.scss'
import { setEditModal } from '../../state/slices/settingsSlice'
import { useFillTextTemplate } from '../../libs/hooks'
import { useAppContext } from '../../App.context'
import { trackEvent } from '../../libs/analytics'
import classNames from 'classnames'

const ResponseBox = (): JSX.Element | null => {
  const dispatch = useAppDispatch()
  const { servicesEndpoint, isInteractionDisabled, assetLinkLoader } =
    useAppContext()
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
  const novelTitle = useAppSelector((state) => state.novel.title)
  const displayCharacter = useAppSelector(selectLastSelectedCharacter)
  const displayText = useFillTextTemplate(displayCharacter.text)

  const handleRegenerateClick = () => {
    trackEvent('bot_regenerate', {
      bot: novelTitle,
    })
    const roleIndex = Math.floor(Math.random() * (scene?.roles.length || 0))
    const { role, characterId } = scene?.roles[roleIndex] || {
      role: '',
      characterId: '',
    }
    const character = characters[characterId]
    const chracterOutfitId = character?.roles[role] || ''
    const outfit = character?.outfits[chracterOutfitId]
    const randomIndex = Math.floor(
      Math.random() * (outfit?.emotions?.length || 0)
    )
    const randomEmotion = outfit?.emotions[randomIndex].id || ''
    dispatch(
      regenerationStart({
        servicesEndpoint,
        emotion: randomEmotion,
        selectedRole: role,
      })
    )
  }

  const handleContinueClick = () => {
    trackEvent('bot_continue', {
      bot: novelTitle,
    })
    dispatch(
      continueResponse({
        servicesEndpoint,
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

  const isRoleGenerated = (role: string) =>
    !!lastReponse?.characters.find((r) => r.role === role)?.role

  return (
    <div className="ResponseBox">
      <div className="ResponseBox__text" ref={responseDiv}>
        {isLastResponseFetching ? (
          <TextFormatterStatic text="*Typing...*" />
        ) : (
          <TextFormatter
            text={displayText}
            children={
              !disabled &&
              displayCharacter.id ===
                lastCharacters[lastCharacters.length - 1].id ? (
                <button
                  className="ResponseBox__continue"
                  onClick={handleContinueClick}
                >
                  continue
                  <FaForward />
                </button>
              ) : null
            }
          />
        )}
      </div>
      {(scene?.roles.length || 0) > 1 ? (
        <div className="ResponseBox__characters">
          {[
            ...(lastReponse?.characters.map((c) => ({
              characterId:
                scene?.roles.find((r) => r.role === c.role)?.characterId || '',
              role: c.role,
            })) || []),
            ...(scene?.roles.filter(({ role }) => !isRoleGenerated(role)) ||
              []),
          ].map(({ characterId, role }) => {
            const character = characters[characterId]
            const isGenerated = isRoleGenerated(role)
            return (
              <div
                className={classNames({
                  ResponseBox__character: true,
                  generated: isGenerated,
                  selected: displayCharacter?.role === role,
                })}
                key={`response-character-${role}`}
              >
                <button
                  className="ResponseBox__character-button"
                  onClick={() =>
                    dispatch(
                      isGenerated
                        ? selectRoleOfResponse({
                            responseId: lastReponse?.id || '',
                            roleId: role,
                          })
                        : roleResponseStart({
                            servicesEndpoint,
                            role,
                          })
                    )
                  }
                  disabled={disabled}
                >
                  <img src={assetLinkLoader(character?.profile_pic || '')} />
                </button>
              </div>
            )
          })}
        </div>
      ) : null}
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
