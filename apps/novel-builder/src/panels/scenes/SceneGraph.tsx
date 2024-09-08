import React, { ComponentType, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Position,
  Node,
  Edge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  addEdge,
  NodeResizer,
  Handle,
  MarkerType,
  useStore,
  getStraightPath,
  Panel,
  OnConnect,
  NodeTypes,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@mikugg/ui-kit';
import { createSceneWithDefaults } from '../../state/slices/novelFormSlice';
import './SceneGraph.scss';
import { useAppSelector, useAppDispatch } from '../../state/store';
import { addChildScene, deleteChildScene } from '../../state/slices/novelFormSlice';
import { selectScenes } from '../../state/selectors';
import config from '../../config';
import { getEdgeParams, graphToTree, setAllNodesPosition } from './utils.js';
import { RiDragMove2Line, RiEdit2Line } from 'react-icons/ri';

function FloatingEdge({ id, source, target, markerEnd, style }: Edge) {
  const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const [edgePath] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  return (
    <path id={id} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd?.toString()} style={style} />
  );
}

const SceneNode = ({
  id,
  data,
}: Node<{
  title: string;
  background: string;
  characters: string[];
}>) => {
  const connectionNodeId = useStore((state) => state.connectionNodeId);
  const dispatch = useAppDispatch();
  const openSceneEditModal = () => {
    dispatch(openModal({ modalType: 'scene', editId: id }));
  };

  const isConnecting = !!connectionNodeId;

  return (
    <>
      <div className="SceneNode" style={{ backgroundImage: `url(${data.background})` }}>
        {!isConnecting && <Handle className="customHandleSource" position={Position.Right} type="source" />}
        <Handle className="customHandleTarget" position={Position.Left} type="target" isConnectableStart={false} />
        <div className="SceneNode__title">
          {data.title} <RiDragMove2Line />
        </div>
        <div className="SceneNode__edit-icon-container">
          <RiEdit2Line className="SceneNode__edit-icon" onClick={openSceneEditModal} />
        </div>
        <div className="SceneNode__characters">
          {data.characters.map((charImg, index) => (
            <img key={index} src={charImg} alt={`Character ${index}`} className="SceneNode__character" />
          ))}
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line
// @ts-ignore
const nodeTypes: NodeTypes = { sceneNode: SceneNode };
const edgeTypes = {
  floating: FloatingEdge,
};

const startPos = { x: 0, y: 0 };

const generateNodes = (scenes: ReturnType<typeof selectScenes>) => [
  ...scenes.map((scene, index) => {
    return {
      id: scene.id,
      type: 'sceneNode',
      position: { x: startPos.x + 200 * index, y: startPos.y },
      data: {
        title: scene.name,
        background: config.genAssetLink(scene.background?.source.jpg || '', AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL),
        characters: scene.characters.map((char) =>
          config.genAssetLink(char.profile_pic || '', AssetDisplayPrefix.PROFILE_PIC_SMALL),
        ),
      },
    };
  }),
];

const generateEdges = (scenes: ReturnType<typeof selectScenes>) =>
  scenes.flatMap((scene) =>
    scene.children.map((childId) => ({
      id: `e${scene.id}-${childId}`,
      source: scene.id,
      target: childId,
      type: 'floating',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: '#9747ff',
      },
      style: {
        strokeWidth: 2,
        stroke: '#9747ff',
      },
    })),
  );

export default function SceneGraph() {
  const scenes = useAppSelector(selectScenes);
  const startScenes = useAppSelector((state) => state.novel.starts.map((s) => s.sceneId));
  const nodesConfig = useMemo(() => generateNodes(scenes), [scenes]);
  const edgesConfig = useMemo(() => generateEdges(scenes), [scenes]);
  const [nodes, setNodes, onNodesChange] = useNodesState(nodesConfig);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesConfig);
  const dispatch = useAppDispatch();

  const handleAddScene = () => {
    dispatch(createSceneWithDefaults());
  };

  useEffect(() => {
    setNodes((nodes) => {
      const _nodes = nodesConfig.map((node, i) => {
        const existingNode = nodes.find((n) => n.id === node.id);
        if (existingNode) {
          return {
            ...node,
            position: existingNode.position,
          };
        }
        return node;
      });

      // get scenes with no children or parent
      const _topScenes = new Set<string>([]);
      scenes.forEach((scene) => {
        if (!scenes.some((s) => s.children.includes(scene.id))) {
          _topScenes.add(scene.id);
        }
      });
      startScenes.forEach((sceneId) => {
        _topScenes.add(sceneId);
      });
      const topScenes = Array.from(_topScenes);

      setAllNodesPosition(_nodes, graphToTree(topScenes, edgesConfig), topScenes);

      return _nodes;
    });
    setEdges(edgesConfig);
  }, [nodesConfig, edgesConfig, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (params) => {
      const { source, target } = params;
      if (source !== target && source && target) {
        setEdges((eds) => addEdge({ ...params, type: 'floating' }, eds));
        dispatch(addChildScene({ sourceId: source, targetId: target }));
      }
    },
    [setEdges, dispatch],
  );
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent<Element, MouseEvent>, edge: Edge) => {
      // remove edge
      setEdges((es) => es.filter((e) => e.id !== edge.id));
      dispatch(deleteChildScene({ sourceId: edge.source, targetId: edge.target }));
    },
    [setEdges, dispatch],
  );
  return (
    <div className="SceneGraph">
      <div className="SceneGraph__graph">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          defaultViewport={{
            zoom: 1.5,
            x: -startPos.x * 1.5 + (document.body.clientWidth * 0.8) / 2 - 200 / 1.5,
            y: -startPos.y * 1.5 + document.body.clientHeight * 0.8 - 80,
          }}
          attributionPosition="bottom-left"
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: 'floating',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 16,
              color: '#9747ff',
            },
            style: {
              strokeWidth: 2,
              stroke: '#9747ff',
            },
          }}
          connectionRadius={50}
          onEdgeClick={onEdgeClick}
          // connectionLineComponent={CustomConnectionLine}
          // connectionLineStyle={{
          //   strokeWidth: 3,
          //   stroke: "black",
          // }}
          onNodeClick={(_event, node) => {
            // Handle node click events here
          }}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={32} size={1} />
          <Panel position="top-right">
            <Button className="SceneGraph__add-scene-btn" onClick={handleAddScene} theme="secondary">
              Add Scene
            </Button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
import { openModal } from '../../state/slices/inputSlice';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
