import { Modal, Button } from '@mikugg/ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { closeSpendApprovalModal } from '../state/slices/inputSlice';
import { resolveApproval, rejectApproval } from '../services/spendApprovalService';
import { RootState } from '../state/store';
import './SpendApprovalModal.scss';
export default function SpendApprovalModal() {
  const dispatch = useDispatch();
  const modalData = useSelector((state: RootState) => state.input.spendApprovalModal);

  if (!modalData || !modalData.open) return null;

  const { id, amount, reason } = modalData;

  const handleApprove = () => {
    if (id) {
      resolveApproval(id);
    }
    dispatch(closeSpendApprovalModal());
  };

  const handleCancel = () => {
    if (id) {
      rejectApproval(id);
    }
    dispatch(closeSpendApprovalModal());
  };

  return (
    <Modal opened={true} onCloseModal={handleCancel} title="Spend Approval" shouldCloseOnOverlayClick={false}>
      <div className="SpendApprovalModal">
        <div className="SpendApprovalModal__info">
          Miku assistant wants to spend <span className="SpendApprovalModal__amount">{amount} credits</span> to{' '}
          <span className="SpendApprovalModal__reason">{reason}</span>
        </div>
        <div className="SpendApprovalModal__buttons">
          <Button onClick={handleCancel} theme="secondary">
            Cancel
          </Button>
          <Button onClick={handleApprove} theme="primary">
            Approve
          </Button>
        </div>
      </div>
    </Modal>
  );
}
