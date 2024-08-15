import { Loader, Modal } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../state/store';
import { closeModal } from '../state/slices/inputSlice';
import './LoadingModal.scss';

export default function LoadingModal() {
  const dispatch = useAppDispatch();
  const { opened: loadingOpened, text: loadingText } = useAppSelector((state) => state.input.modals.loading);
  return (
    <Modal
      opened={loadingOpened}
      onCloseModal={() => dispatch(closeModal({ modalType: 'loading' }))}
      shouldCloseOnOverlayClick={false}
    >
      <div className="LoadingModal">
        <Loader />
        <div>{loadingText || ''}</div>
      </div>
    </Modal>
  );
}
