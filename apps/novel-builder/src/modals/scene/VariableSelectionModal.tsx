import { Button, Input, Modal } from '@mikugg/ui-kit';
import { useState, useMemo } from 'react';
import { useAppSelector } from '../../state/store';
import { selectVariablesInBank } from '../../state/selectors';
import { FaSearch } from 'react-icons/fa';
import './VariableSelectionModal.scss';

interface VariableSelectionModalProps {
  opened: boolean;
  onCloseModal: () => void;
  onSelect: (variableId: string) => void;
  bankId: string;
}

export default function VariableSelectionModal({
  opened,
  onCloseModal,
  onSelect,
  bankId,
}: VariableSelectionModalProps) {
  const variables = useAppSelector((state) => selectVariablesInBank(state, bankId));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariableId, setSelectedVariableId] = useState<string>('');
  // Filter variables based on search query
  const filteredVariables = useMemo(() => {
    if (!searchQuery.trim()) return variables;

    const query = searchQuery.toLowerCase();
    return variables.filter(
      (variable) => variable.name?.toLowerCase().includes(query) || variable.description?.toLowerCase().includes(query),
    );
  }, [variables, searchQuery]);

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
          <div className="VariableSelectionModal__search-container">
            <FaSearch className="VariableSelectionModal__search-icon" />
            <Input
              placeHolder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
