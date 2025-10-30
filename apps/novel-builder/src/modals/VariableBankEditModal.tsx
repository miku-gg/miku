import { AreYouSure, Button, Modal, Input } from '@mikugg/ui-kit';
import { FaTrashAlt } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../state/store';
import { closeModal } from '../state/slices/inputSlice';
import { updateVariableBank, deleteVariableBank } from '../state/slices/novelFormSlice';
import { selectVariableBankById } from '../state/selectors';
import NovelVariableList from './NovelVariableList';

export default function VariableBankEditModal() {
  const dispatch = useAppDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const modal = useAppSelector((state) => state.input.modals.novelVariableEdit);
  const bank = useAppSelector((state) => (modal.bankId ? selectVariableBankById(state, modal.bankId) : null));
  const isOpen = modal.opened;

  if (!modal.bankId) return null;

  const handleDeleteBank = () => {
    if (!bank) return;
    areYouSure.openModal({
      title: 'Are you sure?',
      description: `Variable bank "${bank.name}" will be deleted. This action cannot be undone.`,
      onYes: () => {
        dispatch(deleteVariableBank({ id: bank.id }));
        dispatch(closeModal({ modalType: 'novelVariableEdit' }));
      },
      overlayClassName: 'AreYouSure__overlay--high-z-index',
    });
  };

  return (
    <Modal
      opened={isOpen}
      shouldCloseOnOverlayClick
      className="VariableBankEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: 'novelVariableEdit' }))}
    >
      <div className="VariableBankEditModal">
        <div className="VariableBankEditModal__bank-info">
          <Input
            label="Bank Name"
            value={bank?.name || ''}
            onChange={(e) => {
              if (bank) {
                dispatch(
                  updateVariableBank({
                    id: bank.id,
                    changes: { name: e.target.value },
                  }),
                );
              }
            }}
            maxLength={128}
          />
          <Input
            label="Bank Description"
            isTextArea
            value={bank?.description || ''}
            onChange={(e) => {
              if (bank) {
                dispatch(
                  updateVariableBank({
                    id: bank.id,
                    changes: { description: e.target.value },
                  }),
                );
              }
            }}
            maxLength={512}
          />
        </div>
        <NovelVariableList bankId={modal.bankId} title="Variables" />
        <div className="VariableBankEditModal__footer">
          <Button theme="secondary" className="VariableBankEditModal__delete-button danger" onClick={handleDeleteBank}>
            <FaTrashAlt />
            Delete Bank
          </Button>
        </div>
      </div>
    </Modal>
  );
}
