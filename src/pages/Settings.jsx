import { useState } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import '../styles/components/settings.css';

export function Settings() {
  const { units, theme, refreshRate, defaultCity, soundEnabled, updateSetting, resetSettings } = useSettings();

  const [openSections, setOpenSections] = useState({
    units: true,
    dataSources: true,
    appearance: true,
    accessibility: false,
    shortcuts: false,
    backup: false,
  });

  function toggleSection(sectionKey) {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  }

  function handleOptionChange(key, value) {
    updateSetting(key, value);
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Instrument Controls
          <span className="page-title__tag">CONFIG</span>
        </h1>
        <p className="page-subtitle">
          Configure display units, telemetry refresh rates, audio feedback, & theme mode
        </p>
      </header>

      {/* Accordion Disclosure System */}
      <div className="pdp-disclosure-card">
        {/* Section 1: Units & Locale */}
        <div className="pdp-disclosure-row">
          <button
            type="button"
            className="pdp-disclosure-header"
            onClick={() => toggleSection('units')}
          >
            <span className="pdp-disclosure-title">1. Units & Locale Settings</span>
            <span className={`pdp-disclosure-chevron ${openSections.units ? 'pdp-disclosure-chevron--open' : ''}`}>▼</span>
          </button>
          {openSections.units && (
            <div className="pdp-disclosure-body">
              <p style={{ color: 'var(--color-mute)' }}>Choose measurement units for temperature (°C / °F) and wind speed (km/h / mph).</p>
              <div className="tab-strip">
                <button
                  type="button"
                  className={`filter-chip ${units === 'metric' ? 'filter-chip--active' : ''}`}
                  onClick={() => handleOptionChange('units', 'metric')}
                >
                  Metric (°C, km/h)
                </button>
                <button
                  type="button"
                  className={`filter-chip ${units === 'imperial' ? 'filter-chip--active' : ''}`}
                  onClick={() => handleOptionChange('units', 'imperial')}
                >
                  Imperial (°F, mph)
                </button>
              </div>

              <div style={{ marginTop: 'var(--space-md)' }}>
                <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>Station Location Mode: </span>
                <strong>{defaultCity ? defaultCity.name : 'Browser Geolocation (Auto)'}</strong>
                {defaultCity && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ marginLeft: '12px', height: '36px', padding: '0 12px', fontSize: 'var(--text-caption-sm)' }}
                    onClick={() => handleOptionChange('defaultCity', null)}
                  >
                    Reset to Auto
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Data Sources & Refresh Rate */}
        <div className="pdp-disclosure-row">
          <button
            type="button"
            className="pdp-disclosure-header"
            onClick={() => toggleSection('dataSources')}
          >
            <span className="pdp-disclosure-title">2. Data Sources & Refresh Cadence</span>
            <span className={`pdp-disclosure-chevron ${openSections.dataSources ? 'pdp-disclosure-chevron--open' : ''}`}>▼</span>
          </button>
          {openSections.dataSources && (
            <div className="pdp-disclosure-body">
              <p style={{ color: 'var(--color-mute)' }}>Control network fetch frequency for public Earth API endpoints (Open-Meteo, USGS, ISS, NOAA SWPC, NASA EONET).</p>
              <div className="tab-strip">
                <button
                  type="button"
                  className={`filter-chip ${refreshRate === 'live' ? 'filter-chip--active' : ''}`}
                  onClick={() => handleOptionChange('refreshRate', 'live')}
                >
                  ⚡ Live (5-10 min)
                </button>
                <button
                  type="button"
                  className={`filter-chip ${refreshRate === 'balanced' ? 'filter-chip--active' : ''}`}
                  onClick={() => handleOptionChange('refreshRate', 'balanced')}
                >
                  ⚖️ Balanced (10-15 min)
                </button>
                <button
                  type="button"
                  className={`filter-chip ${refreshRate === 'battery-saver' ? 'filter-chip--active' : ''}`}
                  onClick={() => handleOptionChange('refreshRate', 'battery-saver')}
                >
                  🔋 Saver (30 min)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Appearance & Theme */}
        <div className="pdp-disclosure-row">
          <button
            type="button"
            className="pdp-disclosure-header"
            onClick={() => toggleSection('appearance')}
          >
            <span className="pdp-disclosure-title">3. Appearance & Theme Mode</span>
            <span className={`pdp-disclosure-chevron ${openSections.appearance ? 'pdp-disclosure-chevron--open' : ''}`}>▼</span>
          </button>
          {openSections.appearance && (
            <div className="pdp-disclosure-body">
              <p style={{ color: 'var(--color-mute)' }}>Switch between Dark Observatory (Void) and Light Mode (Parchment).</p>
              <div className="tab-strip">
                <button
                  type="button"
                  className={`filter-chip ${theme === 'auto' ? 'filter-chip--active' : ''}`}
                  onClick={() => handleOptionChange('theme', 'auto')}
                >
                  ☀️ Auto (Solar Sunset)
                </button>
                <button
                  type="button"
                  className={`filter-chip ${theme === 'night' ? 'filter-chip--active' : ''}`}
                  onClick={() => handleOptionChange('theme', 'night')}
                >
                  🌙 Night (Void Dark)
                </button>
                <button
                  type="button"
                  className={`filter-chip ${theme === 'day' ? 'filter-chip--active' : ''}`}
                  onClick={() => handleOptionChange('theme', 'day')}
                >
                  📜 Day (Light Parchment)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Accessibility & Motion */}
        <div className="pdp-disclosure-row">
          <button
            type="button"
            className="pdp-disclosure-header"
            onClick={() => toggleSection('accessibility')}
          >
            <span className="pdp-disclosure-title">4. Accessibility & Audio Feedback</span>
            <span className={`pdp-disclosure-chevron ${openSections.accessibility ? 'pdp-disclosure-chevron--open' : ''}`}>▼</span>
          </button>
          {openSections.accessibility && (
            <div className="pdp-disclosure-body">
              <p style={{ color: 'var(--color-mute)' }}>Synthesize observatory audio clicks using Web Audio API and respect reduced motion preferences.</p>
              <div className="tab-strip">
                <button
                  type="button"
                  className={`filter-chip ${soundEnabled ? 'filter-chip--active' : ''}`}
                  onClick={() => handleOptionChange('soundEnabled', true)}
                >
                  🔊 Audio Enabled
                </button>
                <button
                  type="button"
                  className={`filter-chip ${!soundEnabled ? 'filter-chip--active' : ''}`}
                  onClick={() => handleOptionChange('soundEnabled', false)}
                >
                  🔇 Audio Muted
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Keyboard Shortcuts */}
        <div className="pdp-disclosure-row">
          <button
            type="button"
            className="pdp-disclosure-header"
            onClick={() => toggleSection('shortcuts')}
          >
            <span className="pdp-disclosure-title">5. Keyboard Shortcuts Reference</span>
            <span className={`pdp-disclosure-chevron ${openSections.shortcuts ? 'pdp-disclosure-chevron--open' : ''}`}>▼</span>
          </button>
          {openSections.shortcuts && (
            <div className="pdp-disclosure-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption-sm)' }}>
                <div><code>Cmd+K / Ctrl+K</code> - Command Palette</div>
                <div><code>0 or H</code> - Return to Home page (OrbitX logo)</div>
                <div><code>1 - 9</code> - Jump between routed pages</div>
                <div><code>Esc</code> - Close active drawers</div>
                <div><code>/</code> - Focus search pill input</div>
                <div><code>?</code> - Toggle keybindings</div>
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Backup & Factory Restore */}
        <div className="pdp-disclosure-row">
          <button
            type="button"
            className="pdp-disclosure-header"
            onClick={() => toggleSection('backup')}
          >
            <span className="pdp-disclosure-title">6. Backup & Factory Restore</span>
            <span className={`pdp-disclosure-chevron ${openSections.backup ? 'pdp-disclosure-chevron--open' : ''}`}>▼</span>
          </button>
          {openSections.backup && (
            <div className="pdp-disclosure-body">
              <p style={{ color: 'var(--color-mute)' }}>Reset configuration state back to factory defaults.</p>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: 'fit-content', color: 'var(--color-sale)', borderColor: 'var(--color-sale)' }}
                onClick={() => {
                  if (window.confirm('Reset all instrument settings to factory defaults?')) {
                    resetSettings();
                  }
                }}
              >
                🔄 RESTORE FACTORY DEFAULTS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
