import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../styles/components/navRail.css';
import '../styles/components/keyboardShortcutOverlay.css';

const navItems = [
  {
    path: '/',
    label: 'Home',
    icon: (
      <svg className="nav-rail__icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    path: '/explore',
    label: 'Explore',
    icon: (
      <svg className="nav-rail__icon" viewBox="0 0 24 24">
        <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M17 7h4v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="6" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    path: '/compare',
    label: 'Compare',
    icon: (
      <svg className="nav-rail__icon" viewBox="0 0 24 24">
        <rect x="3" y="4" width="8" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <rect x="13" y="4" width="8" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M7 8h0.01M17 8h0.01M7 12h0.01M17 12h0.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/satellites',
    label: 'Satellites',
    icon: (
      <svg className="nav-rail__icon" viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    path: '/alerts',
    label: 'Alerts',
    hasBadge: true,
    icon: (
      <svg className="nav-rail__icon" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/space-weather',
    label: 'Aurora & Space',
    icon: (
      <svg className="nav-rail__icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/earth-watch',
    label: 'Earth Watch',
    icon: (
      <svg className="nav-rail__icon" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/journal',
    label: 'Journal',
    icon: (
      <svg className="nav-rail__icon" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M8 7h8M8 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: (
      <svg className="nav-rail__icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    path: '/about',
    label: 'About',
    icon: (
      <svg className="nav-rail__icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function NavRail({ alertCount = 0, onOpenShortcuts }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isItemActive = (path, isNavActive) => {
    if (isNavActive) return true;
    if (path === '/space-weather' && location.pathname === '/aurora') return true;
    return false;
  };

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Top Mobile Bar with OrbitX Logo & Hamburger Toggle Button (Small Screens < 1024px) */}
      <div className="mobile-header-bar">
        <NavLink to="/" className="mobile-header-bar__brand" onClick={handleLinkClick}>
          <svg className="nav-rail__logo" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="var(--color-ink)" strokeWidth="2" />
            <circle cx="16" cy="16" r="8" stroke="var(--color-accent-teal)" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="16" cy="16" r="3" fill="var(--color-ink)" />
          </svg>
          <span className="nav-rail__wordmark">OrbitX</span>
        </NavLink>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {alertCount > 0 && (
            <NavLink
              to="/alerts"
              className="mobile-header-bar__badge"
              onClick={handleLinkClick}
              title={`${alertCount} Active Telemetry Alerts`}
            >
              🚨 {alertCount}
            </NavLink>
          )}

          <button
            type="button"
            className={`hamburger-btn ${mobileOpen ? 'hamburger-btn--active' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
            title="Toggle Navigation Menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-over Drawer & Overlay (Small Screens < 1024px) */}
      {mobileOpen && (
        <div className="nav-drawer-backdrop" onClick={() => setMobileOpen(false)}>
          <aside className="nav-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="nav-drawer__header">
              <NavLink to="/" className="nav-rail__header" onClick={handleLinkClick}>
                <svg className="nav-rail__logo" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="var(--color-ink)" strokeWidth="2" />
                  <circle cx="16" cy="16" r="8" stroke="var(--color-accent-teal)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="16" cy="16" r="3" fill="var(--color-ink)" />
                </svg>
                <span className="nav-rail__wordmark">OrbitX</span>
              </NavLink>
              <button
                type="button"
                className="btn-icon-circular"
                onClick={() => setMobileOpen(false)}
                aria-label="Close Navigation Menu"
                title="Close Navigation Menu"
              >
                ✕
              </button>
            </div>

            <div className="nav-drawer__status">
              <span className="nav-rail__pulse-dot" title="Telemetry Feed Live"></span>
              <span>SYS.ONLINE</span>
            </div>

            <ul className="nav-rail__menu" style={{ margin: 0 }}>
              {navItems.map((item) => (
                <li key={item.path} className="nav-rail__item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-rail__link ${isItemActive(item.path, isActive) ? 'nav-rail__link--active' : ''}`
                    }
                    end={item.path === '/'}
                    onClick={handleLinkClick}
                  >
                    {item.icon}
                    <span className="nav-rail__label">{item.label}</span>
                    {item.hasBadge && alertCount > 0 && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          backgroundColor: 'var(--color-sale)',
                          color: '#FFFFFF',
                          borderRadius: '10px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        {alertCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="nav-drawer__footer">
              {onOpenShortcuts && (
                <button
                  type="button"
                  className="shortcut-inline-btn"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenShortcuts();
                  }}
                  title="View keyboard shortcuts"
                >
                  ⌨️ Shortcuts <span style={{ color: 'var(--color-accent-teal)', fontFamily: 'var(--font-mono)' }}>(?)</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Standard Side Navigation Rail (>= 1024px) */}
      <nav className="nav-rail" aria-label="Main Navigation">
        <NavLink to="/" className="nav-rail__header" title="OrbitX Home (Click to return to Home page)">
          <svg className="nav-rail__logo" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="var(--color-ink)" strokeWidth="2" />
            <circle cx="16" cy="16" r="8" stroke="var(--color-accent-teal)" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="16" cy="16" r="3" fill="var(--color-ink)" />
          </svg>
          <span className="nav-rail__wordmark">OrbitX</span>
        </NavLink>

        <ul className="nav-rail__menu">
          {navItems.map((item) => (
            <li key={item.path} className="nav-rail__item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-rail__link ${isItemActive(item.path, isActive) ? 'nav-rail__link--active' : ''}`
                }
                end={item.path === '/'}
              >
                {item.icon}
                <span className="nav-rail__label">{item.label}</span>
                {item.hasBadge && alertCount > 0 && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      backgroundColor: 'var(--color-sale)',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                    title={`${alertCount} Active Telemetry Alerts`}
                  >
                    {alertCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-rail__footer">
          <div className="nav-rail__status">
            <span className="nav-rail__pulse-dot" title="Telemetry Feed Live"></span>
            <span>SYS.ONLINE</span>
          </div>
          {onOpenShortcuts && (
            <button
              type="button"
              className="shortcut-inline-btn"
              onClick={onOpenShortcuts}
              title="View keyboard shortcuts"
            >
              ⌨️ Shortcuts <span style={{ color: 'var(--color-accent-teal)', fontFamily: 'var(--font-mono)' }}>(?)</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
