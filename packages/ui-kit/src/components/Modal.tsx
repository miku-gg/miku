import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import './Modal.scss';

interface ModalProps {
  opened: boolean;
  title?: string;
  children: React.ReactNode;
  onCloseModal?: () => void;
  shouldCloseOnOverlayClick?: boolean;
  hideCloseButton?: boolean;
}

export default function Modal(props: ModalProps): JSX.Element {
  const { opened, onCloseModal, title, children, shouldCloseOnOverlayClick } =
    props;

  return (
    <ReactModal
      isOpen={opened}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      onRequestClose={onCloseModal}
      className="Modal"
      overlayClassName="Modal__overlay"
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
