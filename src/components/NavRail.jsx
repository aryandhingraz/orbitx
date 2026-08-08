import { NavLink } from 'react-router-dom';
import '../styles/components/navRail.css';

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

export function NavRail() {
  return (
    <nav className="nav-rail" aria-label="Main Navigation">
      <div className="nav-rail__header">
        <svg className="nav-rail__logo" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="var(--brass)" strokeWidth="2" />
          <circle cx="16" cy="16" r="8" stroke="var(--verdigris)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="16" cy="16" r="3" fill="var(--brass)" />
        </svg>
        <span className="nav-rail__wordmark">OrbitX</span>
      </div>

      <ul className="nav-rail__menu">
        {navItems.map((item) => (
          <li key={item.path} className="nav-rail__item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-rail__link ${isActive ? 'nav-rail__link--active' : ''}`
              }
              end={item.path === '/'}
            >
              {item.icon}
              <span className="nav-rail__label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nav-rail__footer">
        <span className="nav-rail__pulse-dot" title="Telemetry Feed Live"></span>
        <span>SYS.ONLINE</span>
      </div>
    </nav>
  );
}
