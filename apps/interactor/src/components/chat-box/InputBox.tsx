import {
  interactionStart,
  setInputText,
} from '../../state/slices/narrationSlice'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { FaPaperPlane } from 'react-icons/fa'
import { GiFeather } from 'react-icons/gi'
import {
  selectCurrentScene,
  selectLastLoadedResponse,
} from '../../state/selectors'
import { useAppContext } from '../../App.context'

import './InputBox.scss'
import { toast } from 'react-toastify'
import { trackEvent } from '../../libs/analytics'
import classNames from 'classnames'
import { Tooltip } from '@mikugg/ui-kit'

let lastInteractionTime = Date.now()
const InputBox = (): JSX.Element | null => {
  const dispatch = useAppDispatch()
  const { servicesEndpoint, isInteractionDisabled } = useAppContext()
  const { text, disabled } = useAppSelector((state) => state.narration.input)
  const novelTitle = useAppSelector((state) => state.novel.title)
  const scene = useAppSelector(selectCurrentScene)
  const lastResponse = useAppSelector(selectLastLoadedResponse)

  const onSubmit = (e: React.FormEvent<unknown>) => {
    e.stopPropagation()
    e.preventDefault()
    if (!text || disabled) return
    trackEvent('bot_interact', {
      bot: novelTitle,
      time: Date.now() - lastInteractionTime,
      prevented: isInteractionDisabled,
    })
    if (isInteractionDisabled) {
      toast.warn('Please log in to interact.', {
        position: 'top-center',
        style: {
          top: 10,
        },
      })
      return
    }
    lastInteractionTime = Date.now()
    dispatch(
      interactionStart({
        text,
        sceneId: scene?.id || '',
        roles: scene?.roles.map((r) => r.role) || [],
        servicesEndpoint,
        selectedRole: lastResponse?.selectedRole || '',
      })
    )
  }

  const onAutocomplete = () => {}

  return (
    <div className="InputBox">
      <form
        className={classNames({
          InputBox__form: true,
          'InputBox__form--disabled': disabled,
        })}
        onSubmit={onSubmit}
      >
        <textarea
          className="InputBox__input scrollbar"
          value={text}
          onChange={(e) => !disabled && dispatch(setInputText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              onSubmit(e)
            }
          }}
          autoComplete="off"
          rows={1}
          placeholder="Type a message..."
        />
        <button
          className="InputBox__suggestion-trigger"
          disabled={disabled}
          data-tooltip-id={`suggestion-tooltip`}
          data-tooltip-html="Autocomplete"
          data-tooltip-varaint="light"
          onClick={onAutocomplete}
        >
          <GiFeather />
        </button>
        <button className="InputBox__submit" disabled={disabled}>
          <FaPaperPlane />
        </button>
      </form>
      <Tooltip id="suggestion-tooltip" place="top" />
    </div>
  )
}

export default InputBox
