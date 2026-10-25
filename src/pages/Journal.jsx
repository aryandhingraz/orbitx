import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/uiSlice.js';
import { ValidatedField } from '../components/ValidatedField.jsx';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useWeather } from '../hooks/useWeather.js';
import { useAirQuality } from '../hooks/useAirQuality.js';
import { useQuakes } from '../hooks/useQuakes.js';
import { useISS } from '../hooks/useISS.js';
import { useSunAndMoon } from '../hooks/useSunAndMoon.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatTemperature, formatCoordinate } from '../utils/formatters.js';
import { exportSnapshotAsImage } from '../utils/snapshotExport.js';
import { exportDataAsJSON, importDataFromJSON } from '../utils/jsonBackup.js';
import '../styles/components/journal.css';

const JOURNAL_KEY = 'orbitx-journal';

const TAG_OPTIONS = ['Climate Record', 'Seismic Alert', 'Solar Event', 'ISS Sighting', 'Animal Behavior Note'];

function validateNote(val) {
  if (!val || val.trim().length === 0) {
    return 'Observation note cannot be empty.';
  }
  if (val.trim().length < 3) {
    return 'Observation note must be at least 3 characters.';
  }
  return null;
}

export function Journal() {
  const dispatch = useDispatch();
  const { units } = useSettings();
  const geo = useGeolocation();
  const weather = useWeather(geo.data?.latitude, geo.data?.longitude);
  const airQuality = useAirQuality(geo.data?.latitude, geo.data?.longitude);
  const quakes = useQuakes();
  const iss = useISS();
  const sunMoon = useSunAndMoon(geo.data?.latitude, geo.data?.longitude);

  const [noteInput, setNoteInput] = useState('');
  const [forceNoteError, setForceNoteError] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Climate Record');
  const [activeFilter, setActiveFilter] = useState('All');
  const [confirmClear, setConfirmClear] = useState(false);

  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(JOURNAL_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
    } catch (e) {
      console.warn('Failed to persist journal entries', e);
    }
  }, [entries]);

  function handlePinCurrentSnapshot() {
    const error = validateNote(noteInput);
    if (error) {
      setForceNoteError(true);
      dispatch(showToast({ message: error, type: 'sale' }));
      return;
    }
    setForceNoteError(false);

    const newEntry = {
      id: Date.now(),
      timestamp: Date.now(),
      tag: selectedTag,
      note: noteInput.trim(),
      location: geo.data?.cityLabel || 'Local Observatory',
      coordinates: formatCoordinate(geo.data?.latitude, geo.data?.longitude),
      temp: formatTemperature(weather.data?.temperature, units),
      aqi: airQuality.data?.aqi ?? 25,
      quakes: quakes.data?.count ?? 0,
      issAltitude: iss.data?.altitude ?? 418,
      issSpeed: iss.data?.velocity ?? 27580,
      moonPhase: sunMoon.data?.moonPhase?.name || 'Full Moon',
    };

    setEntries((prev) => [newEntry, ...prev]);
    setNoteInput('');
    dispatch(showToast({ message: 'Journal observation log recorded successfully!', type: 'success' }));
  }

  function handleClearJournal() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    setEntries([]);
    setConfirmClear(false);
    dispatch(showToast({ message: 'All journal entries cleared.', type: 'info' }));
  }

  function handleDeleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    dispatch(showToast({ message: 'Journal entry removed.', type: 'info' }));
  }

  function handleJSONExport() {
    exportDataAsJSON(entries, `orbitx-journal-backup-${Date.now()}.json`);
    dispatch(showToast({ message: 'Journal backup exported as JSON.', type: 'success' }));
  }

  function handleJSONImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importDataFromJSON(file, (err, importedData) => {
      if (err || !Array.isArray(importedData)) {
        dispatch(showToast({ message: 'Invalid JSON journal backup file.', type: 'sale' }));
        return;
      }
      setEntries(importedData);
      dispatch(showToast({ message: `Successfully restored ${importedData.length} journal logs!`, type: 'success' }));
    });
  }

  const filteredEntries = entries.filter((e) => {
    if (activeFilter === 'All') return true;
    return e.tag === activeFilter;
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Personal Telemetry Journal
          <span className="page-title__tag">PERSISTED LEDGER</span>
        </h1>
        <p className="page-subtitle">
          Save a note about today's weather, air quality, or anything notable you want to remember — like a diary entry with real data attached.
        </p>
      </header>

      {/* Snapshot Pinning Card with Custom Notes (§5.2) */}
      <section className="data-widget-card" style={{ gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <span className="swatch-dot"></span>
            <span className="badge-promo">CREATE NEW JOURNAL ENTRY</span>
          </div>
          {selectedTag === 'Animal Behavior Note' && (
            <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-info)', fontStyle: 'italic' }}>
              ℹ️ Personal log only — no scientific link between animal behavior and earthquake prediction has been established (USGS).
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', color: 'var(--color-ink)', padding: '10px 16px', borderRadius: 'var(--radius-lg)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption-md)' }}
            >
              {TAG_OPTIONS.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            <div style={{ flex: 1, minWidth: '260px' }}>
              <ValidatedField
                value={noteInput}
                onChange={(e) => {
                  setNoteInput(e.target.value);
                  if (forceNoteError) setForceNoteError(false);
                }}
                validate={validateNote}
                forceShowError={forceNoteError}
                placeholder="Add your note (e.g. Unusual pressure drop, clear night sky, bright ISS pass)..."
                aria-label="Observation note input"
              />
            </div>

            <button type="button" className="btn-primary" onClick={handlePinCurrentSnapshot}>
              Save Today's Entry
            </button>
          </div>

          <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
            💡 Tag your entry so you can filter and find it later in your timeline.
          </span>
        </div>
      </section>

      {/* Filter Chips & Action Controls Bar */}
      <div className="journal-actions">
        <div className="tab-strip">
          <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', marginRight: '4px' }}>FILTER:</span>
          {['All', ...TAG_OPTIONS].map((tag) => (
            <button
              key={tag}
              type="button"
              className={`filter-chip ${activeFilter === tag ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          <button type="button" className="btn-secondary" onClick={handleJSONExport} disabled={entries.length === 0} style={{ height: '40px', padding: '0 16px', fontSize: 'var(--text-caption-md)' }}>
            💾 JSON EXPORT
          </button>
          <label className="btn-secondary" style={{ height: '40px', padding: '0 16px', fontSize: 'var(--text-caption-md)', cursor: 'pointer' }}>
            📂 RESTORE
            <input type="file" accept=".json" onChange={handleJSONImport} style={{ display: 'none' }} />
          </label>
          {entries.length > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClearJournal}
              style={{
                height: '40px',
                padding: '0 16px',
                fontSize: 'var(--text-caption-md)',
                color: confirmClear ? '#FFFFFF' : 'var(--color-sale)',
                backgroundColor: confirmClear ? 'var(--color-sale)' : 'transparent',
                borderColor: 'var(--color-sale)',
                transition: 'all 150ms ease',
              }}
            >
              {confirmClear ? '⚠️ TAP AGAIN TO CONFIRM CLEAR' : 'CLEAR ALL'}
            </button>
          )}
        </div>
      </div>

      {/* Timeline List or Designed Empty State */}
      {filteredEntries.length === 0 ? (
        <section className="data-widget-card" style={{ padding: 'var(--space-section) var(--space-xl)', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'var(--color-mute)', marginBottom: 'var(--space-md)' }}>
            📖
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', color: 'var(--color-ink)', textTransform: 'uppercase' }}>
            No Journal Entries Logged
          </h2>
          <p style={{ color: 'var(--color-mute)', maxWidth: '460px', marginTop: 'var(--space-xs)' }}>
            {activeFilter !== 'All'
              ? `No entry matches the "${activeFilter}" filter category.`
              : 'Save your first entry above to create a persistent diary record with real data attached.'}
          </p>
        </section>
      ) : (
        <div className="timeline-list">
          {filteredEntries.map((entry) => (
            <article key={entry.id} className="timeline-card">
              <div className="timeline-card__header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 className="timeline-card__title">Entry #{entry.id.toString().slice(-4)}</h2>
                    <span className="badge-promo">{entry.tag || 'Observation'}</span>
                  </div>
                  <span className="timeline-card__timestamp">
                    {new Date(entry.timestamp).toLocaleString()} • {entry.location} ({entry.coordinates})
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ height: '36px', padding: '0 12px', fontSize: 'var(--text-caption-sm)' }}
                    onClick={() => exportSnapshotAsImage(entry)}
                    title="Export snapshot as PNG image"
                  >
                    🖼️ EXPORT PNG
                  </button>
                  <button
                    type="button"
                    className="btn-icon-circular"
                    style={{ width: '36px', height: '36px', fontSize: '12px', color: 'var(--color-sale)' }}
                    onClick={() => handleDeleteEntry(entry.id)}
                    title="Delete log"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <p style={{ fontStyle: 'italic', fontSize: 'var(--text-body-md)', color: 'var(--color-ink)' }}>
                "{entry.note}"
              </p>

              <div className="timeline-card__data-grid">
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--color-mute)' }}>Temp: </span>
                  <span style={{ fontWeight: 600 }}>{entry.temp}</span>
                </div>
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--color-mute)' }}>Air Quality: </span>
                  <span style={{ color: 'var(--color-success-bright)', fontWeight: 600 }}>{entry.aqi} AQI</span>
                </div>
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--color-mute)' }}>Earthquakes: </span>
                  <span>{entry.quakes} events</span>
                </div>
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--color-mute)' }}>ISS Altitude: </span>
                  <span>{entry.issAltitude} km</span>
                </div>
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--color-mute)' }}>ISS Velocity: </span>
                  <span>{entry.issSpeed} km/h</span>
                </div>
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--color-mute)' }}>Moon Phase: </span>
                  <span>{entry.moonPhase}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
