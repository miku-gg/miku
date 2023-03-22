// Modal.tsx
import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void;
  overlayClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, overlayClose }) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (overlayClose && onClose) {
      onClose();
    }
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" onClick={handleModalClick}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
