import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast glass ${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <p className="toast-message">{message}</p>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss toast">
        &times;
      </button>
    </div>
  );
}
