// SlidePanel.tsx

import React, { useState } from 'react';
import Modal from 'react-modal';
import './SlidePanel.scss';

Modal.setAppElement('#root');

const SlidePanel: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="SlidePanel">
      <button onClick={openModal}>Open Panel 21</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        overlayClassName="SlidePanel__overlay"
        className="SlidePanel__modal"
      >
        <h2>Options Panel</h2>
        <button onClick={closeModal}>Close</button>
        {/* Add your options here */}
      </Modal>
    </div>
  );
};

export default SlidePanel;
