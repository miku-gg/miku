import { AreYouSure, Button, Dropdown, Input, Modal } from '@mikugg/ui-kit';
import { FaTrashAlt } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../state/store';
import { createNovelVariable, deleteNovelVariable, updateNovelVariable } from '../state/slices/novelFormSlice';
import { selectNovelVariableModalVariables, selectAllScenes, selectAllCharacters } from '../state/selectors';
import { closeModal } from '../state/slices/inputSlice';
import { formatNumberInput } from '../libs/numberFormatter';
import './NovelVariableEditModal.scss';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

export default function NovelVariableEditModal() {
  const dispatch = useAppDispatch();
  const variables = useAppSelector(selectNovelVariableModalVariables);
  const scenes = useAppSelector(selectAllScenes);
  const characters = useAppSelector(selectAllCharacters);
  const modal = useAppSelector((state) => state.input.modals.novelVariableEdit);
  const isOpen = modal.opened;
  const areYouSure = AreYouSure.useAreYouSure();
  const [numberInputs, setNumberInputs] = useState<Record<string, string>>({});

  const typeItems = [
    { name: 'number', value: 'number' },
    { name: 'string', value: 'string' },
    { name: 'boolean', value: 'boolean' },
  ];

  const getModalTitle = () => {
    if (!modal.scope) return 'Novel Variables';

    switch (modal.scope) {
      case 'global':
        return 'Global Variables';
      case 'scene':
        const scene = scenes.find((s) => s.id === modal.targetId);
        return scene ? `${scene.name} - Local Variables` : 'Scene Variables';
      case 'character':
        const character = characters.find((c) => c.id === modal.targetId);
        return character ? `${character.name} - Local Variables` : 'Character Variables';
      default:
        return 'Novel Variables';
    }
  };

  const getNumberDisplayValue = (variableId: string, currentValue: number) => {
    if (numberInputs[variableId] !== undefined) {
      return numberInputs[variableId];
    }
    return String(currentValue);
  };

  const handleCreateVariable = () => {
    if (!modal.scope) return;
    dispatch(
      createNovelVariable({
        scope: modal.scope,
        targetId: modal.targetId,
        id: uuidv4(),
      }),
    );
  };

  const handleUpdateVariable = (id: string, changes: any) => {
    if (!modal.scope) return;
    dispatch(
      updateNovelVariable({
        scope: modal.scope,
        targetId: modal.targetId,
        id,
        changes,
      }),
    );
  };

  const handleDeleteVariable = (id: string) => {
    if (!modal.scope) return;
    dispatch(
      deleteNovelVariable({
        scope: modal.scope,
        targetId: modal.targetId,
        id,
      }),
    );
  };

  return (
    <Modal
      opened={isOpen}
      shouldCloseOnOverlayClick
      className="NovelVariableEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: 'novelVariableEdit' }))}
    >
      <div className="NovelVariableEditModal">
        <h1>{getModalTitle()}</h1>
        <div className="NovelVariableEditModal__actions">
          <Button theme="secondary" onClick={handleCreateVariable}>
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
              <Button theme="secondary" onClick={handleCreateVariable} style={{ width: 46 }}>
                <FaPlus />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
