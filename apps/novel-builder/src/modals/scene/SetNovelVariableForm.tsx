import { NovelV3 } from '@mikugg/bot-utils';
import { useAppSelector } from '../../state/store';
import { selectAllScenes, selectAllCharacters } from '../../state/selectors';
import { Dropdown, Input, Button } from '@mikugg/ui-kit';
import { formatNumberInput } from '../../libs/numberFormatter';
import { useState } from 'react';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import CharacterSelectModal from './CharacterSelectModal';
import { SceneSelectorModal } from './SceneSelector';
import VariableSelectionModal from './VariableSelectionModal';
import './NovelActionForm.scss';

interface SetNovelVariableFormProps {
  variables: Array<{
    variableId: string;
    value: string | number | boolean;
    scope: NovelV3.VariableScope;
    targetId?: string;
  }>;
  onChange: (
    variables: Array<{
      variableId: string;
      value: string | number | boolean;
      scope: NovelV3.VariableScope;
      targetId?: string;
    }>,
  ) => void;
}

export const SetNovelVariableForm = ({ variables, onChange }: SetNovelVariableFormProps) => {
  const scenes = useAppSelector(selectAllScenes);
  const characters = useAppSelector(selectAllCharacters);
  const globalVariables = useAppSelector((state) => state.novel.globalVariables);
  const [numberInputValues, setNumberInputValues] = useState<Record<string, string>>({});
  const [characterSelectOpened, setCharacterSelectOpened] = useState<{ opened: boolean; index: number }>({
    opened: false,
    index: -1,
  });
  const [sceneSelectOpened, setSceneSelectOpened] = useState<{ opened: boolean; index: number }>({
    opened: false,
    index: -1,
  });
  const [variableSelectOpened, setVariableSelectOpened] = useState<{ opened: boolean; index: number }>({
    opened: false,
    index: -1,
  });

  const addVariable = () => {
    const newVariable = {
      variableId: '',
      value: '',
      scope: 'global' as NovelV3.VariableScope,
      targetId: undefined,
    };
    onChange([...(variables || []), newVariable]);
  };

  const removeVariable = (index: number) => {
    const newVariables = (variables || []).filter((_, i) => i !== index);
    onChange(newVariables);
  };

  const updateVariable = (
    index: number,
    updates: Partial<{
      variableId: string;
      value: string | number | boolean;
      scope: NovelV3.VariableScope;
      targetId?: string;
    }>,
  ) => {
    if (index < 0 || index >= (variables || []).length) return;

    const newVariables = (variables || []).map((v, i) => (i === index ? { ...v, ...updates } : v));
    onChange(newVariables);
  };

  const handleCharacterSelect = (characterId: string) => {
    if (characterSelectOpened.index >= 0) {
      updateVariable(characterSelectOpened.index, { targetId: characterId, variableId: '', value: '' });
    }
    setCharacterSelectOpened({ opened: false, index: -1 });
  };

  const handleSceneSelect = (sceneId: string) => {
    if (sceneSelectOpened.index >= 0) {
      updateVariable(sceneSelectOpened.index, { targetId: sceneId, variableId: '', value: '' });
    }
    setSceneSelectOpened({ opened: false, index: -1 });
  };

  const handleVariableSelect = (variableId: string) => {
    if (variableSelectOpened.index >= 0) {
      const currentVariable = (variables || [])[variableSelectOpened.index];
      if (currentVariable) {
        // Get the variable details to set the default value
        let variables: NovelV3.NovelVariable[] = [];
        switch (currentVariable.scope) {
          case 'global':
            variables = globalVariables || [];
            break;
          case 'scene':
            const scene = scenes.find((s) => s.id === currentVariable.targetId);
            variables = scene?.localVariables || [];
            break;
          case 'character':
            const character = characters.find((c) => c.id === currentVariable.targetId);
            variables = character?.localVariables || [];
            break;
        }

        const selectedVar = variables.find((v) => v.id === variableId);
        const defaultValue = selectedVar?.type === 'boolean' ? false : selectedVar?.type === 'number' ? 0 : '';

        updateVariable(variableSelectOpened.index, {
          variableId,
          value: defaultValue,
        });
      }
    }
    setVariableSelectOpened({ opened: false, index: -1 });
  };

  const getTargetDisplayName = (scope: NovelV3.VariableScope, targetId?: string) => {
    if (scope === 'scene') {
      if (targetId) {
        const scene = scenes.find((s) => s.id === targetId);
        return scene?.name || 'Select Scene';
      }
      return 'Select Scene';
    }
    if (scope === 'character') {
      if (targetId) {
        const character = characters.find((c) => c.id === targetId);
        return character?.name || 'Select Character';
      }
      return 'Select Character';
    }
    return 'Select Target';
  };

  const getVariableDisplayName = (variableId: string, scope: NovelV3.VariableScope, targetId?: string) => {
    if (!variableId) return 'Select Variable';

    let variables: NovelV3.NovelVariable[] = [];
    switch (scope) {
      case 'global':
        variables = globalVariables || [];
        break;
      case 'scene':
        const scene = scenes.find((s) => s.id === targetId);
        variables = scene?.localVariables || [];
        break;
      case 'character':
        const character = characters.find((c) => c.id === targetId);
        variables = character?.localVariables || [];
        break;
    }

    const variable = variables.find((v) => v.id === variableId);
    return variable?.name || 'Select Variable';
  };

  const getValueInput = (
    variableId: string,
    currentValue: string | number | boolean,
    index: number,
    scope: NovelV3.VariableScope,
    targetId?: string,
  ) => {
    if (!variableId) return null;

    let variables: NovelV3.NovelVariable[] = [];

    switch (scope) {
      case 'global':
        variables = globalVariables || [];
        break;
      case 'scene':
        const scene = scenes.find((s) => s.id === targetId);
        variables = scene?.localVariables || [];
        break;
      case 'character':
        const character = characters.find((c) => c.id === targetId);
        variables = character?.localVariables || [];
        break;
    }

    const selectedVariable = variables.find((v) => v.id === variableId);
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
              updateVariable(index, { value: boolValue });
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
                updateVariable(index, { value: numValue });
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
                updateVariable(index, { value: numValue });
              }
            }}
          />
        );
      case 'string':
        return (
          <Input
            value={String(currentValue)}
            onChange={(e) => {
              updateVariable(index, { value: e.target.value });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="SetNovelVariableForm">
      {(variables || []).map((variable, index) => {
        // Safety check - skip invalid variables
        if (!variable || typeof variable !== 'object') return null;

        // Ensure variable has required fields with defaults
        const safeVariable = {
          variableId: variable.variableId || '',
          value: variable.value ?? '',
          scope: variable.scope || 'global',
          targetId: variable.targetId,
        };

        const currentScope = safeVariable.scope;
        const currentTargetId = safeVariable.targetId;

        // Scope options
        const scopeOptions = [
          { name: 'Global', value: 'global' },
          { name: 'Scene', value: 'scene' },
          { name: 'Character', value: 'character' },
        ];

        // Target options are no longer needed since we use selector modals

        // Variable options are no longer needed since we use the selection modal

        // Use stable key
        const key = `var-${index}-${safeVariable.variableId || 'new'}`;

        return (
          <div key={key} className="SetNovelVariableForm__group">
            {/* First row: Scope, Target (if needed), Delete */}
            <div className="SetNovelVariableForm__row SetNovelVariableForm__row--scope">
              <div className="SetNovelVariableForm__field">
                <label className="SetNovelVariableForm__label">Scope</label>
                <div className="SetNovelVariableForm__control">
                  <Dropdown
                    items={scopeOptions}
                    selectedIndex={scopeOptions.findIndex((s) => s.value === currentScope)}
                    onChange={(dropdownIndex) => {
                      const selectedScope = scopeOptions[dropdownIndex]?.value as NovelV3.VariableScope;
                      updateVariable(index, { scope: selectedScope, targetId: undefined, variableId: '', value: '' });
                    }}
                  />
                </div>
              </div>

              {/* Show target selector only for scene/character scope, otherwise show placeholder */}
              {currentScope === 'scene' || currentScope === 'character' ? (
                <div className="SetNovelVariableForm__field">
                  <label className="SetNovelVariableForm__label">
                    {currentScope === 'scene' ? 'Scene' : 'Character'}
                  </label>
                  <div className="SetNovelVariableForm__control">
                    <Button
                      theme="secondary"
                      onClick={() => {
                        if (currentScope === 'scene') {
                          setSceneSelectOpened({ opened: true, index });
                        } else if (currentScope === 'character') {
                          setCharacterSelectOpened({ opened: true, index });
                        }
                      }}
                      className="SetNovelVariableForm__target-button"
                    >
                      {getTargetDisplayName(currentScope, currentTargetId)}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="SetNovelVariableForm__field">
                  <label className="SetNovelVariableForm__label">&nbsp;</label>
                  <div className="SetNovelVariableForm__control">
                    <div className="SetNovelVariableForm__placeholder"></div>
                  </div>
                </div>
              )}

              <div className="SetNovelVariableForm__field">
                <label className="SetNovelVariableForm__label">&nbsp;</label>
                <div className="SetNovelVariableForm__control">
                  <Button
                    theme="secondary"
                    className="SetNovelVariableForm__delete danger"
                    onClick={() => removeVariable(index)}
                  >
                    <FaTrashAlt />
                  </Button>
                </div>
              </div>
            </div>

            {/* Second row: Variable, Value */}
            <div className="SetNovelVariableForm__row SetNovelVariableForm__row--variable">
              <div className="SetNovelVariableForm__field">
                <label className="SetNovelVariableForm__label">Variable</label>
                <div className="SetNovelVariableForm__control">
                  <Button
                    theme="secondary"
                    onClick={() => setVariableSelectOpened({ opened: true, index })}
                    className="SetNovelVariableForm__target-button"
                  >
                    {getVariableDisplayName(safeVariable.variableId, currentScope, currentTargetId)}
                  </Button>
                </div>
              </div>

              <div className="SetNovelVariableForm__field">
                {safeVariable.variableId ? (
                  <>
                    <label className="SetNovelVariableForm__label">Value</label>
                    <div className="SetNovelVariableForm__control">
                      {getValueInput(safeVariable.variableId, safeVariable.value, index, currentScope, currentTargetId)}
                    </div>
                  </>
                ) : (
                  <>
                    <label className="SetNovelVariableForm__label">&nbsp;</label>
                    <div className="SetNovelVariableForm__control">
                      <div className="SetNovelVariableForm__placeholder"></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="SetNovelVariableForm__add">
        <Button theme="primary" onClick={addVariable}>
          <FaPlus />
        </Button>
      </div>

      <CharacterSelectModal
        opened={characterSelectOpened.opened}
        onCloseModal={() => setCharacterSelectOpened({ opened: false, index: -1 })}
        selectedCharacterId={
          characterSelectOpened.index >= 0 ? (variables || [])[characterSelectOpened.index]?.targetId : undefined
        }
        onSelect={handleCharacterSelect}
        showOutfitSelection={false}
      />

      <SceneSelectorModal
        opened={sceneSelectOpened.opened}
        onCloseModal={() => setSceneSelectOpened({ opened: false, index: -1 })}
        selectedSceneId={
          sceneSelectOpened.index >= 0 ? (variables || [])[sceneSelectOpened.index]?.targetId : undefined
        }
        onSelectScene={handleSceneSelect}
      />

      <VariableSelectionModal
        opened={variableSelectOpened.opened}
        onCloseModal={() => setVariableSelectOpened({ opened: false, index: -1 })}
        onSelect={handleVariableSelect}
        scope={
          variableSelectOpened.index >= 0 ? (variables || [])[variableSelectOpened.index]?.scope || 'global' : 'global'
        }
        targetId={variableSelectOpened.index >= 0 ? (variables || [])[variableSelectOpened.index]?.targetId : undefined}
      />
    </div>
  );
};
