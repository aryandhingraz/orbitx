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
    const newEntry = {
      id: Date.now(),
      timestamp: Date.now(),
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
  }

  function handleClearJournal() {
    if (window.confirm('Are you sure you want to clear all telemetry journal logs?')) {
      setEntries([]);
    }
  }

  function handleDeleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Telemetry Ledger
          <span className="page-title__tag">PERSISTED</span>
        </h1>
        <p className="page-subtitle">
          Pin timestamped planetary data snapshots, view historical logs, & export image records
        </p>
      </header>

      {/* Action Controls Bar (§4.4) */}
      <div className="journal-actions">
        <button type="button" className="journal-btn" onClick={handlePinCurrentSnapshot}>
          📌 PIN TELEMETRY SNAPSHOT
        </button>

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
          <p style={{ fontSize: '14px', marginTop: '6px' }}>Click "Pin Telemetry Snapshot" above to record current planetary data into localStorage.</p>
        </div>
      ) : (
        <div className="timeline-list">
          {entries.map((entry) => (
            <div key={entry.id} className="timeline-card">
              <div className="timeline-card__header">
                <div>
                  <h2 className="timeline-card__title">Snapshot #{entry.id.toString().slice(-4)}</h2>
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
                  <span style={{ color: 'var(--parchment-dim)' }}>Earthquakes (24h): </span>
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
