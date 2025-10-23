import { Modal } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../state/store';
import { closeModal } from '../state/slices/inputSlice';
import NovelVariableList from './NovelVariableList';

export default function NovelVariableEditModal() {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.input.modals.novelVariableEdit);
  const isOpen = modal.opened;

  const getModalTitle = () => {
    if (!modal.scope) return 'Novel Variables';

    switch (modal.scope) {
      case 'global':
        return 'Global Variables';
      default:
        return 'Novel Variables';
    }
  };

  return (
    <Modal
      opened={isOpen}
      shouldCloseOnOverlayClick
      className="NovelVariableEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: 'novelVariableEdit' }))}
    >
      <div className="NovelVariableEditModal">
        <NovelVariableList scope={modal.scope || 'global'} targetId={modal.targetId} title={getModalTitle()} />
      </div>
    </Modal>
  );
}
