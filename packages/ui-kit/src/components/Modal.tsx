import React from 'react';
import ReactModal from 'react-modal';
import { classnames } from '@bem-react/classnames';
import './Modal.scss';

ReactModal.setAppElement('#root');

interface ModalProps {
  opened: boolean;
  title?: string;
  children: React.ReactNode;
  onCloseModal?: () => void;
  shouldCloseOnOverlayClick?: boolean;
  hideCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
}

export default function Modal(props: ModalProps): JSX.Element {
  const { opened, onCloseModal, title, children, shouldCloseOnOverlayClick } = props;

  return (
    <ReactModal
      isOpen={opened}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      onRequestClose={onCloseModal}
      className={classnames('Modal', props.className || '')}
      overlayClassName={classnames('Modal__overlay', props.overlayClassName)}
      contentLabel="Modal"
      ariaHideApp={false}
    >
      <div className="Modal__content">
        <div className="Modal__header">
          <h2>{title}</h2>
        </div>
        <div className="Modal__children">{children}</div>
      </div>
    </ReactModal>
  );
}
