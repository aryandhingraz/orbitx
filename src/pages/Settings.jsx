import { useSettings } from '../context/SettingsContext.jsx';
import { playTelemetryClick } from '../utils/soundSynthesizer.js';
import '../styles/components/settings.css';

export function Settings() {
  const { units, theme, refreshRate, defaultCity, soundEnabled, updateSetting, resetSettings } = useSettings();

  function handleOptionChange(key, value) {
    updateSetting(key, value);
    if (key === 'soundEnabled' ? value : soundEnabled) {
      playTelemetryClick(true);
    }
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

      <div className="settings-card">
        {/* Measurement Units */}
        <div className="settings-group">
          <label className="settings-label">Measurement Units</label>
          <p className="settings-desc">Choose between Metric (°C, km/h) and Imperial (°F, mph) telemetry units.</p>
          <div className="settings-options">
            <button
              type="button"
              className={`settings-option-btn ${units === 'metric' ? 'settings-option-btn--active' : ''}`}
              onClick={() => handleOptionChange('units', 'metric')}
            >
              METRIC (°C, km/h)
            </button>
            <button
              type="button"
              className={`settings-option-btn ${units === 'imperial' ? 'settings-option-btn--active' : ''}`}
              onClick={() => handleOptionChange('units', 'imperial')}
            >
              IMPERIAL (°F, mph)
            </button>
          </div>
        </div>

        {/* Observatory Audio Synthesizer */}
        <div className="settings-group">
          <label className="settings-label">Web Audio Telemetry Feedback</label>
          <p className="settings-desc">Synthesize subtle observatory clicks and satellite pulse pings using Web Audio API.</p>
          <div className="settings-options">
            <button
              type="button"
              className={`settings-option-btn ${soundEnabled ? 'settings-option-btn--active' : ''}`}
              onClick={() => handleOptionChange('soundEnabled', true)}
            >
              🔊 AUDIO ON (SYNTHESIZED)
            </button>
            <button
              type="button"
              className={`settings-option-btn ${!soundEnabled ? 'settings-option-btn--active' : ''}`}
              onClick={() => handleOptionChange('soundEnabled', false)}
            >
              🔇 AUDIO MUTED
            </button>
          </div>
        </div>

        {/* Theme Mode Selector */}
        <div className="settings-group">
          <label className="settings-label">Observatory Theme Mode</label>
          <p className="settings-desc">Switch between Auto (adapts to solar sunrise/sunset), Night, or Day mode.</p>
          <div className="settings-options">
            <button
              type="button"
              className={`settings-option-btn ${theme === 'auto' ? 'settings-option-btn--active' : ''}`}
              onClick={() => handleOptionChange('theme', 'auto')}
            >
              ☀️ AUTO (SOLAR)
            </button>
            <button
              type="button"
              className={`settings-option-btn ${theme === 'night' ? 'settings-option-btn--active' : ''}`}
              onClick={() => handleOptionChange('theme', 'night')}
            >
              🌙 NIGHT (VOID)
            </button>
            <button
              type="button"
              className={`settings-option-btn ${theme === 'day' ? 'settings-option-btn--active' : ''}`}
              onClick={() => handleOptionChange('theme', 'day')}
            >
              📜 DAY (PARCHMENT)
            </button>
          </div>
        </div>

        {/* Data Refresh Cadence */}
        <div className="settings-group">
          <label className="settings-label">Telemetry Polling Cadence</label>
          <p className="settings-desc">Control network fetch frequency for public Earth API endpoints.</p>
          <div className="settings-options">
            <button
              type="button"
              className={`settings-option-btn ${refreshRate === 'live' ? 'settings-option-btn--active' : ''}`}
              onClick={() => handleOptionChange('refreshRate', 'live')}
            >
              ⚡ LIVE (5-10 min)
            </button>
            <button
              type="button"
              className={`settings-option-btn ${refreshRate === 'balanced' ? 'settings-option-btn--active' : ''}`}
              onClick={() => handleOptionChange('refreshRate', 'balanced')}
            >
              ⚖️ BALANCED (10-15 min)
            </button>
            <button
              type="button"
              className={`settings-option-btn ${refreshRate === 'battery-saver' ? 'settings-option-btn--active' : ''}`}
              onClick={() => handleOptionChange('refreshRate', 'battery-saver')}
            >
              🔋 SAVER (30 min)
            </button>
          </div>
        </div>

        {/* Default City Location */}
        <div className="settings-group">
          <label className="settings-label">Default Station Location</label>
          <p className="settings-desc">
            Currently using:{' '}
            <span style={{ color: 'var(--brass)', fontFamily: 'var(--font-mono)' }}>
              {defaultCity ? defaultCity.name : 'Browser Geolocation'}
            </span>
          </p>
          {defaultCity && (
            <button
              type="button"
              className="journal-btn"
              style={{ width: 'fit-content', marginTop: '8px' }}
              onClick={() => handleOptionChange('defaultCity', null)}
            >
              📍 Reset to Geolocation
            </button>
          )}
        </div>

        {/* Restore Defaults */}
        <div className="settings-group" style={{ paddingTop: '8px' }}>
          <button
            type="button"
            className="journal-btn journal-btn--danger"
            style={{ width: 'fit-content' }}
            onClick={() => {
              if (window.confirm('Reset all instrument settings to factory defaults?')) {
                resetSettings();
              }
            }}
          >
            🔄 RESTORE FACTORY DEFAULTS
          </button>
        </div>
      </div>
    </div>
  );
}
