import React from 'react';
import '../styles/ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // 'warning', 'danger', 'info', 'success'
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className={`confirm-modal ${type}`}>
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">
            {type === 'warning' && '⚠️'}
            {type === 'danger' && '🔴'}
            {type === 'info' && 'ℹ️'}
            {type === 'success' && '✅'}
            {' '}{title}
          </h2>
        </div>
        
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        
        <div className="confirm-modal-footer">
          <button 
            className="confirm-modal-btn confirm-modal-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-btn confirm-modal-action confirm-modal-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
