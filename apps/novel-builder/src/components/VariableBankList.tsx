import { Button } from '@mikugg/ui-kit';
import { FaCheckCircle } from 'react-icons/fa';
import { FaPencil, FaPlus } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../state/store';
import { selectVariableBanks } from '../state/selectors';
import { openModal } from '../state/slices/inputSlice';
import { v4 as uuidv4 } from 'uuid';
import { createVariableBank } from '../state/slices/novelFormSlice';
import './VariableBankList.scss';

interface VariableBankListProps {
  selectedBankIds: string[];
  onSelectBank: (bankId: string) => void;
  tooltipText?: string;
}

export default function VariableBankList({ selectedBankIds, onSelectBank, tooltipText }: VariableBankListProps) {
  const dispatch = useAppDispatch();
  const banks = useAppSelector(selectVariableBanks);

  const isSelected = (bankId: string) => {
    return selectedBankIds.includes(bankId);
  };

  const handleEditBank = (bankId: string) => {
    dispatch(openModal({ modalType: 'novelVariableEdit', bankId }));
  };

  const handleCreateBank = () => {
    const newBankId = uuidv4();
    dispatch(
      createVariableBank({
        id: newBankId,
        name: 'New Variable Bank',
        description: 'A new variable bank',
      }),
    );
  };

  return (
    <div className="VariableBankList">
      <div className="VariableBankList__header">
        <Button theme="secondary" onClick={handleCreateBank}>
          <FaPlus />
          Create Bank
        </Button>
      </div>

      <div className="VariableBankList__grid">
        {banks.map((bank) => (
          <div
            key={bank.id}
            className={`VariableBankList__item ${isSelected(bank.id) ? 'VariableBankList__item--selected' : ''}`}
            onClick={() => onSelectBank(bank.id)}
            title={tooltipText}
          >
            <FaPencil
              className="VariableBankList__item-edit"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditBank(bank.id);
              }}
            />
            <div className="VariableBankList__item-content">
              <div className="VariableBankList__item-header">
                <h4 className="VariableBankList__item-name">{bank.name}</h4>
              </div>
              <p className="VariableBankList__item-description">{bank.description}</p>
              <div className="VariableBankList__item-meta">
                <span className="VariableBankList__item-count">
                  {bank.variables.length} variable{bank.variables.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {isSelected(bank.id) && (
              <div className="VariableBankList__item-selected-badge">
                <FaCheckCircle />
                Selected
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
