import React from 'react';
import { useApp } from '../../context/AppContext';
import './Toast.css';

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (!toasts?.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{ICONS[t.type] || 'ℹ️'}</span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => dismissToast(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
