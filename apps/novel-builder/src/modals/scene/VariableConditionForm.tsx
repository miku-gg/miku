import { Button, Dropdown, Input } from '@mikugg/ui-kit';
import { NovelV3 } from '@mikugg/bot-utils';
import { FaTrashAlt } from 'react-icons/fa';
import { useAppSelector } from '../../state/store';
import { selectVariableBanks, selectVariablesInBank } from '../../state/selectors';
import { formatNumberInput } from '../../libs/numberFormatter';
import { useState, useEffect } from 'react';
import BankSelectionModal from './BankSelectionModal';
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

  const banks = useAppSelector(selectVariableBanks);
  const [numberInputValue, setNumberInputValue] = useState<string>('');
  const [bankSelectOpened, setBankSelectOpened] = useState(false);
  const [variableSelectOpened, setVariableSelectOpened] = useState(false);

  const currentBankId = condition.bankId || 'global-bank';
  const variables = useAppSelector((state) => selectVariablesInBank(state, currentBankId));
  const selectedVariable = variables.find((v) => v.id === condition.variableId);
  const selectedBank = banks.find((b) => b.id === currentBankId);

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

  const operatorOptions = selectedVariable ? getOperatorOptions(selectedVariable.type) : [];

  const handleBankSelect = (bankId: string) => {
    setBankSelectOpened(false);
    onChange({
      ...condition,
      bankId,
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

  const getBankDisplayName = () => {
    if (selectedBank) {
      return selectedBank.name;
    }
    return 'Select Bank';
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
        {/* First row: Bank, Delete */}
        <div className="VariableConditionForm__row VariableConditionForm__row--scope">
          {/* Bank selector */}
          <div className="VariableConditionForm__field">
            <label className="VariableConditionForm__label">Bank</label>
            <div className="VariableConditionForm__control">
              <Button
                theme="secondary"
                onClick={() => setBankSelectOpened(true)}
                className="VariableConditionForm__target-button"
              >
                {getBankDisplayName()}
              </Button>
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

      <BankSelectionModal
        opened={bankSelectOpened}
        onCloseModal={() => setBankSelectOpened(false)}
        onSelect={handleBankSelect}
      />

      <VariableSelectionModal
        opened={variableSelectOpened}
        onCloseModal={() => setVariableSelectOpened(false)}
        onSelect={handleVariableSelect}
        bankId={currentBankId}
      />
    </div>
  );
}
