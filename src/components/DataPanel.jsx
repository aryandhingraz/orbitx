import { useEffect, useRef } from 'react';
import '../styles/components/dataPanel.css';

export function DataPanel({ isOpen, title, onClose, children }) {
  const panelRef = useRef(null);

  // Esc key down listener to close panel (§2.5)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="data-panel-backdrop" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className="data-panel-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="data-panel__header">
          <h2 className="data-panel__title">{title}</h2>
          <button
            type="button"
            className="data-panel__close-btn"
            onClick={onClose}
            aria-label="Close telemetry panel"
          >
            ✕
          </button>
        </header>

        <div className="data-panel__body">{children}</div>
      </div>
    </div>
  );
}
