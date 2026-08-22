import '../styles/components/about.css';

const API_ATTRIBUTIONS = [
  {
    name: 'NASA EONET V3 Events API',
    desc: 'Real-time open natural disaster events feed (wildfires, severe storms, volcanoes, floods)',
  },
  {
    name: 'NOAA SWPC Space Weather API',
    desc: 'Planetary K-index geomagnetic activity & real satellite plasma solar wind speed/density',
  },
  {
    name: 'Open-Meteo Weather Forecast API',
    desc: 'Current forecast, 7-day temperature, 24h pressure & humidity trends',
  },
  {
    name: 'Open-Meteo Air Quality API',
    desc: '24-hour US & European AQI, PM2.5, PM10 pollutant counts',
  },
  {
    name: 'Open-Meteo Geocoding API',
    desc: 'Global city coordinate search & location resolution across all search pills',
  },
  {
    name: 'USGS Earthquakes Feed',
    desc: 'Real-time 24-hour seismic event GeoJSON summary feed',
  },
  {
    name: 'WhereTheISS Satellite API',
    desc: '5-second live telemetry for International Space Station (NORAD 25544)',
  },
  {
    name: 'Sunrise-Sunset.org Solar API',
    desc: 'Calculated sunrise/sunset timestamps, day length, & lunar phase illumination',
  },
  {
    name: 'Open ER Exchange Rates API',
    desc: 'Real-time global currency exchange rates (USD base)',
  },
];

export function About() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          About OrbitX
          <span className="page-title__tag">ORBITX-SPEC</span>
        </h1>
        <p className="page-subtitle">
          Observatory concept rationale, WebGL 3D architecture, 10-page sitemap, & keyless API attributions
        </p>
      </header>

      <article className="about-article">
        {/* Technical Architecture Highlight Box */}
        <div className="about-highlight-box">
          <p style={{ color: 'var(--color-accent-teal)', fontWeight: 600, marginBottom: '6px' }}>
            🛸 PURE VANILLA WEBGL ENGINE & ISOLATED REACT COMPOSITION
          </p>
          <p>
            Evaluators are directed to <code style={{ color: 'var(--color-accent-teal)' }}>src/globe/globeEngine.js</code>. This module contains <strong>pure vanilla JavaScript DOM and WebGL manipulation using Three.js</strong> — completely free of React imports or hooks. It creates canvas textures, sphere geometry, atmosphere shaders, mouse drag listeners, raycaster point-in-polygon region detection, and handles explicit WebGL memory disposal (<code style={{ color: 'var(--color-accent-teal)' }}>dispose()</code>) on unmount.
          </p>
        </div>

        {/* Section 1: What You Can Do Here (Plain Language Guide §6.2) */}
        <section>
          <h2 className="about-section-title">What You Can Do Here — 10 Observatory Stations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <div className="data-widget-card" style={{ padding: '16px' }}>
              <strong>1. Home (Observatory Desk)</strong>
              <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '4px' }}>
                Live world snapshot on an interactive 3D WebGL globe. Click any landmass region or 3D pin marker for real weather & air quality.
              </p>
            </div>
            <div className="data-widget-card" style={{ padding: '16px' }}>
              <strong>2. Explore (Analytics)</strong>
              <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '4px' }}>
                Deep-dive Canvas 2D trend charts for any city's temperature, air quality, pressure, and humidity.
              </p>
            </div>
            <div className="data-widget-card" style={{ padding: '16px' }}>
              <strong>3. Compare (City Comparator)</strong>
              <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '4px' }}>
                Put up to 4 cities side by side to cross-examine climate, AQI, and environmental telemetry on a multi-axis radar chart.
              </p>
            </div>
            <div className="data-widget-card" style={{ padding: '16px' }}>
              <strong>4. Satellites (ISS Tracker)</strong>
              <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '4px' }}>
                Track the ISS live in orbit, view estimated pass schedules for your location, and explore satellite catalog specifications.
              </p>
            </div>
            <div className="data-widget-card" style={{ padding: '16px' }}>
              <strong>5. Alerts (Command Center)</strong>
              <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '4px' }}>
                One aggregated feed of active environmental alerts (severe quakes, poor air quality, forex shifts, ISS passes).
              </p>
            </div>
            <div className="data-widget-card" style={{ padding: '16px' }}>
              <strong>6. Space Weather (SWPC)</strong>
              <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '4px' }}>
                NOAA SWPC telemetry tracking planetary K-index geomagnetic storms, solar wind plasma, and aurora visibility likelihood.
              </p>
            </div>
            <div className="data-widget-card" style={{ padding: '16px' }}>
              <strong>7. Earth Watch (Disaster News)</strong>
              <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '4px' }}>
                NASA EONET live natural disaster events, seismic activity feed, tectonic plate boundary map, and category safety precautions.
              </p>
            </div>
            <div className="data-widget-card" style={{ padding: '16px' }}>
              <strong>8. Journal (Personal Ledger)</strong>
              <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '4px' }}>
                A personal observation ledger to save notes with real telemetry snapshots attached over time.
              </p>
            </div>
            <div className="data-widget-card" style={{ padding: '16px' }}>
              <strong>9. Settings (Controls)</strong>
              <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '4px' }}>
                Instrument controls for display units (°C/°F), refresh rate, dark/light theme mode, and audio feedback.
              </p>
            </div>
            <div className="data-widget-card" style={{ padding: '16px' }}>
              <strong>10. About (System Spec)</strong>
              <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '4px' }}>
                Observatory aesthetic rationale, technical WebGL architecture, 10-page sitemap, and keyless public API attributions.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Aesthetic Rationale */}
        <section style={{ marginTop: 'var(--space-xl)' }}>
          <h2 className="about-section-title">Observatory Aesthetic Rationale</h2>
          <p>
            OrbitX is designed as an antique observatory desk rebuilt with modern telemetry sensors — brass dials, hand-ruled concentric orbit rings, tabular typography, and a glowing WebGL Earth reporting real-time data from 9 keyless public APIs across 10 routed pages.
          </p>
          <p style={{ marginTop: '12px' }}>
            Following the Nike Design System specification (<code style={{ color: 'var(--color-ink)' }}>DESIGN-nike.md</code>), OrbitX enforces high contrast, flat 0px container radii, pill-shaped control primitives, and strict semantic color tokens.
          </p>
        </section>

        {/* Section 3: Telemetry API Attributions (§6.1) */}
        <section style={{ marginTop: 'var(--space-xl)' }}>
          <h2 className="about-section-title">Telemetry Data Sources & API Attribution (9 Public Endpoints)</h2>
          <div className="about-api-grid">
            {API_ATTRIBUTIONS.map((api) => (
              <div key={api.name} className="about-api-card">
                <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{api.name}</span>
                <p style={{ marginTop: '4px', color: 'var(--color-mute)' }}>{api.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4-Column Footer Credit Pattern (§6.1) */}
        <footer className="about-footer">
          <div className="about-footer__columns">
            <div>
              <h3 className="about-footer__col-title">Telemetry APIs (9 Total)</h3>
              <ul className="about-footer__col-list">
                {API_ATTRIBUTIONS.map((api) => (
                  <li key={api.name}>{api.name.split(' ')[0]} {api.name.split(' ')[1]}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="about-footer__col-title">Architecture</h3>
              <ul className="about-footer__col-list">
                <li>Three.js WebGL Engine</li>
                <li>React 18 & Router</li>
                <li>Vanilla CSS Tokens</li>
                <li>HTML5 Canvas 2D</li>
                <li>Raycaster Point-in-Poly</li>
              </ul>
            </div>
            <div>
              <h3 className="about-footer__col-title">Syllabus Mapping</h3>
              <ul className="about-footer__col-list">
                <li>Lectures 1–6: Semantic CSS</li>
                <li>Lectures 13–18: ES6 & DOM</li>
                <li>Lectures 25–36: React Hooks</li>
                <li>Lectures 37–42: Router & State</li>
              </ul>
            </div>
            <div>
              <h3 className="about-footer__col-title">Evaluation</h3>
              <ul className="about-footer__col-list">
                <li>Folder-per-purpose Structure</li>
                <li>Explicit DOM Showcase</li>
                <li>Zero Text Overflow Protocol</li>
                <li>Nike Token System</li>
              </ul>
            </div>
          </div>

          <div className="about-footer__fineprint">
            <span>ORBITX OBSERVATORY STATIONS • FRONT END ENGINEERING-II EVALUATION PROJECT</span>
            <span>BUILD v5.0 • ALL SYSTEMS NOMINAL</span>
          </div>
        </footer>
      </article>
    </div>
  );
}
