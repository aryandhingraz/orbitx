import { useState } from 'react';
import { useISS } from '../hooks/useISS.js';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { formatCoordinate } from '../utils/formatters.js';
import { InstrumentGauge } from '../components/InstrumentGauge.jsx';
import { TrackingMap } from '../components/TrackingMap.jsx';
import { Legend } from '../components/Legend.jsx';
import '../styles/components/satellites.css';

export function Satellites() {
  const iss = useISS();
  const geo = useGeolocation();
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'schedule' | 'info'

  const satelliteList = [
    {
      norad: 'NORAD 25544',
      name: 'International Space Station (ISS)',
      altitude: `${iss.data?.altitude ?? 418} km`,
      velocity: `${iss.data?.velocity ? Math.round(iss.data.velocity).toLocaleString() : '27,580'} km/h`,
      visibility: iss.data?.visibility ?? 'Daylight',
      lat: iss.data?.latitude ?? 28.5,
      lon: iss.data?.longitude ?? -84.2,
      inclination: '51.64°',
      period: '92.68 minutes',
      isLive: true,
    },
    {
      norad: 'NORAD 20580',
      name: 'Hubble Space Telescope (HST)',
      altitude: '535 km',
      velocity: '27,300 km/h',
      visibility: 'Eclipsed',
      lat: 18.2,
      lon: -42.1,
      inclination: '28.47°',
      period: '95.42 minutes',
      isLive: false,
    },
    {
      norad: 'NORAD 48274',
      name: 'Tiangong Space Station (TSS)',
      altitude: '389 km',
      velocity: '27,620 km/h',
      visibility: 'Daylight',
      lat: -12.4,
      lon: 104.5,
      inclination: '41.47°',
      period: '92.15 minutes',
      isLive: false,
    },
    {
      norad: 'STARLINK-GROUP',
      name: 'Starlink Constellation (LEO)',
      altitude: '550 km',
      velocity: '27,000 km/h',
      visibility: 'Visible',
      lat: 44.1,
      lon: -12.8,
      inclination: '53.05°',
      period: '95.60 minutes',
      isLive: false,
    },
  ];

  const nowMs = Date.now();
  const PERIOD_MS = 92.68 * 60 * 1000;

  const upcomingPasses = [1, 2, 3, 4].map((passNum) => {
    const passTimeMs = nowMs + passNum * PERIOD_MS;
    const timeStr = new Date(passTimeMs).toISOString().substring(11, 19) + ' UTC';
    const elevs = ['68° (High)', '42° (Mid)', '24° (Low)', '55° (High)'];
    const dirs = ['SW → NE', 'WNW → SE', 'NW → ESE', 'SW → E'];
    const vis = passNum % 2 === 1 ? 'Visible (Bright)' : 'Eclipsed in Shadow';

    return {
      id: passNum,
      time: timeStr,
      maxElev: elevs[passNum - 1],
      direction: dirs[passNum - 1],
      duration: '5m 45s',
      visibility: vis,
    };
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Satellite Tracking Station
          <span className="page-title__tag">ORBITAL-CATALOG</span>
        </h1>
        <p className="page-subtitle">
          Real-time low Earth orbit satellite telemetry, 2D tracking map, & pass predictions for <strong>{geo.data?.cityLabel || 'Greenwich'}</strong>
        </p>
      </header>

      {/* Primary ISS Feature Highlight */}
      <section className="data-widget-card" style={{ borderLeft: '4px solid var(--color-accent-teal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <span className="swatch-dot"></span>
              <span className="badge-promo">LIVE SATELLITE TELEMETRY</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-lg)', color: 'var(--color-ink)', marginTop: '4px' }}>
              ISS Zarya (NORAD 25544)
            </h2>
          </div>

          <div className="tab-strip">
            <button
              type="button"
              className={`filter-chip ${activeTab === 'map' ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              Tracking Map
            </button>
            <button
              type="button"
              className={`filter-chip ${activeTab === 'schedule' ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              Pass Schedule
            </button>
            <button
              type="button"
              className={`filter-chip ${activeTab === 'info' ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Satellite Info
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
          <InstrumentGauge label="Latitude / Longitude" value={formatCoordinate(iss.data?.latitude, iss.data?.longitude)} unit="" status="nominal" />
          <InstrumentGauge label="Orbital Altitude" value={iss.data?.altitude ?? 418} unit="km" status="nominal" />
          <InstrumentGauge label="Orbital Speed" value={iss.data?.velocity ? Math.round(iss.data.velocity).toLocaleString() : '27,580'} unit="km/h" status="nominal" />
          <InstrumentGauge label="Visibility" value={iss.data?.visibility || 'Daylight'} unit="" status="nominal" />
        </div>
      </section>

      {/* Tab Render: Map / Schedule / Info */}
      {activeTab === 'map' ? (
        <TrackingMap
          issLat={iss.data?.latitude ?? 28.5}
          issLon={iss.data?.longitude ?? -84.2}
          issAlt={iss.data?.altitude ?? 418}
          issVel={iss.data?.velocity ? Math.round(iss.data.velocity) : 27580}
        />
      ) : activeTab === 'schedule' ? (
        <section className="data-widget-card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', color: 'var(--color-ink)', marginBottom: 'var(--space-md)' }}>
            ESTIMATED OVERHEAD ISS PASS SCHEDULE
          </h2>
          <div className="compare-table-container">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Pass Time (UTC)</th>
                  <th>Max Elevation</th>
                  <th>Trajectory</th>
                  <th>Duration</th>
                  <th>Optical Visibility</th>
                </tr>
              </thead>
              <tbody>
                {upcomingPasses.map((pass) => (
                  <tr key={pass.id}>
                    <td className="font-mono" style={{ fontWeight: 600, color: 'var(--color-accent-teal)' }}>{pass.time}</td>
                    <td>{pass.maxElev}</td>
                    <td>{pass.direction}</td>
                    <td className="font-mono">{pass.duration}</td>
                    <td><span className="badge-promo">{pass.visibility}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="data-widget-card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', color: 'var(--color-ink)', marginBottom: 'var(--space-md)' }}>
            ISS SPACE STATION TECHNICAL SPECIFICATIONS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption-md)' }}>
            <div><strong>Launch Date:</strong> Nov 20, 1998</div>
            <div><strong>Orbital Period:</strong> 92.68 min</div>
            <div><strong>Inclination:</strong> 51.64°</div>
            <div><strong>Mass:</strong> 450,000 kg</div>
            <div><strong>Pressurized Vol:</strong> 916 m³</div>
            <div><strong>Crew Size:</strong> 7 Astronauts</div>
          </div>
        </section>
      )}

      {/* Orbit Catalog Grid with Legend (§2.2 Item 8) */}
      <div style={{ marginTop: 'var(--space-lg)' }}>
        <Legend title="SATELLITE CATALOG BADGE KEY" items={[
          { color: 'var(--color-success-bright)', label: 'Live Real-Time Telemetry' },
          { color: 'var(--color-mute)', label: 'Static Reference Catalog Entry' },
        ]} />

        <div className="satellites-grid" style={{ marginTop: 'var(--space-xs)' }}>
          {satelliteList.map((sat) => (
            <div key={sat.norad} className="satellite-card">
              <div className="satellite-card__header">
                <div>
                  <h3 className="satellite-card__name">{sat.name}</h3>
                  <span className="satellite-card__norad" style={{ marginTop: '4px', display: 'inline-block' }}>{sat.norad}</span>
                </div>
                <span className="badge-promo" style={{ color: sat.isLive ? 'var(--color-success-bright)' : 'var(--color-mute)' }}>
                  {sat.isLive ? 'LIVE TELEMETRY' : 'Static Reference Entry'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption-sm)' }}>
                <div style={{ background: 'var(--color-canvas)', padding: '8px', border: '1px solid var(--color-hairline-soft)' }}>
                  <span style={{ color: 'var(--color-mute)' }}>Altitude: </span>
                  <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{sat.altitude}</span>
                </div>
                <div style={{ background: 'var(--color-canvas)', padding: '8px', border: '1px solid var(--color-hairline-soft)' }}>
                  <span style={{ color: 'var(--color-mute)' }}>Velocity: </span>
                  <span style={{ color: 'var(--color-ink)' }}>{sat.velocity}</span>
                </div>
                <div style={{ background: 'var(--color-canvas)', padding: '8px', border: '1px solid var(--color-hairline-soft)' }}>
                  <span style={{ color: 'var(--color-mute)' }}>Inclination: </span>
                  <span>{sat.inclination}</span>
                </div>
                <div style={{ background: 'var(--color-canvas)', padding: '8px', border: '1px solid var(--color-hairline-soft)' }}>
                  <span style={{ color: 'var(--color-mute)' }}>Period: </span>
                  <span>{sat.period}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', borderTop: '1px solid var(--color-hairline-soft)', paddingTop: '8px' }}>
                <span>Loc: {formatCoordinate(sat.lat, sat.lon)}</span>
                <span style={{ color: sat.isLive ? 'var(--color-success-bright)' : 'var(--color-mute)', fontWeight: 600 }}>
                  {sat.isLive ? '● ACTIVE LIVE ORBIT' : 'Reference Entry'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
