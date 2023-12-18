import { interactionStart, setInputText } from '../../state/narrationSlice'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { FaPaperPlane } from 'react-icons/fa'
import { selectCurrentScene } from '../../state/selectors'

import './InputBox.scss'

const InputBox = (): JSX.Element | null => {
  const dispatch = useAppDispatch()
  const { text, disabled } = useAppSelector((state) => state.narration.input)
  const scene = useAppSelector(selectCurrentScene)

  const onSubmit = (e: React.FormEvent<unknown>) => {
    e.stopPropagation()
    e.preventDefault()
    if (!text || disabled) return
    dispatch(
      interactionStart({
        text,
        sceneId: scene?.id || '',
      })
    )
  }

  return (
    <div className="InputBox">
      <form className="InputBox__form" onSubmit={onSubmit}>
        <textarea
          className="InputBox__input scrollbar"
          value={text}
          onChange={(e) => dispatch(setInputText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              onSubmit(e)
            }
          }}
          autoComplete="off"
          rows={1}
          placeholder="Type a message..."
        />
        <button className="InputBox__submit" disabled={disabled}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  )
}

export default InputBox
