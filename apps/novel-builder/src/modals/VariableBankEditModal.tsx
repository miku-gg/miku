import { Modal, Input } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../state/store';
import { closeModal } from '../state/slices/inputSlice';
import { updateVariableBank } from '../state/slices/novelFormSlice';
import { selectVariableBankById } from '../state/selectors';
import NovelVariableList from './NovelVariableList';

export default function VariableBankEditModal() {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.input.modals.novelVariableEdit);
  const bank = useAppSelector((state) => (modal.bankId ? selectVariableBankById(state, modal.bankId) : null));
  const isOpen = modal.opened;

  if (!modal.bankId) return null;

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
      </div>
    </Modal>
  );
}


