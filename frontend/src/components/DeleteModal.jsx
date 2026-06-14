import React from 'react';
import './DeleteModal.css';

export default function DeleteModal({ isOpen, onConfirm, onCancel, postTitle }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-fade-in">
        <div className="modal-icon">⚠️</div>
        <h3>Delete Post</h3>
        <p>
          Are you sure you want to delete <strong>"{postTitle}"</strong>? This action is permanent and cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onCancel}>
            Keep Post
          </button>
          <button className="btn-modal-delete" onClick={onConfirm}>
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
