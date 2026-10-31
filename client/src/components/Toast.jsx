import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        {type === 'success' ? (
          <CheckCircle2 size={18} className="text-emerald" />
        ) : type === 'error' ? (
          <AlertCircle size={18} className="text-rose" />
        ) : (
          <Info size={18} className="text-blue" />
        )}
        <span className="toast-text">{message}</span>
        <button onClick={onClose} className="toast-close-btn" title="Dismiss">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
