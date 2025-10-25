import { Button, Input, Modal } from '@mikugg/ui-kit';
import { useState, useMemo } from 'react';
import { useAppSelector } from '../../state/store';
import { selectAllScenes, selectAllCharacters } from '../../state/selectors';
import { NovelV3 } from '@mikugg/bot-utils';
import './VariableSelectionModal.scss';

interface VariableSelectionModalProps {
  opened: boolean;
  onCloseModal: () => void;
  onSelect: (variableId: string) => void;
  scope: NovelV3.VariableScope;
  targetId?: string;
}

export default function VariableSelectionModal({
  opened,
  onCloseModal,
  onSelect,
  scope,
  targetId,
}: VariableSelectionModalProps) {
  const scenes = useAppSelector(selectAllScenes);
  const characters = useAppSelector(selectAllCharacters);
  const globalVariables = useAppSelector((state) => state.novel.globalVariables);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariableId, setSelectedVariableId] = useState<string>('');

  // Get variables based on scope
  const getVariables = (): NovelV3.NovelVariable[] => {
    switch (scope) {
      case 'global':
        return globalVariables || [];
      case 'scene':
        const scene = scenes.find((s) => s.id === targetId);
        return scene?.localVariables || [];
      case 'character':
        const character = characters.find((c) => c.id === targetId);
        return character?.localVariables || [];
      default:
        return [];
    }
  };

  const allVariables = getVariables();

  // Filter variables based on search query
  const filteredVariables = useMemo(() => {
    if (!searchQuery.trim()) return allVariables;

    const query = searchQuery.toLowerCase();
    return allVariables.filter(
      (variable) => variable.name?.toLowerCase().includes(query) || variable.description?.toLowerCase().includes(query),
    );
  }, [allVariables, searchQuery]);

  const handleVariableSelect = (variableId: string) => {
    setSelectedVariableId(variableId);
  };

  const handleConfirm = () => {
    if (selectedVariableId) {
      onSelect(selectedVariableId);
      onCloseModal();
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'number':
        return 'Number';
      case 'string':
        return 'String';
      case 'boolean':
        return 'Boolean';
      default:
        return type;
    }
  };

  return (
    <Modal opened={opened} onCloseModal={onCloseModal} className="VariableSelectionModal" title="Select Variable">
      <div className="VariableSelectionModal__content">
        <div className="VariableSelectionModal__search">
          <Input
            placeHolder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="VariableSelectionModal__list">
          {filteredVariables.map((variable) => (
            <div
              key={variable.id}
              className={`VariableSelectionModal__item ${
                selectedVariableId === variable.id ? 'VariableSelectionModal__item--selected' : ''
              }`}
              onClick={() => handleVariableSelect(variable.id)}
            >
              <div className="VariableSelectionModal__item-content">
                <div className="VariableSelectionModal__item-header">
                  <div className="VariableSelectionModal__item-name">{variable.name || `Variable ${variable.id}`}</div>
                  <div className="VariableSelectionModal__item-type">{getTypeDisplayName(variable.type)}</div>
                </div>
                <div className="VariableSelectionModal__item-description">
                  {variable.description || 'No description'}
                </div>
              </div>
            </div>
          ))}

          {filteredVariables.length === 0 && searchQuery.trim() && (
            <div className="VariableSelectionModal__no-results">No variables found matching "{searchQuery}"</div>
          )}
        </div>

        <div className="VariableSelectionModal__footer">
          <Button theme="primary" onClick={handleConfirm} disabled={!selectedVariableId}>
            Select Variable
          </Button>
        </div>
      </div>
    </Modal>
  );
}
