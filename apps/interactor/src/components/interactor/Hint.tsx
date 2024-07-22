import { GiLightBulb } from 'react-icons/gi'
import './Hint.scss'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../state/store'
import {
  selectCurrentScene,
  selectCurrentSceneInteractionCount,
  selectCurrentSceneObjectives,
} from '../../state/selectors'
import { markHintSeen } from '../../state/slices/narrationSlice'

export default function Hint() {
  const [hidden, setHidden] = useState(false)
  const seenHints = useAppSelector((state) => state.narration.seenHints) || []
  const dispatch = useAppDispatch()
  const scene = useAppSelector(selectCurrentScene)
  const count = useAppSelector(selectCurrentSceneInteractionCount)
  const disabled = useAppSelector((state) => state.narration.input.disabled)
  const objectives =
    useAppSelector(selectCurrentSceneObjectives).filter(
      (o) => !seenHints?.includes(o.id) && o.hint
    ) || []
  let hintToShow = [
    ...objectives,
    seenHints.includes(scene?.id || '') ? null : scene,
  ][0]

  if (count < 2 || disabled) {
    hintToShow = undefined
  }

  if (!hintToShow?.hint) {
    return null
  }

  return (
    <div
      className={`Hint ${hidden ? 'Hint--hidden' : ''}`}
      onClick={() => {
        setHidden(true)
        setTimeout(() => {
          if (hintToShow?.id) {
            dispatch(markHintSeen(hintToShow.id))
            setHidden(false)
          }
        }, 500)
      }}
    >
      <div className="Hint__content">
        <div className="Hint__icon">
          <GiLightBulb />
        </div>
        <div className="Hint__text">
          <span className="Hint__text-span">
            <span className="Hint__text-label">Hint:</span>
            <span>{hintToShow.hint}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
