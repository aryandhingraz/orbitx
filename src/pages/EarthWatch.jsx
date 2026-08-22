import { useState, useEffect } from 'react';
import { useNaturalEvents } from '../hooks/useNaturalEvents.js';
import { useQuakes } from '../hooks/useQuakes.js';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useWeather } from '../hooks/useWeather.js';
import { useSpaceWeather } from '../hooks/useSpaceWeather.js';
import { PlateBoundaryMap } from '../components/PlateBoundaryMap.jsx';
import { Legend } from '../components/Legend.jsx';
import { DataPanel } from '../components/DataPanel.jsx';
import { getPrecautionsForCategory } from '../utils/disasterPrecautions.js';
import { formatCoordinate, formatTemperature } from '../utils/formatters.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useNavigate } from 'react-router-dom';

const JOURNAL_KEY = 'orbitx-journal';

export function EarthWatch() {
  const { units } = useSettings();
  const navigate = useNavigate();
  const geo = useGeolocation();

  const naturalEvents = useNaturalEvents();
  const quakes = useQuakes();
  const weather = useWeather(geo.data?.latitude, geo.data?.longitude);
  const spaceWeather = useSpaceWeather();

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [fieldNotes, setFieldNotes] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(JOURNAL_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const animalNotes = parsed.filter((e) => e.tag === 'Animal Behavior Note');
        setFieldNotes(animalNotes);
      }
    } catch {
      // ignore
    }
  }, []);

  const eventsList = naturalEvents.data?.events || [];
  const quakesList = quakes.data?.quakes || [];

  const filteredEvents = eventsList.filter((e) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Wildfires') return e.category.toLowerCase().includes('fire');
    if (activeCategory === 'Storms') return e.category.toLowerCase().includes('storm');
    if (activeCategory === 'Volcanoes') return e.category.toLowerCase().includes('volcano');
    return true;
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Earth Watch & Disaster News
          <span className="page-title__tag">NASA EONET & USGS</span>
        </h1>
        <p className="page-subtitle">
          Real-time global natural event tracker, seismic activity feed, tectonic plate boundary overlay, & science-based outlook
        </p>
      </header>

      {/* Campaign Banner Header */}
      <section className="campaign-tile" style={{ padding: 'var(--space-xl)', border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-soft-cloud)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <span className="swatch-dot" style={{ backgroundColor: 'var(--color-sale)' }}></span>
              <span className="badge-promo">EARTH OBSERVATORY MONITOR</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-xl)', color: 'var(--color-ink)', marginTop: '4px', textTransform: 'uppercase' }}>
              🌎 {eventsList.length} ACTIVE NATURAL EVENTS & {quakesList.length} 24H SEISMIC EVENTS
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
            <span className="badge-promo">NASA EONET V3</span>
            <span className="badge-promo">USGS GEOJSON</span>
          </div>
        </div>

        {/* EONET Event Category Legend */}
        <Legend title="NATURAL EVENT CATEGORY KEY" items={[
          { color: 'var(--color-sale)', label: 'Wildfires & Volcanic Eruptions' },
          { color: 'var(--color-info)', label: 'Severe Storms & Coastal Flooding' },
          { color: 'var(--color-accent-teal)', label: 'Ice Anomalies & Environmental Events' },
        ]} />

        {/* Category Filter Chips */}
        <div className="tab-strip" style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-hairline-soft)' }}>
          {['All', 'Wildfires', 'Storms', 'Volcanoes'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-chip ${activeCategory === cat ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3.1 NASA EONET Live Natural Events Feed */}
      <section className="data-widget-card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', color: 'var(--color-ink)', marginBottom: 'var(--space-md)' }}>
          NASA EONET LIVE NATURAL DISASTER EVENTS FEED (CLICK EVENT FOR PRECAUTIONS)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ padding: 'var(--space-md)', color: 'var(--color-mute)' }}>No active natural events matching this category.</div>
          ) : (
            filteredEvents.slice(0, 10).map((ev) => {
              const isFire = ev.category.toLowerCase().includes('fire');
              const isStorm = ev.category.toLowerCase().includes('storm');
              const isVolcano = ev.category.toLowerCase().includes('volcano');
              const badgeColor = isFire || isVolcano ? 'var(--color-sale)' : isStorm ? 'var(--color-info)' : 'var(--color-accent-teal)';

              const activeDays = Math.max(1, Math.floor((Date.now() - new Date(ev.date).getTime()) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={ev.id}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--color-hairline-soft)', background: 'var(--color-canvas)', flexWrap: 'wrap', gap: '8px', cursor: 'pointer' }}
                  onClick={() => setSelectedEvent({ kind: 'eonet', ...ev })}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="swatch-dot" style={{ backgroundColor: badgeColor }}></span>
                      <span className="badge-promo" style={{ color: badgeColor, borderColor: badgeColor }}>{ev.category.toUpperCase()}</span>
                      <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', fontFamily: 'var(--font-mono)' }}>Active {activeDays} days</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-body-md)', color: 'var(--color-ink)' }}>{ev.title}</h3>
                    <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>Location: {formatCoordinate(ev.lat, ev.lon)}</span>
                  </div>

                  <button type="button" className="btn-secondary" style={{ height: '32px', padding: '0 12px', fontSize: 'var(--text-caption-sm)' }}>
                    Safety Guidance →
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 3.3 Tectonic Plate Boundaries & Quake Overlay with Legend */}
      <div>
        <PlateBoundaryMap quakes={quakesList} />
        <Legend title="PLATE BOUNDARY & SEISMIC MAGNITUDE KEY" items={[
          { color: 'var(--color-accent-teal)', label: 'Tectonic Plate Boundaries (Dashed Lines)' },
          { color: 'var(--color-sale)', label: 'Mag ≥ 5.0 Severe Quake' },
          { color: 'var(--color-info)', label: 'Mag 4.0 - 4.9 Moderate Quake' },
          { color: 'var(--color-success-bright)', label: 'Mag < 4.0 Light Quake' },
        ]} />
      </div>

      {/* Near-Term Outlook Panel */}
      <section className="data-widget-card" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
        <div>
          <span className="badge-promo">SCIENCE-BASED ENVIRONMENTAL OUTLOOK</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-lg)', color: 'var(--color-ink)', marginTop: '4px' }}>
            3-Day Atmospheric & Geomagnetic Outlook
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
          <div style={{ background: 'var(--color-canvas)', padding: '16px', border: '1px solid var(--color-hairline-soft)' }}>
            <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', textTransform: 'uppercase' }}>Local Temperature Outlook</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-heading-md)', fontWeight: 700, color: 'var(--color-accent-teal)', marginTop: '4px' }}>
              {formatTemperature(weather.data?.temperature, units)}
            </div>
            <p style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', marginTop: '4px' }}>
              {weather.data?.daily?.length ? `High ${weather.data.daily[0].maxTemp}° / Low ${weather.data.daily[0].minTemp}°` : 'Nominal atmospheric profile'}
            </p>
          </div>

          <div style={{ background: 'var(--color-canvas)', padding: '16px', border: '1px solid var(--color-hairline-soft)' }}>
            <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', textTransform: 'uppercase' }}>Geomagnetic Activity</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-heading-md)', fontWeight: 700, color: spaceWeather.data?.kpStatus === 'alert' ? 'var(--color-sale)' : 'var(--color-success-bright)', marginTop: '4px' }}>
              Kp {spaceWeather.data?.kpIndex ?? 2} (SWPC)
            </div>
            <p style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', marginTop: '4px' }}>
              Aurora Likelihood: {spaceWeather.data?.auroraLikelihood || 'Low'}
            </p>
          </div>
        </div>

        {/* Permanent Science Disclaimer Notice */}
        <div style={{ padding: '12px 16px', background: 'var(--color-soft-cloud)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-none)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>ℹ️</span>
          <span style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-ink)' }}>
            <strong>Scientific Notice:</strong> Earthquake prediction is not possible with current science — this outlook covers weather and space weather only (USGS).
          </span>
        </div>
      </section>

      {/* Personal Field Notes Preview Card */}
      <section className="data-widget-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <div>
            <span className="badge-promo">OBSERVER FIELD NOTES (ANECDOTAL LOG)</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', color: 'var(--color-ink)', marginTop: '4px' }}>
              Personal Observation Journal
            </h2>
          </div>
          <button type="button" className="btn-secondary" style={{ height: '36px', padding: '0 16px' }} onClick={() => navigate('/journal')}>
            Open Full Ledger →
          </button>
        </div>

        {fieldNotes.length === 0 ? (
          <p style={{ color: 'var(--color-mute)', marginTop: 'var(--space-sm)' }}>
            No personal animal behavior notes logged yet. Log notes in your <strong style={{ color: 'var(--color-ink)' }}>Journal</strong> under the "Animal Behavior Note" tag.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'var(--space-md)' }}>
            {fieldNotes.slice(0, 3).map((note) => (
              <div key={note.id} style={{ background: 'var(--color-canvas)', padding: '12px 16px', border: '1px solid var(--color-hairline-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', marginBottom: '4px' }}>
                  <span>{new Date(note.timestamp).toLocaleDateString()} • {note.location}</span>
                  <span className="badge-promo">{note.tag}</span>
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--color-ink)' }}>"{note.note}"</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Event Details & Safety Precautions Side Dialog (§4) */}
      {selectedEvent && (
        <DataPanel
          isOpen={true}
          title={`Disaster Event — ${selectedEvent.title || 'Event Details'}`}
          onClose={() => setSelectedEvent(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="data-widget-card" style={{ borderLeft: '4px solid var(--color-sale)' }}>
              <span className="instrument-gauge__label">Category & Location</span>
              <span className="instrument-gauge__value" style={{ color: 'var(--color-sale)' }}>
                {selectedEvent.category?.toUpperCase() || 'NATURAL EVENT'}
              </span>
              <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
                Coordinates: {formatCoordinate(selectedEvent.lat, selectedEvent.lon)}
              </span>
            </div>

            <div className="data-widget-card">
              <span className="instrument-gauge__label">Event Title & Source</span>
              <p style={{ fontWeight: 600, color: 'var(--color-ink)', margin: '4px 0' }}>{selectedEvent.title}</p>
              {selectedEvent.link && (
                <a
                  href={selectedEvent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textAlign: 'center', marginTop: '8px' }}
                >
                  Official NASA EONET Report ↗
                </a>
              )}
            </div>

            {/* Public Safety Precautions Section (§4) */}
            <div className="data-widget-card" style={{ background: 'var(--color-canvas)' }}>
              <span className="badge-promo" style={{ color: 'var(--color-sale)', borderColor: 'var(--color-sale)' }}>
                🛡️ PUBLIC SAFETY PRECAUTIONS
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', color: 'var(--color-ink)', marginTop: '4px' }}>
                Recommended Action Guidance
              </h3>

              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--text-caption-md)', color: 'var(--color-ink)' }}>
                {getPrecautionsForCategory(selectedEvent.category || '').map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <p style={{ fontSize: '11px', color: 'var(--color-mute)', fontStyle: 'italic', marginTop: '8px', borderTop: '1px solid var(--color-hairline-soft)', paddingTop: '6px' }}>
                General preparedness guidance — always follow official instructions from local emergency authorities in an actual event.
              </p>
            </div>
          </div>
        </DataPanel>
      )}
    </div>
  );
}
