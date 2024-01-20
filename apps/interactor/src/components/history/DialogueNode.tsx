/* eslint-disable react-refresh/only-export-components */
import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import classNames from 'classnames'
import { DialogueNodeData } from './utils'
import { FaPencil } from 'react-icons/fa6'
import { useAppDispatch, useAppSelector } from '../../state/store'
import {
  setDeleteNodeConfirmationModal,
  setEditModal,
} from '../../state/slices/settingsSlice'
import { useFillTextTemplate } from '../../libs/hooks'
import { useAppContext } from '../../App.context'
import { FaTrash } from 'react-icons/fa'

export default memo(({ data }: { data: DialogueNodeData }) => {
  const dispatch = useAppDispatch()
  const narration = useAppSelector((state) => state.narration)
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()

    dispatch(
      setDeleteNodeConfirmationModal({
        opened: true,
        id: data.id,
      })
    )
  }

  const canDelete = () => {
    let hasSwipes = false
    const response = narration.responses[data.id]
    if (response) {
      const parentInteractionID = response.parentInteractionId
      if (parentInteractionID) {
        const parentInteraction = narration.interactions[parentInteractionID]
        if (parentInteraction) {
          hasSwipes = parentInteraction.responsesId.length > 1
        }
      }
    }

    return !data.isRoot && (hasSwipes || data.isUser)
  }

  const { assetLinkLoader } = useAppContext()
  const handleEdit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(
      setEditModal({
        opened: true,
        id: data.id,
      })
    )
  }
  const displayText = useFillTextTemplate(data.text)

  return (
    <div
      className={classNames({
        DialogueNode: true,
        'DialogueNode--highlighted': data.highlighted,
        'DialogueNode--last-response': data.isLastResponse,
        'DialogueNode--response': !data.isUser,
      })}
    >
      {/* eslint-disable-next-line */}
      {/* @ts-ignore */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555', display: data.isRoot ? 'none' : '' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={false}
      />
      <div className="DialogueNode__avatars">
        {data.avatars.map((avatar, index) => (
          <img
            className="DialogueNode__avatar"
            src={assetLinkLoader(avatar)}
            key={`avatar-${data.id}-${avatar}`}
            style={{ marginLeft: (data.avatars.length - index - 1) * 10 }}
          />
        ))}
      </div>
      <button className="DialogueNode__edit-btn" onClick={handleEdit}>
        <FaPencil />
      </button>
      {canDelete() && (
        <button className="DialogueNode__delete-btn" onClick={handleDelete}>
          <FaTrash />
        </button>
      )}
      <div className="DialogueNode__text scrollbar">{displayText}</div>
      {/* eslint-disable-next-line */}
      {/* @ts-ignore */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{
          bottom: -5,
          top: 'auto',
          background: '#555',
          display: data.isLeaf ? 'none' : '',
        }}
        isConnectable={false}
      />
    </div>
  )
})
