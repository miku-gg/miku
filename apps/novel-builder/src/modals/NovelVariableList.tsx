import { AreYouSure, Button, Dropdown, Input } from '@mikugg/ui-kit';
import { FaTrashAlt, FaSearch } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../state/store';
import { createVariableInBank, deleteVariableInBank, updateVariableInBank } from '../state/slices/novelFormSlice';
import { selectVariablesInBank } from '../state/selectors';
import { formatNumberInput } from '../libs/numberFormatter';
import './NovelVariableList.scss';
import { v4 as uuidv4 } from 'uuid';
import { useState, useMemo } from 'react';

interface NovelVariableListProps {
  bankId: string;
  title: string;
  showHeader?: boolean;
}

export default function NovelVariableList({ bankId, title, showHeader = true }: NovelVariableListProps) {
  const dispatch = useAppDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const [numberInputs, setNumberInputs] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Get variables from the specified bank
  const allVariables = useAppSelector((state) => selectVariablesInBank(state, bankId));

  // Filter variables based on search query
  const variables = useMemo(() => {
    if (!searchQuery.trim()) return allVariables;

    const query = searchQuery.toLowerCase();
    return allVariables.filter(
      (variable) => variable.name?.toLowerCase().includes(query) || variable.description?.toLowerCase().includes(query),
    );
  }, [allVariables, searchQuery]);

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

  const handleCreateVariable = () => {
    dispatch(
      createVariableInBank({
        bankId,
        variableId: uuidv4(),
      }),
    );
  };

  const handleUpdateVariable = (id: string, changes: any) => {
    dispatch(
      updateVariableInBank({
        bankId,
        variableId: id,
        changes,
      }),
    );
  };

  const handleDeleteVariable = (id: string) => {
    dispatch(
      deleteVariableInBank({
        bankId,
        variableId: id,
      }),
    );
  };

  return (
    <div className="NovelVariableEditModal">
      {showHeader && <h2>{title}</h2>}

      <div className="NovelVariableEditModal__search">
        <div className="NovelVariableEditModal__search-container">
          <FaSearch className="NovelVariableEditModal__search-icon" />
          <Input
            placeHolder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="NovelVariableEditModal__actions">
        <Button theme="secondary" onClick={handleCreateVariable} disabled={searchQuery.trim().length > 0}>
          <FaPlus />
          Add variable
        </Button>
      </div>
      <div className="NovelVariableEditModal__list">
        {variables.map((v, index) => (
          <div key={v.id} className="NovelVariableEditModal__row">
            <div className="NovelVariableEditModal__cell NovelVariableEditModal__cell--index">{index + 1}</div>

            <div className="NovelVariableEditModal__cell NovelVariableEditModal__cell--info">
              {/* First row: Name and Type */}
              <div className="NovelVariableEditModal__info-row">
                <div className="NovelVariableEditModal__cell NovelVariableEditModal__cell--name">
                  <div className="NovelVariableEditModal__field">
                    <label className="NovelVariableEditModal__label">Name</label>
                    <div className="NovelVariableEditModal__control">
                      <Input
                        value={v.name}
                        placeHolder="Variable name"
                        onChange={(e) => handleUpdateVariable(v.id, { name: e.target.value })}
                        maxLength={64}
                      />
                      <div className="NovelVariableEditModal__mobile-delete">
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
                                handleDeleteVariable(v.id);
                              },
                              overlayClassName: 'AreYouSure__overlay--high-z-index',
                            })
                          }
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="NovelVariableEditModal__cell NovelVariableEditModal__cell--type">
                  <div className="NovelVariableEditModal__field">
                    <label className="NovelVariableEditModal__label">Type</label>
                    <div className="NovelVariableEditModal__control">
                      <Dropdown
                        items={typeItems}
                        selectedIndex={typeItems.findIndex((t) => t.value === v.type)}
                        onChange={(i) =>
                          handleUpdateVariable(v.id, {
                            type: typeItems[i].value as 'number' | 'string' | 'boolean',
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Second row: Value */}
              <div className="NovelVariableEditModal__info-row">
                <div className="NovelVariableEditModal__cell NovelVariableEditModal__cell--value">
                  <div className="NovelVariableEditModal__field">
                    <label className="NovelVariableEditModal__label">Value</label>
                    <div className="NovelVariableEditModal__control">
                      {v.type === 'string' ? (
                        <Input
                          isTextArea
                          placeHolder="Enter text value"
                          value={String(v.value ?? '')}
                          onChange={(e) => handleUpdateVariable(v.id, { value: e.target.value })}
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
                            handleUpdateVariable(v.id, { value: boolValue });
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

                            // Update the variable if it's a valid number
                            const numValue = Number(formattedValue);
                            if (formattedValue === '' || Number.isFinite(numValue)) {
                              handleUpdateVariable(v.id, {
                                value: formattedValue === '' ? 0 : numValue,
                              });
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Third row: Description */}
              <div className="NovelVariableEditModal__info-row">
                <div className="NovelVariableEditModal__cell NovelVariableEditModal__cell--description">
                  <div className="NovelVariableEditModal__field">
                    <label className="NovelVariableEditModal__label">Description</label>
                    <div className="NovelVariableEditModal__control">
                      <Input
                        isTextArea
                        placeHolder="Variable description..."
                        value={v.description}
                        onChange={(e) => handleUpdateVariable(v.id, { description: e.target.value })}
                        maxLength={1024}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="NovelVariableEditModal__cell NovelVariableEditModal__cell--actions">
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
                      handleDeleteVariable(v.id);
                    },
                    overlayClassName: 'AreYouSure__overlay--high-z-index',
                  })
                }
              >
                <FaTrashAlt />
              </Button>
            </div>
          </div>
        ))}
        {variables.length > 0 && (
          <div className="NovelVariableEditModal__actions NovelVariableEditModal__actions--footer">
            <Button
              theme="secondary"
              onClick={handleCreateVariable}
              style={{ width: 46 }}
              disabled={searchQuery.trim().length > 0}
            >
              <FaPlus />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
