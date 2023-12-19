import { Modal } from '@mikugg/ui-kit'
import { GrHistory } from 'react-icons/gr'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { setHistoryModal } from '../../state/settingsSlice'
import './History.scss'
import { ReactElement } from 'react'
import ReactFlow, { Position, Node, Edge } from 'reactflow'
import DialogueNode from './DialogueNode'

import 'reactflow/dist/style.css'
import { NarrationResponse, swipeResponse } from '../../state/narrationSlice'
import { DialogueNodeData, setAllNodesPosition } from './utils'

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

      const avatars =
        parentScene?.roles.map(
          (role) =>
            'https://assets.miku.gg/' +
            (novel.characters[role.characterId]?.profile_pic || '')
        ) || ([] as string[])

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
          text: (Object.values(response.characters)[0]?.text || '').substring(
            0,
            100
          ),
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
            avatars: ['https://assets.miku.gg/default-profile-pic.png'],
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

  console.log('startPos', startPos)

  return (
    <div className="History__modal">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={{
          zoom: 2,
          x: -startPos.x * 2 + 110,
          y: -startPos.y * 2 + 500,
        }}
        attributionPosition="bottom-left"
        draggable={false}
        nodeTypes={nodeTypes}
        onNodeClick={(event, node) => {
          if (narration.responses[node.id]) {
            dispatch(swipeResponse(node.id))
          }
        }}
      ></ReactFlow>
    </div>
  )
}

const History = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const opened = useAppSelector((state) => state.settings.modals.history)
  return (
    <div className="History">
      <button
        className="History__trigger"
        onClick={() => dispatch(setHistoryModal(true))}
      >
        <GrHistory />
      </button>
      <Modal
        opened={opened}
        title="History"
        onCloseModal={() => dispatch(setHistoryModal(false))}
        shouldCloseOnOverlayClick={false}
      >
        <HistoryModal />
      </Modal>
    </div>
  )
}

export default History
