import { Edge, Node } from 'reactflow';
import { NarrationResponse, NarrationInteraction } from '../../state/slices/narrationSlice';

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

export const findClosestNodes = (
  responses: Record<string, NarrationResponse | undefined>,
  interactions: Record<string, NarrationInteraction | undefined>,
  currentNodeId: string,
  maxNodes: number = 100
): Set<string> => {
  const closestNodes = new Set<string>();
  const queue: { id: string; distance: number }[] = [{ id: currentNodeId, distance: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0 && closestNodes.size < maxNodes) {
    // Sort queue by distance to always process the closest nodes first
    queue.sort((a, b) => a.distance - b.distance);
    const { id, distance } = queue.shift()!;

    if (visited.has(id)) continue;
    visited.add(id);
    closestNodes.add(id);

    const response = responses[id];
    const interaction = interactions[id];

    if (response) {
      // Add parent interaction
      if (response.parentInteractionId && !visited.has(response.parentInteractionId)) {
        queue.push({ id: response.parentInteractionId, distance: distance + 1 });
      }

      // Add children interactions
      response.childrenInteractions?.forEach(({ interactionId }) => {
        if (!visited.has(interactionId)) {
          queue.push({ id: interactionId, distance: distance + 1 });
        }
      });
    }

    if (interaction) {
      // Add parent response
      if (interaction.parentResponseId && !visited.has(interaction.parentResponseId)) {
        queue.push({ id: interaction.parentResponseId, distance: distance + 1 });
      }

      // Add children responses
      interaction.responsesId?.forEach((responseId) => {
        if (!visited.has(responseId)) {
          queue.push({ id: responseId, distance: distance + 1 });
        }
      });
    }
  }

  return closestNodes;
};

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
