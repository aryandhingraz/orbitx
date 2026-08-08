import '../styles/components/about.css';

export function About() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          About OrbitX
          <span className="page-title__tag">ORBITX-SPEC</span>
        </h1>
        <p className="page-subtitle">
          Observatory concept rationale, WebGL 3D architecture, & telemetry API attributions
        </p>
      </header>

      <article className="about-article">
        {/* Technical Architecture Highlight Box */}
        <div className="about-highlight-box">
          <p style={{ color: 'var(--brass)', fontWeight: 600, marginBottom: '6px' }}>
            🛸 PURE VANILLA WEBGL ENGINE & ISOLATED REACT COMPOSITION
          </p>
          <p>
            OrbitX isolates pure Vanilla JS WebGL manipulation inside the dedicated{' '}
            <code style={{ color: 'var(--verdigris)' }}>src/globe/globeEngine.js</code> module — zero React imports inside the engine! It manages Three.js scene graphs, 3D satellite orbit trails, procedural canvas textures, atmosphere shaders, drag-to-rotate controls, and clean WebGL context disposal (<code style={{ color: 'var(--verdigris)' }}>dispose()</code>) on unmount.
          </p>
        </div>

        <section>
          <h2 className="about-section-title">Observatory Aesthetic Rationale</h2>
          <p>
            OrbitX is designed as an antique observatory desk rebuilt with modern telemetry sensors — brass dials, hand-ruled concentric orbit rings, tabular typography, and a glowing WebGL Earth reporting real-time data from 9 keyless public APIs acrossrouted pages.
          </p>
          <p style={{ marginTop: '12px' }}>
            Unlike generic AI dashboards using flat neon cards, OrbitX uses a precise navy, brass, verdigris, and parchment palette borrowed from vintage chronometers and astronomical instruments.
          </p>
        </section>

        <section>
          <h2 className="about-section-title">Telemetry Data Sources & API Attribution</h2>
          <div className="about-api-grid">
            <div className="about-api-card">
              <span style={{ color: 'var(--brass)', fontWeight: 600 }}>Open-Meteo Weather API</span>
              <p style={{ marginTop: '4px', color: 'var(--parchment-dim)' }}>Current forecast, 7-day temperature trends, wind speed, pressure</p>
            </div>
            <div className="about-api-card">
              <span style={{ color: 'var(--brass)', fontWeight: 600 }}>Open-Meteo Air Quality API</span>
              <p style={{ marginTop: '4px', color: 'var(--parchment-dim)' }}>24-hour US & European AQI, PM2.5, PM10 pollutant counts</p>
            </div>
            <div className="about-api-card">
              <span style={{ color: 'var(--brass)', fontWeight: 600 }}>USGS Earthquakes Feed</span>
              <p style={{ marginTop: '4px', color: 'var(--parchment-dim)' }}>Real-time 24-hour seismic event GeoJSON summary feed</p>
            </div>
            <div className="about-api-card">
              <span style={{ color: 'var(--brass)', fontWeight: 600 }}>WhereTheISS Satellite API</span>
              <p style={{ marginTop: '4px', color: 'var(--parchment-dim)' }}>5-second live telemetry for International Space Station (NORAD 25544)</p>
            </div>
            <div className="about-api-card">
              <span style={{ color: 'var(--brass)', fontWeight: 600 }}>Sunrise-Sunset API</span>
              <p style={{ marginTop: '4px', color: 'var(--parchment-dim)' }}>Solar terminator calculation & local sunrise/sunset schedules</p>
            </div>
            <div className="about-api-card">
              <span style={{ color: 'var(--brass)', fontWeight: 600 }}>Open ER Forex API</span>
              <p style={{ marginTop: '4px', color: 'var(--parchment-dim)' }}>Global currency exchange rates (USD, EUR, GBP, JPY, INR)</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="about-section-title">Astronomical Telemetry Mathematics</h2>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Conway Synodic Lunar Algorithm:</strong> Computes current lunar age (0..29.53 days), synodic illumination percentage, and moon phase glyphs locally without external network dependencies.</li>
            <li><strong>Spherical Coordinate Transformations:</strong> Converts geodetic latitude & longitude into 360° ring rotation angles and 3D WebGL Cartesian vector coordinates (<code style={{ color: 'var(--brass)' }}>Vector3(x, y, z)</code>).</li>
            <li><strong>Web Audio Synthesizer:</strong> Pure Vanilla JS Web Audio API oscillators synthesizing observatory clicks and satellite pulse pings without audio assets.</li>
          </ul>
        </section>
      </article>
    </div>
  );
}
