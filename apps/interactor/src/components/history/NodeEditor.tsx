import { useState, useEffect } from 'react'
import {
  updateInteraction,
  updateResponse,
} from '../../state/slices/narrationSlice'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { NarrationInteraction, NarrationResponse } from '../../state/versioning'
import { Button } from '@mikugg/ui-kit'

const TextEditor = ({
  text,
  onChange,
  onCancel,
}: {
  text: string
  onChange: (text: string) => void
  onCancel: () => void
}) => {
  const [_text, _setText] = useState(text)

  useEffect(() => {
    _setText(text)
  }, [text])

  return (
    <form
      className="NodeEditor__text-editor"
      onSubmit={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onChange(_text)
      }}
    >
      <textarea
        className="NodeEditor__textarea scrollbar"
        value={_text}
        onChange={(e) => _setText(e.target.value)}
      />
      <div className="NodeEditor__actions">
        <Button theme="secondary" type="submit">
          Update
        </Button>
        <Button
          theme="transparent"
          onClick={() => {
            _setText(text)
            onCancel()
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

const ResponseEditor = ({
  response,
  onClose,
}: {
  response: NarrationResponse
  onClose: () => void
}) => {
  const dispatch = useAppDispatch()
  const charResponse = Object.values(response.characters)[0]
  const role = Object.keys(response.characters)[0]

  if (!charResponse || !role) return null

  const handleChange = (text: string) => {
    dispatch(
      updateResponse({
        id: response.id,
        role,
        emotion: charResponse.emotion,
        text,
      })
    )
    onClose()
  }

  return (
    <TextEditor
      text={charResponse.text}
      onChange={handleChange}
      onCancel={onClose}
    />
  )
}

const InteractionEditor = ({
  interaction,
  onClose,
}: {
  interaction: NarrationInteraction
  onClose: () => void
}) => {
  const dispatch = useAppDispatch()

  const handleChange = (text: string) => {
    dispatch(
      updateInteraction({
        id: interaction.id,
        text,
      })
    )
    onClose()
  }

  return (
    <TextEditor
      text={interaction.query}
      onChange={handleChange}
      onCancel={onClose}
    />
  )
}

export const NodeEditor = ({
  id,
  onClose,
}: {
  id: string
  onClose: () => void
}) => {
  const response = useAppSelector((state) => state.narration.responses[id])
  const interaction = useAppSelector(
    (state) => state.narration.interactions[id]
  )

  let content: JSX.Element | null = null

  if (response) {
    content = <ResponseEditor response={response} onClose={onClose} />
  } else if (interaction) {
    content = <InteractionEditor interaction={interaction} onClose={onClose} />
  }

  return <div className="NodeEditor">{content}</div>
}
