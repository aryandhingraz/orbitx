import { useState, useEffect } from 'react';
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
import { playTelemetryClick } from '../utils/soundSynthesizer.js';
import '../styles/components/journal.css';

const JOURNAL_KEY = 'orbitx-journal';

export function Journal() {
  const { units } = useSettings();
  const geo = useGeolocation();
  const weather = useWeather(geo.data?.latitude, geo.data?.longitude);
  const airQuality = useAirQuality(geo.data?.latitude, geo.data?.longitude);
  const quakes = useQuakes();
  const iss = useISS();
  const sunMoon = useSunAndMoon(geo.data?.latitude, geo.data?.longitude);

  const [noteInput, setNoteInput] = useState('');
  const [selectedTag, setSelectedTag] = useState('Climate Record');

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
    playTelemetryClick(true);
    const newEntry = {
      id: Date.now(),
      timestamp: Date.now(),
      tag: selectedTag,
      note: noteInput.trim() || 'Routine planetary observation log',
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
  }

  function handleClearJournal() {
    if (window.confirm('Are you sure you want to clear all telemetry journal logs?')) {
      setEntries([]);
    }
  }

  function handleDeleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleJSONExport() {
    exportDataAsJSON(entries, `orbitx-journal-backup-${Date.now()}.json`);
  }

  function handleJSONImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importDataFromJSON(file, (err, importedData) => {
      if (err || !Array.isArray(importedData)) {
        alert('Invalid JSON journal backup file.');
        return;
      }
      setEntries(importedData);
      alert(`Successfully restored ${importedData.length} journal logs!`);
    });
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Telemetry Ledger
          <span className="page-title__tag">PERSISTED</span>
        </h1>
        <p className="page-subtitle">
          Pin timestamped telemetry snapshots with notes, filter logs, & export image/JSON records
        </p>
      </header>

      {/* Snapshot Pinning Card with Custom Notes (§4.4) */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--hairline)', padding: '1.25rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--brass)', textTransform: 'uppercase' }}>
          📌 Pin New Telemetry Observation
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            style={{ background: 'var(--panel-raised)', border: '1px solid var(--hairline)', color: 'var(--brass)', padding: '8px 12px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
          >
            <option value="Climate Record">Climate Record</option>
            <option value="Seismic Alert">Seismic Alert</option>
            <option value="Solar Event">Solar Event</option>
            <option value="Orbital Pass">Orbital Pass</option>
          </select>
          <input
            type="text"
            placeholder="Add observer notes (e.g. Unusual pressure drop, bright ISS overhead pass)..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            style={{ flex: 1, minWidth: '240px', background: 'var(--panel-raised)', border: '1px solid var(--hairline)', padding: '8px 12px', borderRadius: '6px', color: 'var(--parchment)', fontSize: '14px' }}
          />
          <button type="button" className="journal-btn" onClick={handlePinCurrentSnapshot}>
            PIN TELEMETRY SNAPSHOT
          </button>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="journal-actions">
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="journal-btn" onClick={handleJSONExport} disabled={entries.length === 0}>
            💾 EXPORT JSON BACKUP
          </button>
          <label className="journal-btn" style={{ cursor: 'pointer' }}>
            📂 RESTORE JSON
            <input type="file" accept=".json" onChange={handleJSONImport} style={{ display: 'none' }} />
          </label>
        </div>

        {entries.length > 0 && (
          <button type="button" className="journal-btn journal-btn--danger" onClick={handleClearJournal}>
            🗑️ CLEAR JOURNAL
          </button>
        )}
      </div>

      {/* Timeline List */}
      {entries.length === 0 ? (
        <div style={{ background: 'var(--panel)', border: '1px dashed var(--hairline)', padding: '3rem', borderRadius: '10px', textAlign: 'center', color: 'var(--parchment-dim)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--brass)' }}>No Telemetry Logged Yet</p>
          <p style={{ fontSize: '14px', marginTop: '6px' }}>Pin an observation above to save telemetry snapshots into persistent localStorage.</p>
        </div>
      ) : (
        <div className="timeline-list">
          {entries.map((entry) => (
            <div key={entry.id} className="timeline-card">
              <div className="timeline-card__header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 className="timeline-card__title">Snapshot #{entry.id.toString().slice(-4)}</h2>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'var(--panel-raised)', color: 'var(--verdigris)', border: '1px solid var(--hairline)', padding: '2px 6px', borderRadius: '4px' }}>
                      {entry.tag || 'Observation'}
                    </span>
                  </div>
                  <span className="timeline-card__timestamp">
                    {new Date(entry.timestamp).toLocaleString()} • {entry.location} ({entry.coordinates})
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="journal-btn"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                    onClick={() => exportSnapshotAsImage(entry)}
                    title="Export snapshot as PNG image"
                  >
                    🖼️ EXPORT PNG
                  </button>
                  <button
                    type="button"
                    style={{ color: 'var(--signal)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    onClick={() => handleDeleteEntry(entry.id)}
                    title="Delete log"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <p style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--parchment)' }}>
                "{entry.note}"
              </p>

              <div className="timeline-card__data-grid">
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--parchment-dim)' }}>Temp: </span>
                  <span style={{ color: 'var(--brass)' }}>{entry.temp}</span>
                </div>
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--parchment-dim)' }}>Air Quality: </span>
                  <span style={{ color: 'var(--verdigris)' }}>{entry.aqi} AQI</span>
                </div>
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--parchment-dim)' }}>Earthquakes: </span>
                  <span>{entry.quakes} events</span>
                </div>
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--parchment-dim)' }}>ISS Altitude: </span>
                  <span>{entry.issAltitude} km</span>
                </div>
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--parchment-dim)' }}>ISS Velocity: </span>
                  <span>{entry.issSpeed} km/h</span>
                </div>
                <div className="timeline-card__data-item">
                  <span style={{ color: 'var(--parchment-dim)' }}>Moon Phase: </span>
                  <span>{entry.moonPhase}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
