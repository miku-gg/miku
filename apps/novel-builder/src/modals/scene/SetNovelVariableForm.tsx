import { NovelV3 } from '@mikugg/bot-utils';
import { useAppSelector } from '../../state/store';
import { selectVariableBanks, selectVariablesInBank } from '../../state/selectors';
import { Dropdown, Input, Button } from '@mikugg/ui-kit';
import { formatNumberInput } from '../../libs/numberFormatter';
import { useState } from 'react';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import BankSelectionModal from './BankSelectionModal';
import VariableSelectionModal from './VariableSelectionModal';
import './NovelActionForm.scss';

interface SetNovelVariableFormProps {
  variables: Array<{
    variableId: string;
    value: string | number | boolean;
    bankId: string;
  }>;
  onChange: (
    variables: Array<{
      variableId: string;
      value: string | number | boolean;
      bankId: string;
    }>,
  ) => void;
}

export const SetNovelVariableForm = ({ variables, onChange }: SetNovelVariableFormProps) => {
  const banks = useAppSelector(selectVariableBanks);
  const [numberInputValues, setNumberInputValues] = useState<Record<string, string>>({});
  const [bankSelectOpened, setBankSelectOpened] = useState<{ opened: boolean; index: number }>({
    opened: false,
    index: -1,
  });
  const [variableSelectOpened, setVariableSelectOpened] = useState<{ opened: boolean; index: number }>({
    opened: false,
    index: -1,
  });

  // Get all variables from all banks for easy lookup
  const allVariables = useAppSelector((state) => {
    const allVars: NovelV3.NovelVariable[] = [];
    banks.forEach((bank) => {
      const bankVars = selectVariablesInBank(state, bank.id);
      allVars.push(...bankVars);
    });
    return allVars;
  });

  const addVariable = () => {
    const newVariable = {
      variableId: '',
      value: '',
      bankId: 'global-bank',
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
      bankId: string;
    }>,
  ) => {
    if (index < 0 || index >= (variables || []).length) return;

    const newVariables = (variables || []).map((v, i) => (i === index ? { ...v, ...updates } : v));
    onChange(newVariables);
  };

  const handleBankSelect = (bankId: string) => {
    if (bankSelectOpened.index >= 0) {
      updateVariable(bankSelectOpened.index, { bankId, variableId: '', value: '' });
    }
    setBankSelectOpened({ opened: false, index: -1 });
  };

  const handleVariableSelect = (variableId: string) => {
    if (variableSelectOpened.index >= 0) {
      const variable = allVariables.find((v) => v.id === variableId);
      if (variable) {
        const defaultValue = variable.type === 'boolean' ? false : variable.type === 'number' ? 0 : '';
        updateVariable(variableSelectOpened.index, { variableId, value: defaultValue });
      }
    }
    setVariableSelectOpened({ opened: false, index: -1 });
  };

  const getBankDisplayName = (bankId: string) => {
    const bank = banks.find((b) => b.id === bankId);
    return bank?.name || 'Select Bank';
  };

  const getVariableDisplayName = (variableId: string) => {
    if (!variableId) return 'Select Variable';
    const variable = allVariables.find((v) => v.id === variableId);
    return variable?.name || 'Select Variable';
  };

  const getValueInput = (variableId: string, currentValue: string | number | boolean, index: number) => {
    if (!variableId) return null;

    const selectedVariable = allVariables.find((v) => v.id === variableId);
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
          bankId: variable.bankId || 'global-bank',
        };

        const currentBankId = safeVariable.bankId;

        // Use stable key
        const key = `var-${index}-${safeVariable.variableId || 'new'}`;

        return (
          <div key={key} className="SetNovelVariableForm__group">
            {/* First row: Bank, Delete */}
            <div className="SetNovelVariableForm__row SetNovelVariableForm__row--scope">
              <div className="SetNovelVariableForm__field">
                <label className="SetNovelVariableForm__label">Bank</label>
                <div className="SetNovelVariableForm__control">
                  <Button
                    theme="secondary"
                    onClick={() => setBankSelectOpened({ opened: true, index })}
                    className="SetNovelVariableForm__target-button"
                  >
                    {getBankDisplayName(currentBankId)}
                  </Button>
                </div>
              </div>

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
                    {getVariableDisplayName(safeVariable.variableId)}
                  </Button>
                </div>
              </div>

              <div className="SetNovelVariableForm__field">
                {safeVariable.variableId ? (
                  <>
                    <label className="SetNovelVariableForm__label">Value</label>
                    <div className="SetNovelVariableForm__control">
                      {getValueInput(safeVariable.variableId, safeVariable.value, index)}
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

      <BankSelectionModal
        opened={bankSelectOpened.opened}
        onCloseModal={() => setBankSelectOpened({ opened: false, index: -1 })}
        onSelect={handleBankSelect}
      />

      <VariableSelectionModal
        opened={variableSelectOpened.opened}
        onCloseModal={() => setVariableSelectOpened({ opened: false, index: -1 })}
        onSelect={handleVariableSelect}
        bankId={
          variableSelectOpened.index >= 0
            ? (variables || [])[variableSelectOpened.index]?.bankId || 'global-bank'
            : 'global-bank'
        }
      />
    </div>
  );
};
