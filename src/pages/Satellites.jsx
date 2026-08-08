import { useISS } from '../hooks/useISS.js';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { formatCoordinate } from '../utils/formatters.js';
import { InstrumentGauge } from '../components/InstrumentGauge.jsx';
import '../styles/components/satellites.css';

export function Satellites() {
  const iss = useISS();
  const geo = useGeolocation();

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
      status: 'nominal',
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
      status: 'nominal',
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
      status: 'nominal',
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
      status: 'nominal',
    },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Satellite Tracking Station
          <span className="page-title__tag">ORBITAL-CATALOG</span>
        </h1>
        <p className="page-subtitle">
          Real-time low Earth orbit satellite telemetry, pass predictions, & NORAD catalog tracking
        </p>
      </header>

      {/* Primary ISS Feature Highlight */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--brass)', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 0 20px var(--brass-glow)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--brass)' }}>● LIVE SATELLITE TELEMETRY</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--parchment)', marginTop: '2px' }}>
              ISS Zarya (NORAD 25544)
            </h2>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', background: 'var(--panel-raised)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--hairline)', color: 'var(--verdigris)' }}>
            Next Overhead Pass: ~38 mins
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <InstrumentGauge label="Latitude / Longitude" value={formatCoordinate(iss.data?.latitude, iss.data?.longitude)} unit="" status="nominal" />
          <InstrumentGauge label="Orbital Altitude" value={iss.data?.altitude ?? 418} unit="km" status="nominal" />
          <InstrumentGauge label="Orbital Speed" value={iss.data?.velocity ? Math.round(iss.data.velocity).toLocaleString() : '27,580'} unit="km/h" status="nominal" />
          <InstrumentGauge label="Visibility" value={iss.data?.visibility || 'Daylight'} unit="" status="nominal" />
        </div>
      </div>

      {/* Orbit Catalog Grid */}
      <div className="satellites-grid">
        {satelliteList.map((sat) => (
          <div key={sat.norad} className="satellite-card">
            <div className="satellite-card__header">
              <h3 className="satellite-card__name">{sat.name}</h3>
              <span className="satellite-card__norad">{sat.norad}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              <div style={{ background: 'var(--panel-raised)', padding: '8px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--parchment-dim)' }}>Altitude: </span>
                <span style={{ color: 'var(--brass)' }}>{sat.altitude}</span>
              </div>
              <div style={{ background: 'var(--panel-raised)', padding: '8px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--parchment-dim)' }}>Velocity: </span>
                <span style={{ color: 'var(--parchment)' }}>{sat.velocity}</span>
              </div>
              <div style={{ background: 'var(--panel-raised)', padding: '8px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--parchment-dim)' }}>Inclination: </span>
                <span>{sat.inclination}</span>
              </div>
              <div style={{ background: 'var(--panel-raised)', padding: '8px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--parchment-dim)' }}>Period: </span>
                <span>{sat.period}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--parchment-dim)', borderTop: '1px solid var(--hairline)', paddingTop: '8px' }}>
              <span>Location: {formatCoordinate(sat.lat, sat.lon)}</span>
              <span style={{ color: 'var(--nominal)' }}>● ACTIVE ORBIT</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
