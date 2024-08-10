import { NovelV3 } from '@mikugg/bot-utils';
import ButtonGroup from '../../components/ButtonGroup';
import InventoryItems from '../../panels/assets/inventory/InventoryItems';
import { selectEditingInventoryItem } from '../../state/selectors';
import { useAppSelector } from '../../state/store';
import './NovelActionForm.scss';
import SceneSelector from './SceneSelector';

export const getDefaultAction = (actionType: NovelV3.NovelActionType): NovelV3.NovelAction => {
  switch (actionType) {
    case NovelV3.NovelActionType.ADD_CHILD_SCENES:
      return {
        type: NovelV3.NovelActionType.ADD_CHILD_SCENES,
        params: {
          sceneId: '',
          children: [],
        },
      };
    case NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE:
      return {
        type: NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE,
        params: {
          sceneId: '',
        },
      };
    case NovelV3.NovelActionType.SHOW_ITEM:
      return {
        type: NovelV3.NovelActionType.SHOW_ITEM,
        params: {
          itemId: '',
        },
      };
    case NovelV3.NovelActionType.HIDE_ITEM:
      return {
        type: NovelV3.NovelActionType.HIDE_ITEM,
        params: {
          itemId: '',
        },
      };
    default:
      return {
        type: NovelV3.NovelActionType.HIDE_ITEM,
        params: {
          itemId: '',
        },
      };
  }
};

const ActionParamsForm = ({
  action,
  onChange,
  availableActionTypes,
}: {
  action: NovelV3.NovelAction;
  onChange: (action: NovelV3.NovelAction) => void;
  availableActionTypes?: NovelV3.NovelActionType[];
}) => {
  const editingItem = useAppSelector(selectEditingInventoryItem);

  //suggest-advance-scene
  if (action.type === NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE) {
    return (
      <div className="SuggestScene">
        <SceneSelector
          value={action.params.sceneId}
          multiSelect={false}
          onChange={(sceneId) =>
            onChange({
              type: NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE,
              params: {
                sceneId: sceneId || '',
              },
            })
          }
        />
      </div>
    );
  }

  //add-item
  else if (action.type === NovelV3.NovelActionType.SHOW_ITEM) {
    return (
      <InventoryItems
        skipItemIds={editingItem ? [editingItem.id] : []}
        tooltipText="Select the item that will unlock this condition."
        selectedItemIds={[action.params.itemId]}
        onSelect={(itemId) => {
          onChange({
            ...action,
            params: {
              itemId,
            },
          });
        }}
      />
    );
  }

  //remove-item
  else if (action.type === NovelV3.NovelActionType.HIDE_ITEM) {
    return (
      <InventoryItems
        tooltipText="Select the item that will be hidden by this condition."
        selectedItemIds={[action.params.itemId]}
        onSelect={(itemId) => {
          onChange({
            ...action,
            params: {
              itemId,
            },
          });
        }}
      />
    );
  }

  //add-child-scenes
  else if (action.type === NovelV3.NovelActionType.ADD_CHILD_SCENES) {
    return (
      <div className="ChildScenes">
        <div className="ChildScenes__parent">
          <SceneSelector
            value={action.params.sceneId}
            multiSelect={false}
            title="Parent Scene"
            onChange={(sceneId) => {
              onChange({
                ...action,
                params: {
                  ...action.params,
                  sceneId: sceneId || '',
                },
              });
            }}
          />
        </div>
        <div className="ChildScenes__children">
          <SceneSelector
            value={action.params.children}
            multiSelect={true}
            title="Child Scenes"
            onChange={(children) => {
              onChange({
                ...action,
                params: {
                  ...action.params,
                  children,
                },
              });
            }}
          />
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default function NovelActionForm({
  action,
  onChange,
  onDelete,
  availableActionTypes,
}: {
  action: NovelV3.NovelAction;
  onChange: (action: NovelV3.NovelAction) => void;
  onDelete: () => void;
  availableActionTypes?: NovelV3.NovelActionType[];
}) {
  return (
    <div className="NovelActionForm">
      <div className="NovelActionForm__action-type">
        <ButtonGroup<NovelV3.NovelActionType>
          buttons={[
            {
              content: 'Add children scenes',
              value: NovelV3.NovelActionType.ADD_CHILD_SCENES,
            },
            {
              content: 'Suggest advance scene',
              value: NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE,
            },
            {
              content: 'Add item',
              value: NovelV3.NovelActionType.SHOW_ITEM,
            },
            {
              content: 'Remove item',
              value: NovelV3.NovelActionType.HIDE_ITEM,
            },
          ]}
          selected={action.type}
          onButtonClick={(value) => {
            onChange(getDefaultAction(value));
          }}
        />
      </div>
      <div className="NovelActionForm__action-params">
        <ActionParamsForm
          action={action}
          onChange={(action) => onChange(action)}
          availableActionTypes={availableActionTypes}
        />
      </div>
    </div>
  );
}
