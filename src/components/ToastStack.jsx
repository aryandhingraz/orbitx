import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dismissToast } from '../store/uiSlice.js';
import '../styles/components/toastStack.css';

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const iconMap = {
    success: '✓',
    sale: '⚠️',
    error: '⚠️',
    info: 'ℹ',
  };

  const icon = iconMap[toast.type] || 'ℹ';
  const modifier = toast.type === 'error' ? 'toast-card--sale' : `toast-card--${toast.type || 'info'}`;

  return (
    <div className={`toast-card ${modifier}`} role="status" aria-live="polite">
      <div className="toast-card__content">
        <span className="toast-card__icon">{icon}</span>
        <span className="toast-card__message">{toast.message}</span>
      </div>
      <button
        type="button"
        className="toast-card__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastStack() {
  const toasts = useSelector((state) => state.ui.toasts);
  const dispatch = useDispatch();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-label="System Notifications">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={(id) => dispatch(dismissToast(id))}
        />
      ))}
    </div>
  );
}
