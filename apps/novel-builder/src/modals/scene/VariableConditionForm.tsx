import { Button, Dropdown, Input } from '@mikugg/ui-kit';
import { NovelV3 } from '@mikugg/bot-utils';
import { FaTrashAlt } from 'react-icons/fa';
import { useAppSelector } from '../../state/store';
import { selectGlobalVariables } from '../../state/selectors';
import { formatNumberInput } from '../../libs/numberFormatter';
import { useState, useEffect } from 'react';
import './VariableConditionForm.scss';

interface VariableConditionFormProps {
  condition: NovelV3.VariableCondition;
  onChange: (condition: NovelV3.VariableCondition) => void;
  onDelete: () => void;
}

export default function VariableConditionForm({ condition, onChange, onDelete }: VariableConditionFormProps) {
  const globalVariables = useAppSelector(selectGlobalVariables);
  const selectedVariable = globalVariables.find((v) => v.id === condition.variableId);
  const [numberInputValue, setNumberInputValue] = useState<string>('');

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

  const variableOptions = globalVariables.map((v) => ({
    name: v.name || `Variable ${v.id}`,
    value: v.id,
  }));

  const operatorOptions = selectedVariable ? getOperatorOptions(selectedVariable.type) : [];

  return (
    <div className="VariableConditionForm">
      <div className="VariableConditionForm__field">
        <label className="VariableConditionForm__label">Variable</label>
        <div className="VariableConditionForm__control">
          <Dropdown
            items={variableOptions}
            selectedIndex={variableOptions.findIndex((v) => v.value === condition.variableId)}
            onChange={(index) => {
              const variableId = variableOptions[index]?.value;
              if (variableId) {
                const variable = globalVariables.find((v) => v.id === variableId);
                onChange({
                  ...condition,
                  variableId,
                  operator: 'EQUAL', // Reset to default operator
                  value: variable?.type === 'boolean' ? false : variable?.type === 'number' ? 0 : '',
                });
              }
            }}
          />
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

      <div className="VariableConditionForm__field">
        <label className="VariableConditionForm__label">&nbsp;</label>
        <div className="VariableConditionForm__control">
          <Button theme="secondary" className="VariableConditionForm__delete danger" onClick={onDelete}>
            <FaTrashAlt />
          </Button>
        </div>
      </div>
    </div>
  );
}
