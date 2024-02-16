import React, { useCallback } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";
import "./SceneGraph.scss";
import { useAppSelector, useAppDispatch } from "../../state/store";
import { setStartScene } from "../../state/slices/novelFormSlice";
import { selectScenes } from "../../state/selectors";
import config from "../../config";
import { getEdgeParams } from "./utils.js";
import { RiDragMove2Line, RiPlayCircleLine } from "react-icons/ri";

function FloatingEdge({ id, source, target, markerEnd, style }) {
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source])
  );
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target])
  );

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
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  );
}

function CustomConnectionLine({ fromX, fromY, toX, toY, connectionLineStyle }) {
  const [edgePath] = getStraightPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path style={connectionLineStyle} fill="none" d={edgePath} />
      <circle
        cx={toX}
        cy={toY}
        fill="black"
        r={3}
        stroke="black"
        strokeWidth={1.5}
      />
    </g>
  );
}

const connectionNodeIdSelector = (state) => state.connectionNodeId;
const SceneNode = ({ id, data }) => {
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const dispatch = useAppDispatch();
  const startScene = useAppSelector((state) => state.novel.startSceneId);
  const setStartSceneId = (id) => dispatch(setStartScene(id));

  const isConnecting = !!connectionNodeId;
  const isStartScene = id === startScene;

  return (
    <>
      <div
        className="SceneNode"
        style={{ backgroundImage: `url(${data.background})` }}
      >
        {!isConnecting && (
          <Handle
            className="customHandleSource"
            position={Position.Right}
            type="source"
          />
        )}
        <Handle
          className="customHandleTarget"
          position={Position.Left}
          type="target"
          isConnectableStart={false}
        />
        <div className="SceneNode__title">
          {data.title} <RiDragMove2Line />
        </div>
        <RiPlayCircleLine
          className={`SceneNode__start-icon ${isStartScene ? "selected" : ""}`}
          onClick={() => setStartSceneId(id)}
        />
        <div className="SceneNode__characters">
          {data.characters.map((char, index) => (
            <img
              key={index}
              src={char}
              alt={`Character ${index}`}
              className="SceneNode__character"
            />
          ))}
        </div>
      </div>
    </>
  );
};

const nodeTypes = { sceneNode: SceneNode };
const edgeTypes = {
  floating: FloatingEdge,
};

export default function SceneGraph() {
  const scenes = useAppSelector(selectScenes);
  const startPos = { x: 0, y: 0 };
  const initialNodes = [
    ...scenes.map((scene, index) => {
      return {
        id: scene.id,
        type: "sceneNode",
        position: { x: startPos.x + 200 * index, y: startPos.y + 25 }, // Adjusted for simplicity
        data: {
          title: scene.name,
          background: config.genAssetLink(scene.background?.source.jpg || ""),
          characters: scene.characters.map((char) =>
            config.genAssetLink(char.profile_pic || "")
          ),
        },
      };
    }),
  ];
  const initialEdges = scenes.flatMap((scene) =>
    scene.children.map((childId) => ({
      id: `e${scene.id}-${childId}`,
      source: scene.id,
      target: childId,
      type: "default",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: "#9747ff",
      },
      style: {
        strokeWidth: 2,
        stroke: "#9747ff",
      },
    }))
  );
  console.log("initialEdges", initialEdges);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params) => {
      console.log("params", params);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
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
            x:
              -startPos.x * 1.5 +
              (document.body.clientWidth * 0.8) / 2 -
              200 / 1.5,
            y: -startPos.y * 1.5 + document.body.clientHeight * 0.8 - 80,
          }}
          attributionPosition="bottom-left"
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: "floating",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 16,
              color: "#9747ff",
            },
            style: {
              strokeWidth: 2,
              stroke: "#9747ff",
            },
          }}
          connectionRadius={50}
          onEdgeClick={(_event, edge) => {
            // remove edge
            setEdges((es) => es.filter((e) => e.id !== edge.id));
          }}
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
        </ReactFlow>
      </div>
    </div>
  );
}
