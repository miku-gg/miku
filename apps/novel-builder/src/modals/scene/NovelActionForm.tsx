import { NovelV3 } from '@mikugg/bot-utils';
import ButtonGroup from '../../components/ButtonGroup';
import InventoryItems from '../../panels/assets/inventory/InventoryItems';
import { selectEditingInventoryItem, selectGlobalVariables } from '../../state/selectors';
import { useAppSelector } from '../../state/store';
import { Dropdown, Input, Button } from '@mikugg/ui-kit';
import { formatNumberInput } from '../../libs/numberFormatter';
import { useState } from 'react';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
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
    case NovelV3.NovelActionType.SET_GLOBAL_VARIABLE:
      return {
        type: NovelV3.NovelActionType.SET_GLOBAL_VARIABLE,
        params: {
          variables: [],
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

const SetGlobalVariableForm = ({
  action,
  onChange,
}: {
  action: NovelV3.NovelAction & { type: NovelV3.NovelActionType.SET_GLOBAL_VARIABLE };
  onChange: (action: NovelV3.NovelAction) => void;
}) => {
  const globalVariables = useAppSelector(selectGlobalVariables);
  const [numberInputValues, setNumberInputValues] = useState<Record<string, string>>({});

  const variableOptions = globalVariables.map((v) => ({
    name: v.name || `Variable ${v.id}`,
    value: v.id,
  }));

  const addVariable = () => {
    const newVariable = {
      variableId: '',
      value: '',
    };
    onChange({
      ...action,
      params: {
        variables: [...action.params.variables, newVariable],
      },
    });
  };

  const removeVariable = (index: number) => {
    const updatedVariables = action.params.variables.filter((_, i) => i !== index);
    onChange({
      ...action,
      params: {
        variables: updatedVariables,
      },
    });
  };

  const updateVariable = (index: number, variableId: string, value: string | number | boolean) => {
    const updatedVariables = [...action.params.variables];
    updatedVariables[index] = { variableId, value };
    onChange({
      ...action,
      params: {
        variables: updatedVariables,
      },
    });
  };

  const getValueInput = (variableId: string, currentValue: string | number | boolean, index: number) => {
    const selectedVariable = globalVariables.find((v) => v.id === variableId);
    if (!selectedVariable) return null;

    switch (selectedVariable.type) {
      case 'boolean':
        return (
          <Dropdown
            items={[
              { name: 'true', value: 'true' },
              { name: 'false', value: 'false' },
            ]}
            selectedIndex={currentValue === true ? 0 : 1}
            onChange={(dropdownIndex) => {
              const boolValue = dropdownIndex === 0;
              updateVariable(index, variableId, boolValue);
            }}
          />
        );
      case 'number':
        const numberKey = `${variableId}-${index}`;
        const numberValue =
          numberInputValues[numberKey] !== undefined ? numberInputValues[numberKey] : String(currentValue);

        return (
          <Input
            value={numberValue}
            onChange={(e) => {
              const inputValue = e.target.value;
              const formattedValue = formatNumberInput(inputValue);
              setNumberInputValues((prev) => ({
                ...prev,
                [numberKey]: formattedValue,
              }));

              const numValue = Number(formattedValue);
              if (Number.isFinite(numValue)) {
                updateVariable(index, variableId, numValue);
              }
            }}
            onBlur={() => {
              const formattedValue = formatNumberInput(numberValue);
              const numValue = Number(formattedValue);
              if (Number.isFinite(numValue)) {
                setNumberInputValues((prev) => ({
                  ...prev,
                  [numberKey]: String(numValue),
                }));
                updateVariable(index, variableId, numValue);
              }
            }}
          />
        );
      case 'string':
        return (
          <Input
            value={String(currentValue)}
            onChange={(e) => {
              updateVariable(index, variableId, e.target.value);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="SetGlobalVariableForm">
      {action.params.variables.map((variable, index) => (
        <div key={index} className="SetGlobalVariableForm__row">
          <div className="SetGlobalVariableForm__field">
            <label className="SetGlobalVariableForm__label">Variable</label>
            <div className="SetGlobalVariableForm__control">
              <Dropdown
                items={variableOptions}
                selectedIndex={variableOptions.findIndex((v) => v.value === variable.variableId)}
                onChange={(dropdownIndex) => {
                  const variableId = variableOptions[dropdownIndex]?.value;
                  if (variableId) {
                    const selectedVar = globalVariables.find((v) => v.id === variableId);
                    const defaultValue =
                      selectedVar?.type === 'boolean' ? false : selectedVar?.type === 'number' ? 0 : '';
                    updateVariable(index, variableId, defaultValue);
                  }
                }}
              />
            </div>
          </div>

          <div className="SetGlobalVariableForm__field">
            <label className="SetGlobalVariableForm__label">Value</label>
            <div className="SetGlobalVariableForm__control">
              {getValueInput(variable.variableId, variable.value, index)}
            </div>
          </div>

          <div className="SetGlobalVariableForm__field">
            <label className="SetGlobalVariableForm__label">&nbsp;</label>
            <div className="SetGlobalVariableForm__control">
              <Button
                theme="secondary"
                className="SetGlobalVariableForm__delete danger"
                onClick={() => removeVariable(index)}
              >
                <FaTrashAlt />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <div className="SetGlobalVariableForm__add">
        <Button theme="primary" onClick={addVariable}>
          <FaPlus />
        </Button>
      </div>
    </div>
  );
};

const ActionParamsForm = ({
  action,
  onChange,
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
  }

  //set-global-variable
  else if (action.type === NovelV3.NovelActionType.SET_GLOBAL_VARIABLE) {
    return <SetGlobalVariableForm action={action} onChange={onChange} />;
  } else {
    return null;
  }
};

export default function NovelActionForm({
  action,
  onChange,
  onDelete: _onDelete,
  availableActionTypes: _availableActionTypes,
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
            {
              content: 'Set global variable',
              value: NovelV3.NovelActionType.SET_GLOBAL_VARIABLE,
            },
          ]}
          selected={action.type}
          onButtonClick={(value) => {
            onChange(getDefaultAction(value));
          }}
        />
      </div>
      <div className="NovelActionForm__action-params">
        <ActionParamsForm action={action} onChange={(action) => onChange(action)} />
      </div>
    </div>
  );
}
