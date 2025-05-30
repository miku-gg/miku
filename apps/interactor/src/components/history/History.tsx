import { Modal, Tooltip } from '@mikugg/ui-kit';
import { ReactElement } from 'react';
import { BiCloudDownload, BiCloudUpload } from 'react-icons/bi';
import { FaTimes } from 'react-icons/fa';
import { GrHistory } from 'react-icons/gr';
import { toast } from 'react-toastify';
import ReactFlow, { Edge, Node, NodeTypes, Position } from 'reactflow';
import { NarrationResponse, swipeResponse } from '../../state/slices/narrationSlice';
import { replaceState } from '../../state/slices/replaceState';
import { setEditModal, setHistoryModal } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import DialogueNode from './DialogueNode';
import { NodeEditor } from './NodeEditor';
import { DialogueNodeData, setAllNodesPosition } from './utils';

import mergeWith from 'lodash.mergewith';
import 'reactflow/dist/style.css';
import { getCongurationFromParams } from '../../../root';
import { useAppContext } from '../../App.context';
import { trackEvent } from '../../libs/analytics';
import { DEFAULT_INVENTORY, getItemByActionPrompt } from '../../libs/inventoryItems';
import { initialState as initialCreationState } from '../../state/slices/creationSlice';
import { initialState as initialInventoryState } from '../../state/slices/inventorySlice';
import { initialState as initialSettingsState } from '../../state/slices/settingsSlice';
import { migrateV1toV2, migrateV2toV3 } from '../../state/versioning/migrations';
import { VersionId as V1VersionId } from '../../state/versioning/v1.state';
import { VersionId as V2VersionId } from '../../state/versioning/v2.state';
import { VersionId as V3VersionId } from '../../state/versioning/v3.state';
import { DeviceExport } from './DeviceExport';
import { RenPyExportButton } from './ExportToRenpy';
import './History.scss';
import { useI18n } from '../../libs/i18n';

const HistoryActions = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state);
  const hasInteractions = useAppSelector((state) => Object.keys(state.narration.interactions).length > 0);

  const { isMobileApp } = useAppContext();
  const { i18n } = useI18n();

  const handleSave = () => {
    const clonedState = JSON.parse(JSON.stringify(state));
    clonedState.settings.modals.history = false;
    const json = JSON.stringify(clonedState);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `${clonedState.novel.title}_history_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackEvent('download-history-click');
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const stateJsonString = reader.result as string;
        let stateJson = JSON.parse(stateJsonString);
        if (stateJson.version === V1VersionId) {
          stateJson = migrateV2toV3(migrateV1toV2(stateJson));
        } else if (stateJson.version === V2VersionId) {
          stateJson = migrateV2toV3(stateJson);
        }

        if (stateJson.version !== V3VersionId) {
          throw new Error('Narration version mismatch');
        }

        const params = getCongurationFromParams();

        dispatch(
          replaceState({
            ...stateJson,
            objectives: stateJson.objectives,
            inventory: {
              ...initialInventoryState,
              ...(stateJson.inventory || {}),
              items: stateJson.inventory?.items || [...DEFAULT_INVENTORY],
            },
            creation: initialCreationState,
            settings: mergeWith(
              mergeWith(mergeWith({}, initialSettingsState), stateJson.settings || {}),
              params.settings || {},
            ),
          }),
        );
      } catch (e) {
        toast.error('Error reading history file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="History__actions">
      <Tooltip id="history-actions-tooltip" place="bottom" />
      {!isMobileApp && hasInteractions ? <RenPyExportButton state={state} /> : null}
      <DeviceExport />
      {!hasInteractions ? (
        <label
          className="icon-button"
          data-tooltip-id="history-actions-tooltip"
          data-tooltip-content={i18n('load_narration_history')}
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
      ) : null}
      <button
        className="icon-button"
        data-tooltip-id="history-actions-tooltip"
        data-tooltip-content={i18n('download_narration_history')}
        onClick={handleSave}
      >
        <BiCloudDownload />
      </button>
      <button className="icon-button" onClick={() => dispatch(setHistoryModal(false))}>
        <FaTimes />
      </button>
    </div>
  );
};
const nodeTypes: NodeTypes = {
  // eslint-disable-next-line
  // @ts-ignore
  dialogueNode: DialogueNode,
};
const HistoryModal = (): ReactElement => {
  const dispatch = useAppDispatch();
  const { isMobileApp } = useAppContext();
  const narration = useAppSelector((state) => state.narration);
  const novel = useAppSelector((state) => state.novel);
  const inventoryItems = useAppSelector((state) => state.inventory.items);

  const [nodes, edges, startPos] = (() => {
    const parentIds = (() => {
      const parentIds: string[] = [];
      let currentId = narration.currentResponseId;
      while (currentId) {
        parentIds.push(currentId);
        currentId =
          narration.responses[currentId]?.parentInteractionId ||
          narration.interactions[currentId]?.parentResponseId ||
          '';
      }
      return parentIds;
    })();
    const topResponse = narration.responses[parentIds[parentIds.length - 1]];
    const parentIdsSet = new Set(parentIds);

    const nodes: Node<DialogueNodeData>[] = [];
    const edges: Edge[] = [];

    function dfs(response: NarrationResponse) {
      // get parent scene
      const parentSceneId = response.parentInteractionId
        ? narration.interactions[response.parentInteractionId]?.sceneId
        : novel.starts.find((start) => start.id === response.id)?.sceneId;

      const parentScene = novel.scenes.find((scene) => scene.id === parentSceneId);

      const charactersData = response.characters.map(({ characterId }) => {
        const id =
          parentScene?.characters.find(({ characterId: _characterId }) => _characterId === characterId)?.characterId ||
          '';
        const character = novel.characters.find((c) => c.id === id);
        return {
          avatar: character?.profile_pic || '',
          name: character?.name || '',
        };
      });

      const isLastResponse = parentIds[0] === response.id;
      const isRoot = response.id === topResponse?.id;
      nodes.push({
        id: response.id,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        data: {
          avatars: charactersData.map(({ avatar }) => avatar),
          id: response.id,
          isUser: false,
          isLastResponse,
          isRoot,
          isLeaf: response.childrenInteractions.length === 0,
          highlighted: parentIdsSet.has(response.id),
          text: (response.characters[0]?.text || '').substring(0, 100),
          charName: charactersData[0]?.name || '',
          isItemAction: false,
        },
        type: 'dialogueNode',
        position: { x: 0, y: 0 },
        draggable: false,
      });

      response.childrenInteractions.forEach(({ interactionId }) => {
        const interaction = narration.interactions[interactionId];

        if (interaction?.id) {
          const item = getItemByActionPrompt(inventoryItems, interaction.query);
          let query = '';
          if (item) {
            query = `The user used the ${item.name} item.`;
          } else {
            query = interaction.query.substring(0, 100) || '';
          }

          nodes.push({
            id: interaction.id,
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            type: 'dialogueNode',
            draggable: false,
            data: {
              id: interaction.id || '',
              isUser: true,
              isLastResponse: false,
              highlighted: parentIdsSet.has(interaction.id || ''),
              text: query || '',
              isLeaf: interaction.responsesId.length === 0,
              isRoot: false,
              avatars: ['default-profile-pic.png'],
              charName: charactersData[0]?.name || '',
              isItemAction: !!item,
            },
            position: { x: 0, y: 0 },
          });
        }
        edges.push({
          id: `vertical_${response.id}_${interaction?.id}`,
          source: response.id,
          type: 'default',
          target: interactionId,
          focusable: false,
          selected: false,
          animated: parentIdsSet.has(interactionId) && (!response.parentInteractionId || parentIdsSet.has(response.id)),
        });
        interaction?.responsesId.forEach((responseId) => {
          const childResponse = narration.responses[responseId];
          if (!childResponse) return;
          edges.push({
            id: `vertical_${interaction?.id}_${childResponse.id}`,
            source: interaction?.id,
            type: 'default',
            target: childResponse.id,
            focusable: false,
            selected: false,
            animated: parentIdsSet.has(interaction?.id) && parentIdsSet.has(childResponse.id),
          });
          dfs(childResponse);
        });
      });
    }

    // eslint-disable-next-line
    // @ts-ignore
    dfs(topResponse);

    return [nodes, edges, setAllNodesPosition(nodes, edges, topResponse?.id || '')];
  })();

  return (
    <div className={`History__modal ${isMobileApp ? 'History__modal--mobile' : ''}`}>
      {/* eslint-disable-next-line */}
      {/* @ts-ignore */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={{
          zoom: 1.5,
          x: -startPos.x * 1.5 + (document.body.clientWidth * 0.8) / 2 - 200 / 1.5,
          y: -startPos.y * 1.5 + document.body.clientHeight * (isMobileApp ? 0.7 : 0.8) - 80,
        }}
        attributionPosition="bottom-left"
        draggable={false}
        nodeTypes={nodeTypes}
        onNodeClick={(_event, node) => {
          if (narration.responses[node.id]) {
            dispatch(swipeResponse(node.id));
          }
        }}
      />
    </div>
  );
};

const History = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { isMobileApp } = useAppContext();
  const historyOpened = useAppSelector((state) => state.settings.modals.history);
  const { opened: editOpened, id: editId } = useAppSelector((state) => state.settings.modals.edit);
  const { disabled: inputDisabled } = useAppSelector((state) => state.narration.input);
  const { i18n } = useI18n();

  return (
    <div className="History">
      <button
        className="History__trigger icon-button"
        onClick={() => {
          dispatch(setHistoryModal(true));
          trackEvent('history-click');
        }}
        disabled={inputDisabled}
      >
        <GrHistory />
      </button>
      <Modal
        opened={historyOpened}
        title={i18n('history')}
        onCloseModal={() => dispatch(setHistoryModal(false))}
        shouldCloseOnOverlayClick
        overlayClassName="History__modal-overlay"
        className={`History__modal-container ${isMobileApp ? 'History__modal-container--mobile' : ''}`}
      >
        <HistoryModal />
        {!isMobileApp ? <HistoryActions /> : null}
      </Modal>
      <Modal
        opened={editOpened}
        title={i18n('edit')}
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
              }),
            )
          }
        />
      </Modal>
    </div>
  );
};

export default History;
