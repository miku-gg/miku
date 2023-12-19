/* eslint-disable react-refresh/only-export-components */
import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import classNames from 'classnames'
import { DialogueNodeData } from './utils'

export default memo(
  ({
    data,
    isConnectable,
  }: {
    isConnectable: boolean
    data: DialogueNodeData
  }) => {
    return (
      <div
        className={classNames({
          DialogueNode: true,
          'DialogueNode--highlighted': data.highlighted,
          'DialogueNode--last-response': data.isLastResponse,
          'DialogueNode--response': !data.isUser,
        })}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#555', display: data.isRoot ? 'none' : '' }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <div className="DialogueNode__avatars">
          {data.avatars.map((avatar) => (
            <img className="DialogueNode__avatar" src={avatar} />
          ))}
        </div>
        <div className="DialogueNode__text scrollbar">{data.text}</div>
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
          isConnectable={isConnectable}
        />
      </div>
    )
  }
)
