import { Button, Input, Modal } from '@mikugg/ui-kit';
import { FaSearch } from 'react-icons/fa';
import { useAppSelector } from '../../state/store';
import { selectVariableBanks } from '../../state/selectors';
import { useState, useMemo } from 'react';
import './BankSelectionModal.scss';

interface BankSelectionModalProps {
  opened: boolean;
  onCloseModal: () => void;
  onSelect: (bankId: string) => void;
}

export default function BankSelectionModal({ opened, onCloseModal, onSelect }: BankSelectionModalProps) {
  const banks = useAppSelector(selectVariableBanks);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return banks;

    const query = searchQuery.toLowerCase();
    return banks.filter(
      (bank) => bank.name.toLowerCase().includes(query) || bank.description.toLowerCase().includes(query),
    );
  }, [banks, searchQuery]);

  const handleSelectBank = (bankId: string) => {
    onSelect(bankId);
    onCloseModal();
  };

  return (
    <Modal opened={opened} shouldCloseOnOverlayClick className="BankSelectionModal" onCloseModal={onCloseModal}>
      <div className="BankSelectionModal__content">
        <h2>Select Variable Bank</h2>

        <div className="BankSelectionModal__search">
          <div className="BankSelectionModal__search-container">
            <FaSearch className="BankSelectionModal__search-icon" />
            <Input placeHolder="Search banks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="BankSelectionModal__list">
          {filteredBanks.map((bank) => (
            <div key={bank.id} className="BankSelectionModal__item" onClick={() => handleSelectBank(bank.id)}>
              <div className="BankSelectionModal__item-content">
                <div className="BankSelectionModal__item-header">
                  <h4 className="BankSelectionModal__item-name">{bank.name}</h4>
                  <span className="BankSelectionModal__item-count">
                    {bank.variables.length} variable{bank.variables.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="BankSelectionModal__item-description">{bank.description}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredBanks.length === 0 && (
          <div className="BankSelectionModal__no-results">No banks found matching your search.</div>
        )}
      </div>
    </Modal>
  );
}
