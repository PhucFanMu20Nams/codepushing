import React from 'react';
import { useModal } from '../context/ModalContext';
import './InboxModal.css';

const InboxModal = ({ productName }) => {
  const { isModalOpen, closeModal } = useModal();

  if (!isModalOpen) return null;

  return (
    <div className="inbox-modal">
      <div className="inbox-modal-content">
        {/* Yellow header */}
        <div className="inbox-modal-header">
          <button className="inbox-modal-close" onClick={closeModal}>
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="inbox-modal-body">
          <h2 className="inbox-modal-title">INBOX US</h2>
          <h3 className="inbox-modal-subtitle">DETAIL</h3>
          <p className="inbox-modal-text">
            We will provide detail of this specific product and we will advised you what the best and what to choose
          </p>
          <button className="inbox-modal-button">MESSENGER</button>
        </div>
      </div>
    </div>
  );
};

export default InboxModal;