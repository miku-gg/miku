import { Edge, Node } from 'reactflow';

export type DialogueNodeData = {
  avatars: string[];
  id: string;
  text: string;
  isUser: boolean;
  highlighted: boolean;
  isLastResponse: boolean;
  isLeaf: boolean;
  isRoot: boolean;
  isItemAction: boolean;
  charName: string;
};

const NODE_WIDTH = 200;
const NODE_HEIGHT = 50;
const PARENT_DISTANCE_GAP = 50;
const SIBLINGS_DISTANCE_GAP = 20;

export const setAllNodesPosition = (
  nodes: Node<DialogueNodeData>[],
  edges: Edge[],
  rootId: string,
): { x: number; y: number } => {
  const nodeMap = new Map<
    string,
    {
      nativeNode: Node<DialogueNodeData>;
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
    if (!node) return 200;
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

  function setPosition(nodeId: string, depth: number, offsetX: number = 0) {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    const subtreeWidth = calculateSubtreeWidth(nodeId);
    node.nativeNode.position = {
      x: offsetX + subtreeWidth / 2,
      y: depth * (NODE_HEIGHT + PARENT_DISTANCE_GAP),
    };
    if (node.nativeNode.data.isLastResponse) {
      startPos.x = node.nativeNode.position.x;
      startPos.y = node.nativeNode.position.y;
    }

    let currentX = offsetX;
    node.children.forEach((child) => {
      const childSubtreeWidth = calculateSubtreeWidth(child);
      setPosition(child, depth + 1, currentX);
      currentX += childSubtreeWidth + SIBLINGS_DISTANCE_GAP;
    });
  }
  setPosition(rootId, 0);
  return startPos;
};
