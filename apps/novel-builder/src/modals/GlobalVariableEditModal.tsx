import { AreYouSure, Button, Dropdown, Input, Modal } from '@mikugg/ui-kit';
import { FaTrashAlt } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../state/store';
import { createGlobal, deleteGlobal, updateGlobal } from '../state/slices/novelFormSlice';
import { closeModal } from '../state/slices/inputSlice';
import './GlobalVariableEditModal.scss';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

export default function GlobalVariableEditModal() {
  const dispatch = useAppDispatch();
  const variables = useAppSelector((state) => state.novel.globalVariables || []);
  const isOpen = useAppSelector((state) => state.input.modals.globalVariableEdit.opened);
  const areYouSure = AreYouSure.useAreYouSure();
  const [numberInputs, setNumberInputs] = useState<Record<string, string>>({});

  const typeItems = [
    { name: 'number', value: 'number' },
    { name: 'string', value: 'string' },
    { name: 'boolean', value: 'boolean' },
  ];

  const getNumberDisplayValue = (variableId: string, currentValue: number) => {
    if (numberInputs[variableId] !== undefined) {
      return numberInputs[variableId];
    }
    return String(currentValue);
  };

  const formatNumberInput = (inputValue: string) => {
    // Remove any non-numeric characters except decimal point, minus sign, and plus sign
    let formattedValue = inputValue.replace(/[^0-9.+-]/g, '');

    // Handle multiple decimal points - keep only the first one
    const decimalCount = (formattedValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const firstDecimalIndex = formattedValue.indexOf('.');
      formattedValue =
        formattedValue.substring(0, firstDecimalIndex + 1) +
        formattedValue.substring(firstDecimalIndex + 1).replace(/\./g, '');
    }

    // Handle plus and minus signs
    if (formattedValue.includes('+') || formattedValue.includes('-')) {
      // If there's a plus sign, remove all signs (make positive)
      if (formattedValue.includes('+')) {
        formattedValue = formattedValue.replace(/[+-]/g, '');
      } else {
        // Handle minus signs - keep only one at the beginning
        const minusCount = (formattedValue.match(/-/g) || []).length;
        if (minusCount > 1) {
          formattedValue = '-' + formattedValue.replace(/-/g, '');
        }
        // If minus is not at the beginning, move it there
        if (formattedValue.includes('-') && !formattedValue.startsWith('-')) {
          formattedValue = '-' + formattedValue.replace(/-/g, '');
        }
      }
    }

    // Add leading zero if number starts with decimal point
    if (formattedValue.startsWith('.')) {
      formattedValue = '0' + formattedValue;
    }

    // Handle negative numbers with decimal point at start
    if (formattedValue.startsWith('-.')) {
      formattedValue = '-0' + formattedValue.substring(1);
    }

    // Remove leading zeros (but keep one zero before decimal point)
    if (formattedValue.length > 1) {
      // Handle negative numbers
      const isNegative = formattedValue.startsWith('-');
      const numberPart = isNegative ? formattedValue.substring(1) : formattedValue;

      // Remove leading zeros, but keep at least one digit
      let cleanedNumber = numberPart.replace(/^0+(?=\d)/, '');

      // If we removed everything, keep one zero
      if (cleanedNumber === '' || cleanedNumber === '.') {
        cleanedNumber = '0' + cleanedNumber;
      }

      // Reconstruct with sign
      formattedValue = isNegative ? '-' + cleanedNumber : cleanedNumber;
    }

    return formattedValue;
  };

  return (
    <Modal
      opened={isOpen}
      shouldCloseOnOverlayClick
      className="GlobalVariableEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: 'globalVariableEdit' }))}
    >
      <div className="GlobalVariableEditModal">
        <h1>Global Variables</h1>
        <div className="GlobalVariableEditModal__actions">
          <Button theme="secondary" onClick={() => dispatch(createGlobal({ id: uuidv4() }))}>
            <FaPlus />
            Add variable
          </Button>
        </div>
        <div className="GlobalVariableEditModal__list">
          {variables.map((v, index) => (
            <div key={v.id} className="GlobalVariableEditModal__row">
              <div className="GlobalVariableEditModal__cell GlobalVariableEditModal__cell--index">{index + 1}</div>

              <div className="GlobalVariableEditModal__cell GlobalVariableEditModal__cell--info">
                {/* First row: Name and Type */}
                <div className="GlobalVariableEditModal__info-row">
                  <div className="GlobalVariableEditModal__cell GlobalVariableEditModal__cell--name">
                    <div className="GlobalVariableEditModal__field">
                      <label className="GlobalVariableEditModal__label">Name</label>
                      <div className="GlobalVariableEditModal__control">
                        <Input
                          value={v.name}
                          placeHolder="Variable name"
                          onChange={(e) => dispatch(updateGlobal({ id: v.id, changes: { name: e.target.value } }))}
                          maxLength={64}
                        />
                        <div className="GlobalVariableEditModal__mobile-delete">
                          <Button
                            theme="secondary"
                            className="danger"
                            onClick={() =>
                              areYouSure.openModal({
                                title: 'Are you sure?',
                                description:
                                  v.name && v.name.trim()
                                    ? `Variable "${v.name.trim()}" will be deleted. This action cannot be undone.`
                                    : 'This variable will be deleted. This action cannot be undone.',
                                onYes: () => {
                                  dispatch(deleteGlobal(v.id));
                                },
                              })
                            }
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="GlobalVariableEditModal__cell GlobalVariableEditModal__cell--type">
                    <div className="GlobalVariableEditModal__field">
                      <label className="GlobalVariableEditModal__label">Type</label>
                      <div className="GlobalVariableEditModal__control">
                        <Dropdown
                          items={typeItems}
                          selectedIndex={typeItems.findIndex((t) => t.value === v.type)}
                          onChange={(i) =>
                            dispatch(
                              updateGlobal({
                                id: v.id,
                                changes: { type: typeItems[i].value as 'number' | 'string' | 'boolean' },
                              }),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second row: Value */}
                <div className="GlobalVariableEditModal__info-row">
                  <div className="GlobalVariableEditModal__cell GlobalVariableEditModal__cell--value">
                    <div className="GlobalVariableEditModal__field">
                      <label className="GlobalVariableEditModal__label">Value</label>
                      <div className="GlobalVariableEditModal__control">
                        {v.type === 'string' ? (
                          <Input
                            isTextArea
                            placeHolder="Enter text value"
                            value={String(v.value ?? '')}
                            onChange={(e) => dispatch(updateGlobal({ id: v.id, changes: { value: e.target.value } }))}
                            maxLength={512}
                          />
                        ) : v.type === 'boolean' ? (
                          <Dropdown
                            items={[
                              { name: 'true', value: 'true' },
                              { name: 'false', value: 'false' },
                            ]}
                            selectedIndex={v.value === true ? 0 : 1}
                            onChange={(i) => {
                              const boolValue = i === 0;
                              dispatch(updateGlobal({ id: v.id, changes: { value: boolValue } }));
                            }}
                          />
                        ) : (
                          <Input
                            placeHolder="Enter numeric value"
                            value={getNumberDisplayValue(v.id, (v.value as number) ?? 0)}
                            onChange={(e) => {
                              const formattedValue = formatNumberInput(e.target.value);

                              // Update the local state to show the formatted value
                              setNumberInputs((prev) => ({
                                ...prev,
                                [v.id]: formattedValue,
                              }));

                              // Update the global variable if it's a valid number
                              const numValue = Number(formattedValue);
                              if (formattedValue === '' || Number.isFinite(numValue)) {
                                dispatch(
                                  updateGlobal({
                                    id: v.id,
                                    changes: { value: formattedValue === '' ? 0 : numValue },
                                  }),
                                );
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Third row: Description */}
                <div className="GlobalVariableEditModal__info-row">
                  <div className="GlobalVariableEditModal__cell GlobalVariableEditModal__cell--description">
                    <div className="GlobalVariableEditModal__field">
                      <label className="GlobalVariableEditModal__label">Description</label>
                      <div className="GlobalVariableEditModal__control">
                        <Input
                          isTextArea
                          placeHolder="Variable description..."
                          value={v.description}
                          onChange={(e) =>
                            dispatch(updateGlobal({ id: v.id, changes: { description: e.target.value } }))
                          }
                          maxLength={1024}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="GlobalVariableEditModal__cell GlobalVariableEditModal__cell--actions">
                <Button
                  theme="secondary"
                  className="danger"
                  onClick={() =>
                    areYouSure.openModal({
                      title: 'Are you sure?',
                      description:
                        v.name && v.name.trim()
                          ? `Variable "${v.name.trim()}" will be deleted. This action cannot be undone.`
                          : 'This variable will be deleted. This action cannot be undone.',
                      onYes: () => {
                        dispatch(deleteGlobal(v.id));
                      },
                    })
                  }
                >
                  <FaTrashAlt />
                </Button>
              </div>
            </div>
          ))}
          {variables.length > 0 && (
            <div className="GlobalVariableEditModal__actions GlobalVariableEditModal__actions--footer">
              <Button theme="secondary" onClick={() => dispatch(createGlobal({ id: uuidv4() }))} style={{ width: 46 }}>
                <FaPlus />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
