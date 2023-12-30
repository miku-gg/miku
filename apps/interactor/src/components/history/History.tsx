import { Modal, Tooltip } from '@mikugg/ui-kit'
import { GrHistory } from 'react-icons/gr'
import { BiCloudUpload, BiCloudDownload } from 'react-icons/bi'
import { FaTimes } from 'react-icons/fa'
import { ReactElement } from 'react'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { setEditModal, setHistoryModal } from '../../state/slices/settingsSlice'
import ReactFlow, { Position, Node, Edge } from 'reactflow'
import DialogueNode from './DialogueNode'
import { NodeEditor } from './NodeEditor'
import {
  NarrationResponse,
  swipeResponse,
} from '../../state/slices/narrationSlice'
import { DialogueNodeData, setAllNodesPosition } from './utils'
import { replaceState } from '../../state/slices/replaceState'
import { useAppContext } from '../../App.context'
import { toast } from 'react-toastify'

import './History.scss'
import 'reactflow/dist/style.css'

const HistoryActions = () => {
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state)
  const { isProduction } = useAppContext()

  const handleSave = () => {
    const clonedState = JSON.parse(JSON.stringify(state))
    clonedState.settings.modals.history = false
    const json = JSON.stringify(clonedState)
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.href = url
    a.download = `${clonedState.novel.title}_history_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const stateJsonString = reader.result as string
        dispatch(replaceState(JSON.parse(stateJsonString)))
      } catch (e) {
        toast.error('Error reading history file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="History__actions">
      {!isProduction ? (
        <>
          <Tooltip id="history-actions-tooltip" place="bottom" />
          <label
            className="icon-button"
            data-tooltip-id="history-actions-tooltip"
            data-tooltip-content="Load narration history"
          >
            <input
              id="load-history-input"
              className="hidden"
              type="file"
              accept="application/json"
              onChange={handleLoad}
            />
            <BiCloudUpload />
          </label>
          <button
            className="icon-button"
            data-tooltip-id="history-actions-tooltip"
            data-tooltip-content="Download narration history"
            onClick={handleSave}
          >
            <BiCloudDownload />
          </button>
        </>
      ) : null}
      <button
        className="icon-button"
        onClick={() => dispatch(setHistoryModal(false))}
      >
        <FaTimes />
      </button>
    </div>
  )
}
const nodeTypes = {
  dialogueNode: DialogueNode,
}
const HistoryModal = (): ReactElement => {
  const dispatch = useAppDispatch()
  const narration = useAppSelector((state) => state.narration)
  const novel = useAppSelector((state) => state.novel)

  const [nodes, edges, startPos] = (() => {
    const parentIds = (() => {
      const parentIds: string[] = []
      let currentId = narration.currentResponseId
      while (currentId) {
        parentIds.push(currentId)
        currentId =
          narration.responses[currentId]?.parentInteractionId ||
          narration.interactions[currentId]?.parentResponseId ||
          ''
      }
      return parentIds
    })()
    const topResponse = narration.responses[parentIds[parentIds.length - 1]]
    const parentIdsSet = new Set(parentIds)

    const nodes: Node<DialogueNodeData>[] = []
    const edges: Edge[] = []

    function dfs(response: NarrationResponse) {
      // get parent scene
      const parentSceneId = response.parentInteractionId
        ? narration.interactions[response.parentInteractionId]?.sceneId
        : novel.startSceneId

      const parentScene = novel.scenes.find(
        (scene) => scene.id === parentSceneId
      )

      const avatars = response.characters.map(({ role }) => {
        const id =
          parentScene?.roles.find(({ role: _role }) => _role === role)
            ?.characterId || ''
        return novel.characters[id]?.profile_pic || ''
      })

      const isLastResponse = parentIds[0] === response.id
      const isRoot = response.id === topResponse?.id
      nodes.push({
        id: response.id,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        data: {
          avatars,
          id: response.id,
          isUser: false,
          isLastResponse,
          isRoot,
          isLeaf: response.childrenInteractions.length === 0,
          highlighted: parentIdsSet.has(response.id),
          text: (response.characters[0]?.text || '').substring(0, 100),
        },
        type: 'dialogueNode',
        position: { x: 0, y: 0 },
        draggable: false,
      })

      response.childrenInteractions.forEach(({ interactionId }) => {
        const interaction = narration.interactions[interactionId]
        nodes.push({
          id: interaction?.id || '',
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          type: 'dialogueNode',
          draggable: false,
          data: {
            id: interaction?.id || '',
            isUser: true,
            isLastResponse: false,
            highlighted: parentIdsSet.has(interaction?.id || ''),
            text: interaction?.query.substring(0, 100) || '',
            isLeaf: interaction?.responsesId.length === 0,
            isRoot: false,
            avatars: ['default-profile-pic.png'],
          },
          position: { x: 0, y: 0 },
        })
        edges.push({
          id: `vertical_${response.id}_${interaction?.id}`,
          source: response.id,
          type: 'default',
          target: interactionId,
          focusable: false,
          selected: false,
          animated:
            parentIdsSet.has(interactionId) &&
            (!response.parentInteractionId || parentIdsSet.has(response.id)),
        })
        interaction?.responsesId.forEach((responseId) => {
          const childResponse = narration.responses[responseId]
          if (!childResponse) return
          edges.push({
            id: `vertical_${interaction?.id}_${childResponse.id}`,
            source: interaction?.id,
            type: 'default',
            target: childResponse.id,
            focusable: false,
            selected: false,
            animated:
              parentIdsSet.has(interaction?.id) &&
              parentIdsSet.has(childResponse.id),
          })
          dfs(childResponse)
        })
      })
    }

    // eslint-disable-next-line
    // @ts-ignore
    dfs(topResponse)

    return [
      nodes,
      edges,
      setAllNodesPosition(nodes, edges, topResponse?.id || ''),
    ]
  })()

  return (
    <div className="History__modal">
      {/* eslint-disable-next-line */}
      {/* @ts-ignore */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={{
          zoom: 1.5,
          x:
            -startPos.x * 1.5 +
            (document.body.clientWidth * 0.8) / 2 -
            200 / 1.5,
          y: -startPos.y * 1.5 + document.body.clientHeight * 0.8 - 80,
        }}
        attributionPosition="bottom-left"
        draggable={false}
        /* eslint-disable-next-line */
        /* @ts-ignore */
        nodeTypes={nodeTypes}
        onNodeClick={(_event, node) => {
          if (narration.responses[node.id]) {
            dispatch(swipeResponse(node.id))
          }
        }}
      />
    </div>
  )
}

const History = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const historyOpened = useAppSelector((state) => state.settings.modals.history)
  const { opened: editOpened, id: editId } = useAppSelector(
    (state) => state.settings.modals.edit
  )
  return (
    <div className="History">
      <button
        className="History__trigger icon-button"
        onClick={() => dispatch(setHistoryModal(true))}
      >
        <GrHistory />
      </button>
      <Modal
        opened={historyOpened}
        title="History"
        onCloseModal={() => dispatch(setHistoryModal(false))}
        shouldCloseOnOverlayClick
        overlayClassName="History__modal-overlay"
        className="History__modal-container"
      >
        <HistoryModal />
        <HistoryActions />
      </Modal>
      <Modal
        opened={editOpened}
        title="Edit"
        className="History__edit-modal"
        shouldCloseOnOverlayClick
        onCloseModal={() => dispatch(setEditModal({ opened: false, id: '' }))}
      >
        <NodeEditor
          id={editId}
          onClose={() =>
            dispatch(
              setEditModal({
                opened: false,
                id: '',
              })
            )
          }
        />
      </Modal>
    </div>
  )
}

export default History
