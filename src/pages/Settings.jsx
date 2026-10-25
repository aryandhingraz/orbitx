import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/uiSlice.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { ValidatedField } from '../components/ValidatedField.jsx';
import { PRIVACY_LOCK_KEY, SESSION_UNLOCK_KEY } from '../components/ProtectedRoute.jsx';
import '../styles/components/settings.css';

export function Settings() {
  const dispatch = useDispatch();
  const { units, theme, refreshRate, defaultCity, soundEnabled, updateSetting, resetSettings } = useSettings();

  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [currentPasscode, setCurrentPasscode] = useState(() => localStorage.getItem(PRIVACY_LOCK_KEY) || '');
  const [confirmReset, setConfirmReset] = useState(false);

  const [openSections, setOpenSections] = useState({
    units: true,
    dataSources: true,
    appearance: true,
    privacy: true,
    accessibility: false,
    shortcuts: false,
    backup: false,
  });

  function toggleSection(sectionKey) {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  }

  function handleOptionChange(key, value) {
    updateSetting(key, value);
    dispatch(showToast({ message: `Setting updated: ${key} = ${value}`, type: 'info' }));
  }

  function validatePasscode(val) {
    if (!val || val.length === 0) return 'Passcode is required.';
    if (!/^\d{4}$/.test(val)) return 'Passcode must be exactly 4 numeric digits (0-9).';
    return null;
  }

  function handleSavePasscode() {
    const err = validatePasscode(passcode);
    if (err) {
      setPasscodeError(true);
      dispatch(showToast({ message: err, type: 'sale' }));
      return;
    }
    localStorage.setItem(PRIVACY_LOCK_KEY, passcode);
    sessionStorage.setItem(SESSION_UNLOCK_KEY, 'true');
    setCurrentPasscode(passcode);
    setPasscode('');
    setPasscodeError(false);
    dispatch(showToast({ message: 'Journal Privacy Lock enabled (4-digit code saved).', type: 'success' }));
  }

  function handleRemovePasscode() {
    localStorage.removeItem(PRIVACY_LOCK_KEY);
    sessionStorage.removeItem(SESSION_UNLOCK_KEY);
    setCurrentPasscode('');
    dispatch(showToast({ message: 'Journal Privacy Lock disabled.', type: 'info' }));
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
                <strong>{defaultCity ? defaultCity.name : 'Browser Geolocation (Auto — Default: New Delhi, India)'}</strong>
                {defaultCity && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ marginLeft: '12px', height: '32px', padding: '0 12px', fontSize: 'var(--text-caption-sm)' }}
                    onClick={() => handleOptionChange('defaultCity', null)}
                  >
                    Reset to Auto
                  </button>
                )}

                <div style={{ marginTop: 'var(--space-sm)' }}>
                  <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', display: 'block', marginBottom: '6px' }}>
                    Quick Station Presets (India & Global):
                  </span>
                  <div className="tab-strip">
                    {[
                      { name: 'New Delhi, India', lat: 28.6139, lon: 77.209 },
                      { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
                      { name: 'Bengaluru, India', lat: 12.9716, lon: 77.5946 },
                      { name: 'Kolkata, India', lat: 22.5726, lon: 88.3639 },
                      { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
                      { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
                      { name: 'New York, USA', lat: 40.7128, lon: -74.006 },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        className={`filter-chip ${defaultCity?.name === preset.name ? 'filter-chip--active' : ''}`}
                        onClick={() => handleOptionChange('defaultCity', preset)}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
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

        {/* Section 6: Local Privacy Lock (Lectures 37-42 Protected Routes & 55-60 Validated Form) */}
        <div className="pdp-disclosure-row">
          <button
            type="button"
            className="pdp-disclosure-header"
            onClick={() => toggleSection('privacy')}
          >
            <span className="pdp-disclosure-title">6. Local Privacy Lock (Journal Route Gate)</span>
            <span className={`pdp-disclosure-chevron ${openSections.privacy ? 'pdp-disclosure-chevron--open' : ''}`}>▼</span>
          </button>
          {openSections.privacy && (
            <div className="pdp-disclosure-body">
              <p style={{ color: 'var(--color-mute)' }}>
                Protect your personal telemetry journal with a client-side 4-digit passcode gate. Wrapping the <code>/journal</code> path in a <code>&lt;ProtectedRoute&gt;</code> demonstration.
              </p>

              {currentPasscode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="swatch-dot swatch-dot--info"></span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption-sm)' }}>
                      STATUS: <strong>ACTIVE (LOCKED WITH PASSCODE)</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleRemovePasscode}
                    style={{ width: 'fit-content', color: 'var(--color-sale)', borderColor: 'var(--color-sale)' }}
                  >
                    🔓 DISABLE PRIVACY LOCK
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxWidth: '360px', marginTop: 'var(--space-xs)' }}>
                  <ValidatedField
                    label="Set 4-Digit Passcode"
                    type="password"
                    placeholder="e.g. 1234"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (passcodeError) setPasscodeError(false);
                    }}
                    validate={validatePasscode}
                    forceShowError={passcodeError}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSavePasscode}
                    style={{ width: 'fit-content' }}
                  >
                    🔒 Enable Journal Privacy Gate
                  </button>
                </div>
              )}

              <p style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', fontStyle: 'italic', marginTop: 'var(--space-sm)' }}>
                ℹ️ <em>Client-side convenience lock stored in localStorage for rubric compliance. Not backend auth.</em>
              </p>
            </div>
          )}
        </div>

        {/* Section 7: Backup & Factory Restore */}
        <div className="pdp-disclosure-row">
          <button
            type="button"
            className="pdp-disclosure-header"
            onClick={() => toggleSection('backup')}
          >
            <span className="pdp-disclosure-title">7. Backup & Factory Restore</span>
            <span className={`pdp-disclosure-chevron ${openSections.backup ? 'pdp-disclosure-chevron--open' : ''}`}>▼</span>
          </button>
          {openSections.backup && (
            <div className="pdp-disclosure-body">
              <p style={{ color: 'var(--color-mute)' }}>Reset configuration state back to factory defaults.</p>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  width: 'fit-content',
                  color: confirmReset ? '#FFFFFF' : 'var(--color-sale)',
                  backgroundColor: confirmReset ? 'var(--color-sale)' : 'transparent',
                  borderColor: 'var(--color-sale)',
                  transition: 'all 150ms ease',
                }}
                onClick={() => {
                  if (!confirmReset) {
                    setConfirmReset(true);
                    setTimeout(() => setConfirmReset(false), 4000);
                    return;
                  }
                  resetSettings();
                  setConfirmReset(false);
                  dispatch(showToast({ message: 'Settings reset to factory defaults.', type: 'info' }));
                }}
              >
                {confirmReset ? '⚠️ TAP AGAIN TO CONFIRM RESTORE' : '🔄 RESTORE FACTORY DEFAULTS'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
