import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataPanel } from './DataPanel.jsx';
import '../styles/components/keyboardShortcutOverlay.css';

export function KeyboardShortcutOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e) {
      // Ignore keybindings when user is typing in form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === '?') {
        setIsOpen((prev) => !prev);
      } else if (e.key === '1') {
        navigate('/');
      } else if (e.key === '2') {
        navigate('/explore');
      } else if (e.key === '3') {
        navigate('/compare');
      } else if (e.key === '4') {
        navigate('/journal');
      } else if (e.key === '5') {
        navigate('/settings');
      } else if (e.key === '6') {
        navigate('/about');
      } else if (e.key === '/') {
        e.preventDefault();
        navigate('/compare');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <>
      <button
        type="button"
        className="shortcut-badge-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Keyboard shortcuts reference (Press ?)"
      >
        ⌨️ Press <span style={{ color: 'var(--parchment)' }}>?</span> for shortcuts
      </button>

      <DataPanel isOpen={isOpen} title="Keyboard Navigation Shortcuts" onClose={() => setIsOpen(false)}>
        <div className="shortcut-grid">
          <span className="shortcut-key">?</span>
          <span>Toggle keyboard shortcuts guide</span>

          <span className="shortcut-key">1</span>
          <span>Navigate to <strong>Home (Earth Observatory)</strong></span>

          <span className="shortcut-key">2</span>
          <span>Navigate to <strong>Explore (Analytics Charts)</strong></span>

          <span className="shortcut-key">3</span>
          <span>Navigate to <strong>Compare (City Comparator)</strong></span>

          <span className="shortcut-key">4</span>
          <span>Navigate to <strong>Journal (Telemetry Ledger)</strong></span>

          <span className="shortcut-key">5</span>
          <span>Navigate to <strong>Settings (Instrument Config)</strong></span>

          <span className="shortcut-key">6</span>
          <span>Navigate to <strong>About (System Rationale)</strong></span>

          <span className="shortcut-key">/</span>
          <span>Jump to City Compare Search</span>

          <span className="shortcut-key">Esc</span>
          <span>Close open panels & overlays</span>
        </div>
      </DataPanel>
    </>
  );
}
