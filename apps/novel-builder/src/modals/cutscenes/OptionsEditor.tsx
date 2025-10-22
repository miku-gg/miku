import { Button, Dropdown, Input } from '@mikugg/ui-kit';
import { useAppSelector } from '../../state/store';
import { NovelV3 } from '@mikugg/bot-utils';
import { v4 as randomUUID } from 'uuid';
import SceneSelector from '../scene/SceneSelector';
import ItemSelector from '../items/ItemSelector';
import { selectGlobalVariables } from '../../state/selectors';
import { formatNumberInput } from '../../libs/numberFormatter';
import { useState } from 'react';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import './OptionsEditor.scss';

interface OptionsEditorProps {
  part: NovelV3.CutScenePart;
  textIndex: number;
  onUpdate: (part: NovelV3.CutScenePart) => void;
}

const SetGlobalVariableForm = ({
  action,
  onChange,
}: {
  action: NovelV3.CutSceneAction & { type: 'SET_GLOBAL_VARIABLE' };
  onChange: (action: NovelV3.CutSceneAction) => void;
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
            {variable.variableId ? (
              <>
                <label className="SetGlobalVariableForm__label">Value</label>
                <div className="SetGlobalVariableForm__control">
                  {getValueInput(variable.variableId, variable.value, index)}
                </div>
              </>
            ) : (
              <>
                <label className="SetGlobalVariableForm__label">&nbsp;</label>
                <div className="SetGlobalVariableForm__control">
                  <div className="SetGlobalVariableForm__placeholder"></div>
                </div>
              </>
            )}
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

export const OptionsEditor = ({ part, textIndex, onUpdate }: OptionsEditorProps) => {
  const scenes = useAppSelector((state) => state.novel.scenes);
  const items = useAppSelector((state) => state.novel.inventory);

  const currentText = part.text[textIndex];
  if (!currentText || currentText.type !== 'options') return null;

  // Only render if there's a text part with type 'options'
  const hasOptionsText = part.text.some((text) => text.type === 'options');
  if (!hasOptionsText) return null;

  const actionTypes = [
    { name: 'Navigate to Scene', value: 'NAVIGATE_TO_SCENE' },
    { name: 'Give Item', value: 'GIVE_ITEM' },
    { name: 'Set Global Variable', value: 'SET_GLOBAL_VARIABLE' },
  ];

  const createOption = () => {
    const newOption: NovelV3.CutSceneOption = {
      id: randomUUID(),
      text: '',
      prompt: '',
      action: {
        type: 'NAVIGATE_TO_SCENE',
        params: { sceneId: scenes[0]?.id || '' },
      },
    };

    const updatedText = [...part.text];
    const existingOptions = currentText.options || [];
    updatedText[textIndex] = {
      ...currentText,
      options: [...existingOptions, newOption],
    };

    onUpdate({ ...part, text: updatedText });
  };

  const updateOption = (optionId: string, updates: Partial<NovelV3.CutSceneOption>) => {
    const updatedOptions = (currentText.options || []).map((option) =>
      option.id === optionId ? { ...option, ...updates } : option,
    );

    const updatedText = [...part.text];
    updatedText[textIndex] = {
      ...currentText,
      options: updatedOptions,
    };

    onUpdate({ ...part, text: updatedText });
  };

  const deleteOption = (optionId: string) => {
    const updatedOptions = (currentText.options || []).filter((option) => option.id !== optionId);

    const updatedText = [...part.text];
    updatedText[textIndex] = {
      ...currentText,
      options: updatedOptions,
    };

    onUpdate({ ...part, text: updatedText });
  };

  const updateAction = (optionId: string, action: NovelV3.CutSceneAction) => {
    updateOption(optionId, { action });
  };

  return (
    <div className="OptionsEditor">
      <div className="OptionsEditor__header">
        <Button theme="secondary" onClick={createOption}>
          +
        </Button>
      </div>

      <div className="OptionsEditor__options">
        {(currentText.options || []).map((option) => (
          <div key={option.id} className="OptionsEditor__option">
            <div className="OptionsEditor__option-controls">
              <Input
                value={option.text}
                onChange={(e) => updateOption(option.id, { text: e.target.value })}
                placeHolder="Option text..."
              />

              <Dropdown
                items={actionTypes}
                selectedIndex={actionTypes.findIndex((item) => item.value === option.action?.type)}
                onChange={(selectedIndex) => {
                  const actionType = actionTypes[selectedIndex].value;
                  if (actionType === 'NAVIGATE_TO_SCENE') {
                    updateAction(option.id, {
                      type: 'NAVIGATE_TO_SCENE',
                      params: { sceneId: '' },
                    });
                  } else if (actionType === 'GIVE_ITEM') {
                    updateAction(option.id, {
                      type: 'GIVE_ITEM',
                      params: { itemId: '' },
                    });
                  } else if (actionType === 'SET_GLOBAL_VARIABLE') {
                    updateAction(option.id, {
                      type: 'SET_GLOBAL_VARIABLE',
                      params: { variables: [] },
                    });
                  }
                }}
                className="OptionsEditor__action-dropdown"
              />

              <Button theme="primary" onClick={() => deleteOption(option.id)}>
                Delete
              </Button>
            </div>

            <Input
              value={option.prompt}
              onChange={(e) => updateOption(option.id, { prompt: e.target.value })}
              placeHolder="*{{user}} took the shiny golden key*"
            />

            <div className="OptionsEditor__option-selectors">
              {option.action?.type === 'NAVIGATE_TO_SCENE' && (
                <SceneSelector
                  multiSelect={false}
                  nonDeletable
                  value={(() => {
                    const sceneId = option.action.params?.sceneId;
                    if (!sceneId) return null;
                    // Check if the scene still exists in the scenes
                    const sceneExists = scenes?.find((scene) => scene.id === sceneId);
                    return sceneExists ? sceneId : null;
                  })()}
                  onChange={(sceneId) => {
                    updateAction(option.id, {
                      type: 'NAVIGATE_TO_SCENE',
                      params: { sceneId: sceneId || '' },
                    });
                  }}
                />
              )}

              {option.action?.type === 'GIVE_ITEM' && (
                <ItemSelector
                  multiSelect={false}
                  nonDeletable
                  value={(() => {
                    const itemId = option.action.params?.itemId;
                    if (!itemId) return null;
                    // Check if the item still exists in the inventory
                    const itemExists = items?.find((item) => item.id === itemId);
                    return itemExists ? itemId : null;
                  })()}
                  onChange={(itemId) => {
                    updateAction(option.id, {
                      type: 'GIVE_ITEM',
                      params: { itemId: itemId || '' },
                    });
                  }}
                />
              )}

              {option.action?.type === 'SET_GLOBAL_VARIABLE' && (
                <SetGlobalVariableForm
                  action={option.action}
                  onChange={(updatedAction) => updateAction(option.id, updatedAction)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
