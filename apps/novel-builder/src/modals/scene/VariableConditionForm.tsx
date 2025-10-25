import { Button, Dropdown, Input } from '@mikugg/ui-kit';
import { NovelV3 } from '@mikugg/bot-utils';
import { FaTrashAlt } from 'react-icons/fa';
import { useAppSelector } from '../../state/store';
import { selectAllScenes, selectAllCharacters, selectVariablesForScope } from '../../state/selectors';
import { formatNumberInput } from '../../libs/numberFormatter';
import { useState, useEffect } from 'react';
import CharacterSelectModal from './CharacterSelectModal';
import { SceneSelectorModal } from './SceneSelector';
import VariableSelectionModal from './VariableSelectionModal';
import './VariableConditionForm.scss';

interface VariableConditionFormProps {
  condition: NovelV3.VariableCondition;
  onChange: (condition: NovelV3.VariableCondition) => void;
  onDelete: () => void;
}

export default function VariableConditionForm({ condition, onChange, onDelete }: VariableConditionFormProps) {
  // Defensive check - make sure condition exists and has required properties
  if (!condition || typeof condition !== 'object') {
    return null;
  }

  const scenes = useAppSelector(selectAllScenes);
  const characters = useAppSelector(selectAllCharacters);
  const [numberInputValue, setNumberInputValue] = useState<string>('');
  const [characterSelectOpened, setCharacterSelectOpened] = useState(false);
  const [sceneSelectOpened, setSceneSelectOpened] = useState(false);
  const [variableSelectOpened, setVariableSelectOpened] = useState(false);

  const currentScope = condition.scope || 'global';
  const currentTargetId = condition.targetId;
  const variables = useAppSelector((state) => selectVariablesForScope(state, currentScope, currentTargetId));
  const selectedVariable = variables.find((v) => v.id === condition.variableId);

  // Sync local state with condition value for number inputs
  useEffect(() => {
    if (selectedVariable?.type === 'number') {
      setNumberInputValue(String(condition.value));
    }
  }, [condition.value, selectedVariable?.type]);

  const getOperatorOptions = (variableType: 'number' | 'string' | 'boolean') => {
    switch (variableType) {
      case 'number':
        return [
          { name: 'Equal', value: 'EQUAL' },
          { name: 'Not equal', value: 'NOT_EQUAL' },
          { name: 'Less than', value: 'LESS_THAN' },
          { name: 'Greater than', value: 'GREATER_THAN' },
        ];
      case 'boolean':
        return [
          { name: 'Equal', value: 'EQUAL' },
          { name: 'Not equal', value: 'NOT_EQUAL' },
        ];
      case 'string':
        return [
          { name: 'Equal', value: 'EQUAL' },
          { name: 'Not equal', value: 'NOT_EQUAL' },
        ];
      default:
        return [];
    }
  };

  const getValueInput = () => {
    if (!selectedVariable) return null;

    switch (selectedVariable.type) {
      case 'boolean':
        return (
          <Dropdown
            items={[
              { name: 'true', value: 'true' },
              { name: 'false', value: 'false' },
            ]}
            selectedIndex={condition.value === true ? 0 : 1}
            onChange={(index) => {
              const boolValue = index === 0;
              onChange({
                ...condition,
                value: boolValue,
              });
            }}
          />
        );
      case 'number':
        return (
          <Input
            value={numberInputValue}
            onChange={(e) => {
              const inputValue = e.target.value;
              const formattedValue = formatNumberInput(inputValue);
              setNumberInputValue(formattedValue);

              const numValue = Number(formattedValue);
              if (Number.isFinite(numValue)) {
                onChange({
                  ...condition,
                  value: numValue,
                });
              }
            }}
            onBlur={() => {
              // Apply full formatting on blur
              const formattedValue = formatNumberInput(numberInputValue);
              const numValue = Number(formattedValue);
              if (Number.isFinite(numValue)) {
                setNumberInputValue(String(numValue));
                onChange({
                  ...condition,
                  value: numValue,
                });
              }
            }}
          />
        );
      case 'string':
        return (
          <Input
            value={String(condition.value)}
            onChange={(e) => {
              onChange({
                ...condition,
                value: e.target.value,
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  // Scope options
  const scopeOptions = [
    { name: 'Global', value: 'global' },
    { name: 'Scene', value: 'scene' },
    { name: 'Character', value: 'character' },
  ];

  // Target options are no longer needed since we use selector modals

  // Variable options are no longer needed since we use the selection modal

  const operatorOptions = selectedVariable ? getOperatorOptions(selectedVariable.type) : [];

  const handleCharacterSelect = (characterId: string) => {
    setCharacterSelectOpened(false);
    onChange({
      ...condition,
      targetId: characterId,
      variableId: '',
      operator: 'EQUAL',
      value: '',
    });
  };

  const handleSceneSelect = (sceneId: string) => {
    setSceneSelectOpened(false);
    onChange({
      ...condition,
      targetId: sceneId,
      variableId: '',
      operator: 'EQUAL',
      value: '',
    });
  };

  const handleVariableSelect = (variableId: string) => {
    setVariableSelectOpened(false);
    const variable = variables.find((v) => v.id === variableId);
    onChange({
      ...condition,
      variableId,
      operator: 'EQUAL', // Reset to default operator
      value: variable?.type === 'boolean' ? false : variable?.type === 'number' ? 0 : '',
    });
  };

  const getTargetDisplayName = () => {
    if (currentScope === 'scene') {
      if (currentTargetId) {
        const scene = scenes.find((s) => s.id === currentTargetId);
        return scene?.name || 'Select Scene';
      }
      return 'Select Scene';
    }
    if (currentScope === 'character') {
      if (currentTargetId) {
        const character = characters.find((c) => c.id === currentTargetId);
        return character?.name || 'Select Character';
      }
      return 'Select Character';
    }
    return 'Select Target';
  };

  const getVariableDisplayName = () => {
    if (condition.variableId) {
      const variable = variables.find((v) => v.id === condition.variableId);
      return variable?.name || 'Select Variable';
    }
    return 'Select Variable';
  };

  return (
    <div className="VariableConditionForm">
      <div className="VariableConditionForm__group">
        {/* First row: Scope, Target (if needed), Delete */}
        <div className="VariableConditionForm__row VariableConditionForm__row--scope">
          <div className="VariableConditionForm__field">
            <label className="VariableConditionForm__label">Scope</label>
            <div className="VariableConditionForm__control">
              <Dropdown
                items={scopeOptions}
                selectedIndex={scopeOptions.findIndex((s) => s.value === currentScope)}
                onChange={(index) => {
                  const selectedScope = scopeOptions[index]?.value as NovelV3.VariableScope;
                  onChange({
                    ...condition,
                    scope: selectedScope,
                    targetId: undefined,
                    variableId: '',
                    operator: 'EQUAL',
                    value: '',
                  });
                }}
              />
            </div>
          </div>

          {/* Show target selector only for scene/character scope*/}
          {currentScope === 'scene' || currentScope === 'character' ? (
            <div className="VariableConditionForm__field">
              <label className="VariableConditionForm__label">{currentScope === 'scene' ? 'Scene' : 'Character'}</label>
              <div className="VariableConditionForm__control">
                <Button
                  theme="secondary"
                  onClick={() => {
                    if (currentScope === 'scene') {
                      setSceneSelectOpened(true);
                    } else if (currentScope === 'character') {
                      setCharacterSelectOpened(true);
                    }
                  }}
                  className="VariableConditionForm__target-button"
                >
                  {getTargetDisplayName()}
                </Button>
              </div>
            </div>
          ) : (
            <div className="VariableConditionForm__field">
              <label className="VariableConditionForm__label">&nbsp;</label>
              <div className="VariableConditionForm__control">
                <div className="VariableConditionForm__placeholder"></div>
              </div>
            </div>
          )}

          <div className="VariableConditionForm__field">
            <label className="VariableConditionForm__label">&nbsp;</label>
            <div className="VariableConditionForm__control">
              <Button theme="secondary" className="VariableConditionForm__delete danger" onClick={onDelete}>
                <FaTrashAlt />
              </Button>
            </div>
          </div>
        </div>

        {/* Second row: Variable, Operator, Value */}
        <div className="VariableConditionForm__row VariableConditionForm__row--variable">
          <div className="VariableConditionForm__field">
            <label className="VariableConditionForm__label">Variable</label>
            <div className="VariableConditionForm__control">
              <Button
                theme="secondary"
                onClick={() => setVariableSelectOpened(true)}
                className="VariableConditionForm__target-button"
              >
                {getVariableDisplayName()}
              </Button>
            </div>
          </div>

          <div className="VariableConditionForm__field">
            <label className="VariableConditionForm__label">Operator</label>
            <div className="VariableConditionForm__control">
              {selectedVariable ? (
                <Dropdown
                  items={operatorOptions}
                  selectedIndex={operatorOptions.findIndex((o) => o.value === condition.operator)}
                  onChange={(index) => {
                    const operator = operatorOptions[index]?.value as NovelV3.VariableConditionOperator;
                    if (operator) {
                      onChange({
                        ...condition,
                        operator,
                      });
                    }
                  }}
                />
              ) : (
                <Dropdown items={[]} selectedIndex={-1} onChange={() => {}} />
              )}
            </div>
          </div>

          <div className="VariableConditionForm__field">
            <label className="VariableConditionForm__label">Value</label>
            <div className="VariableConditionForm__control">
              {selectedVariable ? getValueInput() : <Input value="" onChange={() => {}} />}
            </div>
          </div>
        </div>
      </div>

      <CharacterSelectModal
        opened={characterSelectOpened}
        onCloseModal={() => setCharacterSelectOpened(false)}
        selectedCharacterId={currentTargetId}
        onSelect={handleCharacterSelect}
        showOutfitSelection={false}
      />

      <SceneSelectorModal
        opened={sceneSelectOpened}
        onCloseModal={() => setSceneSelectOpened(false)}
        selectedSceneId={currentTargetId}
        onSelectScene={handleSceneSelect}
      />

      <VariableSelectionModal
        opened={variableSelectOpened}
        onCloseModal={() => setVariableSelectOpened(false)}
        onSelect={handleVariableSelect}
        scope={currentScope}
        targetId={currentTargetId}
      />
    </div>
  );
}
