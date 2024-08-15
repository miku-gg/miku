import React from 'react';
import Modal from 'react-modal';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import './SlidePanel.scss';

Modal.setAppElement('#root');

const SlidePanel: React.FC<{
  children: React.ReactNode;
  opened: boolean;
  onClose: () => void;
}> = ({ opened, onClose, children }): JSX.Element => {
  return (
    <Modal
      closeTimeoutMS={200}
      isOpen={opened}
      onRequestClose={onClose}
      overlayClassName="SlidePanel__overlay"
      className="SlidePanel__modal scrollbar"
      shouldCloseOnOverlayClick
    >
      {children}
      <button className="SlidePanel__close-btn" onClick={onClose}>
        <MdOutlineKeyboardArrowLeft />
      </button>
    </Modal>
  );
};

export default SlidePanel;
