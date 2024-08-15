import { type } from 'os';
import { Position, MarkerType, Node, Edge } from 'reactflow';

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(intersectionNode, targetNode) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const {
    width: intersectionNodeWidth,
    height: intersectionNodeHeight,
    positionAbsolute: intersectionNodePosition,
  } = intersectionNode;
  const targetPosition = targetNode.positionAbsolute;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNode.width / 2;
  const y1 = targetPosition.y + targetNode.height / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node, intersectionPoint) {
  const n = { ...node.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source, target) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

export function createNodesAndEdges() {
  const nodes = [];
  const edges = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  nodes.push({ id: 'target', data: { label: 'Target' }, position: center });

  for (let i = 0; i < 8; i++) {
    const degrees = i * (360 / 8);
    const radians = degrees * (Math.PI / 180);
    const x = 250 * Math.cos(radians) + center.x;
    const y = 250 * Math.sin(radians) + center.y;

    nodes.push({ id: `${i}`, data: { label: 'Source' }, position: { x, y } });

    edges.push({
      id: `edge-${i}`,
      target: 'target',
      source: `${i}`,
      type: 'floating',
      markerEnd: {
        type: MarkerType.Arrow,
      },
    });
  }

  return { nodes, edges };
}

const NODE_WIDTH = 150;
const NODE_HEIGHT = 70;
const SIBLINGS_DISTANCE_GAP = 20;
const PARENT_DISTANCE_GAP = 50;

export function graphToTree(startNodes: string[], edges: Edge[]): Edge[] {
  const visited = new Set<string>();
  const queue: Array<{ node: string; parent: string | null }> = [];
  const treeEdges: Edge[] = [];

  // Mark start nodes as visited and enqueue them
  for (const startNode of startNodes) {
    visited.add(startNode);
    queue.push({ node: startNode, parent: null });
  }

  while (queue.length > 0) {
    const { node, parent } = queue.shift()!;

    for (const edge of edges) {
      if (edge.source === node) {
        if (!visited.has(edge.target)) {
          if (parent === null || edge.target !== parent) {
            visited.add(edge.target);
            queue.push({ node: edge.target, parent: node });
            treeEdges.push(edge);
          }
        }
      }
    }
  }

  return treeEdges;
}

export const setAllNodesPosition = (nodes: Node[], edges: Edge[], startNodes: string[]): { x: number; y: number } => {
  const nodeMap = new Map<
    string,
    {
      nativeNode: Node;
      subtreeWidth: number;
      children: string[];
    }
  >();
  // populate nodeMap
  nodes.forEach((node) => {
    nodeMap.set(node.id, { nativeNode: node, subtreeWidth: 0, children: [] });
  });
  // populate childs
  edges.forEach((edge) => {
    const { source, target } = edge;
    const sourceNode = nodeMap.get(source);
    if (sourceNode) {
      sourceNode.children.push(target);
    }
  });

  const startPos = { x: 0, y: 0 };

  function calculateSubtreeWidth(nodeId: string): number {
    const node = nodeMap.get(nodeId);
    if (!node) return NODE_WIDTH;
    if (node.subtreeWidth) return node.subtreeWidth;
    if (node.children.length === 0) {
      return NODE_WIDTH;
    }

    let totalWidth = 0;
    node.children.forEach((child) => {
      totalWidth += calculateSubtreeWidth(child) + SIBLINGS_DISTANCE_GAP;
    });
    node.subtreeWidth = totalWidth - SIBLINGS_DISTANCE_GAP; // Subtract extra gap added in the loop
    return node.subtreeWidth;
  }

  function setPosition(nodeId: string, depth: number, offsetX = 0) {
    const node = nodeMap.get(nodeId);
    if (!node) return offsetX;
    const subtreeWidth = calculateSubtreeWidth(nodeId);
    node.nativeNode.position = {
      x: offsetX + subtreeWidth / 2,
      y: depth * (NODE_HEIGHT + PARENT_DISTANCE_GAP),
    };

    let currentX = offsetX;
    node.children.forEach((child) => {
      const childSubtreeWidth = calculateSubtreeWidth(child);
      setPosition(child, depth + 1, currentX);
      currentX += childSubtreeWidth + SIBLINGS_DISTANCE_GAP;
    });

    return node.children.length ? currentX : currentX + NODE_WIDTH + SIBLINGS_DISTANCE_GAP;
  }

  let prevResult = 0;
  startNodes.forEach((start) => {
    prevResult = setPosition(start, 0, prevResult) || 0;
  });
  return startPos;
};
