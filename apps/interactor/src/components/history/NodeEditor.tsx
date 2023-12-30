import { useState, useEffect } from 'react'
import classNames from 'classnames'
import {
  selectRoleOfResponse,
  updateInteraction,
  updateResponse,
} from '../../state/slices/narrationSlice'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { NarrationInteraction, NarrationResponse } from '../../state/versioning'
import { Button, Dropdown } from '@mikugg/ui-kit'
import { selectSceneFromResponse } from '../../state/selectors'
import { useAppContext } from '../../App.context'
import './NodeEditor.scss'

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
  const { assetLinkLoader } = useAppContext()
  const role = response.selectedRole || ''
  const charResponse = response.characters.find(
    (_charResponse) => _charResponse.role === role
  )
  const scene = useAppSelector((state) =>
    selectSceneFromResponse(state, response)
  )
  const characters = useAppSelector((state) => state.novel.characters)
  const character =
    characters[
      scene?.roles.find((_role) => _role.role === role)?.characterId || ''
    ]
  const emotions =
    character?.outfits[character?.roles[role] || '']?.emotions || []
  const [_emotion, _setEmotion] = useState(charResponse?.emotion || '')

  if (!charResponse || !character) return null

  const handleChange = (text: string) => {
    dispatch(
      updateResponse({
        id: response.id,
        role,
        emotion: _emotion,
        text,
      })
    )
    onClose()
  }

  return (
    <div>
      {scene?.roles.length ? (
        <div className="NodeEditor__characters">
          {response.characters.map((_charResponse) => {
            const id = scene.roles.find(
              (r) => r.role === _charResponse.role
            )?.characterId
            return (
              <button
                className={classNames({
                  NodeEditor__character: true,
                  'NodeEditor__character--selected':
                    _charResponse.role === role,
                })}
                onClick={() =>
                  dispatch(
                    selectRoleOfResponse({
                      responseId: response.id,
                      roleId: _charResponse.role,
                    })
                  )
                }
              >
                <img
                  className="NodeEditor__character-img"
                  src={assetLinkLoader(characters[id || '']?.profile_pic || '')}
                  alt={character.name}
                />
              </button>
            )
          })}
        </div>
      ) : null}
      <TextEditor
        text={charResponse.text}
        onChange={handleChange}
        onCancel={onClose}
      />
      <Dropdown
        items={emotions.map((emotion) => ({
          name: emotion.id,
          value: emotion.id,
        }))}
        selectedIndex={emotions.findIndex((emotion) => emotion.id === _emotion)}
        onChange={(index) => _setEmotion(emotions[index].id)}
      />
    </div>
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
