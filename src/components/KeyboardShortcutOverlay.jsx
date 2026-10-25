import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataPanel } from './DataPanel.jsx';
import { useGeocodingSearch } from '../hooks/useGeocodingSearch.js';
import '../styles/components/keyboardShortcutOverlay.css';

export function KeyboardShortcutOverlay({ isOpen, onClose, onToggle }) {
  const [cmdSearch, setCmdSearch] = useState('');
  const navigate = useNavigate();

  const handleClose = onClose || (() => {});
  const handleToggle = onToggle || handleClose;

  const geocode = useGeocodingSearch(cmdSearch);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleToggle();
        return;
      }

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        handleToggle();
      } else if (e.key === '0' || e.key.toLowerCase() === 'h') {
        navigate('/');
      } else if (e.key === '1') {
        navigate('/explore');
      } else if (e.key === '2') {
        navigate('/compare');
      } else if (e.key === '3') {
        navigate('/satellites');
      } else if (e.key === '4') {
        navigate('/alerts');
      } else if (e.key === '5') {
        navigate('/space-weather');
      } else if (e.key === '6') {
        navigate('/earth-watch');
      } else if (e.key === '7') {
        navigate('/journal');
      } else if (e.key === '8') {
        navigate('/settings');
      } else if (e.key === '9') {
        navigate('/about');
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-pill');
        if (searchInput) {
          searchInput.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, handleToggle]);

  const quickNavs = [
    { label: '0 (or H). Home — OrbitX Observatory', path: '/' },
    { label: '1. Explore — Analytics Charts', path: '/explore' },
    { label: '2. Compare — City Comparator', path: '/compare' },
    { label: '3. Satellites — ISS Tracking', path: '/satellites' },
    { label: '4. Alerts — Command Center', path: '/alerts' },
    { label: '5. Space Weather & 3D Aurora Station', path: '/space-weather' },
    { label: '6. Earth Watch — Disaster News', path: '/earth-watch' },
    { label: '7. Journal — Telemetry Ledger', path: '/journal' },
    { label: '8. Settings — Instrument Config', path: '/settings' },
    { label: '9. About — System Rationale', path: '/about' },
  ];

  function handleJump(path, stateData) {
    navigate(path, { state: stateData });
    handleClose();
  }

  return (
    <DataPanel isOpen={!!isOpen} title="Cmd+K Command Palette & Keybindings" onClose={handleClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {/* Command Search Input */}
        <div className="search-pill-wrapper">
          <span className="search-pill-icon">🔍</span>
          <input
            type="text"
            className="search-pill"
            placeholder="Type a city or command..."
            value={cmdSearch}
            onChange={(e) => setCmdSearch(e.target.value)}
          />
        </div>

        {/* City Search Results */}
        {geocode.results.length > 0 && (
          <div style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)' }}>
            {geocode.results.map((c) => {
              const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <button
                  key={c.id}
                  type="button"
                  style={{ width: '100%', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid var(--color-hairline-soft)', color: 'var(--color-ink)', cursor: 'pointer', background: 'transparent' }}
                  onClick={() => handleJump(`/explore/${slug}`, { selectedCity: c })}
                >
                  <strong>{c.name}</strong>, {c.country} ({c.latitude.toFixed(1)}°, {c.longitude.toFixed(1)}°)
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Nav Links */}
        <div>
          <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', textTransform: 'uppercase' }}>Quick Navigation</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
            {quickNavs.map((nav) => (
              <button
                key={nav.path}
                type="button"
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', height: '36px', padding: '0 12px', fontSize: 'var(--text-caption-md)' }}
                onClick={() => handleJump(nav.path)}
              >
                {nav.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keybinding Reference Grid */}
        <div className="shortcut-grid" style={{ marginTop: 'var(--space-md)' }}>
          <span className="shortcut-key">Cmd+K</span>
          <span>Toggle Command Palette</span>

          <span className="shortcut-key">0 or H</span>
          <span>Return to Home page (OrbitX logo)</span>

          <span className="shortcut-key">1 - 9</span>
          <span>Jump directly to routed pages</span>

          <span className="shortcut-key">/</span>
          <span>Focus search input on current page</span>

          <span className="shortcut-key">Esc</span>
          <span>Close drawers & panels</span>
        </div>
      </div>
    </DataPanel>
  );
}
