import '../styles/components/about.css';

const SYLLABUS_MODULES = [
  {
    lectures: 'Lectures 1–12',
    phase: 'Foundations & Tooling',
    title: 'HTML5 Semantic Layouts, Modern CSS3 & JavaScript Core',
    topics: [
      'HTML5 semantic structure, landmark elements, and accessibility (WCAG AA).',
      'CSS3 layout mechanics: Box model, Flexbox, CSS Grid, custom properties, and mobile-first responsive media queries.',
      'JavaScript fundamentals: Data structures, modular scopes, dev tools workflow, Git version control, and production builds.',
    ],
    orbitxImpl: 'Implemented across index.html, layout.css, design token hierarchy, and zero external CSS dependencies.',
  },
  {
    lectures: 'Lectures 13–24',
    phase: 'Modern JavaScript & React Core',
    title: 'ES6+ Architecture, Controlled Components & React Setup',
    topics: [
      'ES6+ language standards: Promises, async/await, modules, destructuring, and spread/rest operators.',
      'Browser storage APIs (localStorage, sessionStorage) and JSON serialization.',
      'React component-based architecture, JSX syntax, controlled form inputs, and event handling via Vite.',
    ],
    orbitxImpl: 'Implemented in custom JSON backup utilities, Vite build configuration, and reactive form controls.',
  },
  {
    lectures: 'Lectures 25–36',
    phase: 'Hooks & Composition',
    title: 'Component Composition, Custom Hooks & Reactive Telemetry',
    topics: [
      'Component lifecycle and unidirectional state flow with props and conditional rendering.',
      'React Hooks: useState, useEffect, useRef, useMemo, and useCallback optimization.',
      'Custom hook architecture: Encapsulating complex asynchronous side effects and telemetry streams.',
    ],
    orbitxImpl: 'Implemented in 10 custom hooks (useWeather, useAirQuality, useISS, useQuakes, useSpaceWeather, useSunAndMoon, etc.).',
  },
  {
    lectures: 'Lectures 37–48 (PBE-I)',
    phase: 'Routing & Navigation Layout',
    title: 'React Router v6, Dynamic Routing, Nested Routes & Protected Gates',
    topics: [
      'Multi-page Single Page Application (SPA) architecture with persistent navigation shells.',
      'Nested routes with <Outlet /> layout for hierarchical deep navigation.',
      'Dynamic route parameters (:citySlug) with programmatic navigation and state resolution.',
      'Protected Route architecture enforcing client-side authorization gates.',
      'Designed 404 catch-all route with contextual recovery navigation.',
    ],
    orbitxImpl: 'Implemented in router.jsx, Satellites.jsx (<Outlet />), Explore.jsx (useParams), ProtectedRoute.jsx, and NotFound.jsx.',
  },
  {
    lectures: 'Lectures 49–54',
    phase: 'State Architecture',
    title: 'Context API, Global State Separation & Redux Toolkit',
    topics: [
      'Strategic separation of local component state, shell Context, and global application state.',
      'Context API providers: Eliminating redundant network fetches across shared parent boundaries.',
      'Redux Toolkit integration: Slices, reducers, immutable updates, and cross-station synchronization.',
      'App-wide asynchronous notification queue and persistence layers.',
    ],
    orbitxImpl: 'Implemented in SettingsContext.jsx, TelemetryContext.jsx, compareCitiesSlice.js, uiSlice.js, and store.js.',
  },
  {
    lectures: 'Lectures 55–72 (PBE-II)',
    phase: 'Forms, Resilience & Feeds',
    title: 'Form Validation, UI Patterns & Resilient REST API Protocols',
    topics: [
      'Controlled form validation with touched state tracking, inline validation errors, and CSS shake feedback.',
      'Modal dialogs, tabs, filter chips, Command Palette (Cmd+K), and keyboard shortcuts.',
      'REST API consumption via native fetch with exponential backoff retry protocol.',
      'Debounced geocoding search, loading skeletons, and failure state management.',
      'Infinite scroll pagination using IntersectionObserver sentinel architecture.',
    ],
    orbitxImpl: 'Implemented in ValidatedField.jsx, fetchWithRetry.js, EarthWatch.jsx (IntersectionObserver), and ToastStack.jsx.',
  },
];

const OBSERVATORY_TABS = [
  {
    name: 'Home (Observatory Desk)',
    route: '/',
    badge: '3D WEBGL COMMAND',
    desc: 'Central planetary overview featuring an interactive 3D WebGL Earth globe with geographic raycasting. Select continents or pins to view live climate conditions, switch overlay layers (Weather, AQI, Seismic, Satellites), track world clocks, and view astronomical solar/lunar countdown dials.',
    tech: 'Vanilla Three.js • Canvas Texture Synthesis • Raycaster Clicks • Local Storage Onboarding',
  },
  {
    name: 'Explore (Planetary Analytics)',
    route: '/explore/:citySlug',
    badge: 'CANVAS 2D ANALYTICS',
    desc: 'Deep-dive planetary station rendering dynamic HTML5 Canvas 2D trend charts for 7-day temperature curves, 24-hour Air Quality Index, barometric pressure, and humidity. Supports debounced geocoding search, URL deep-linking via dynamic parameters, and one-click pinning to the Compare matrix.',
    tech: 'Dynamic Route Params (useParams) • Canvas 2D Charts • Debounced Geocoding • Redux Pin Action',
  },
  {
    name: 'Compare (City Comparator)',
    route: '/compare',
    badge: '4-CITY COMPARATOR',
    desc: 'Multi-city comparative matrix examining up to 4 global cities simultaneously. Features a normalized 5-axis Canvas 2D radar chart (temperature, AQI, wind, pressure, humidity) alongside detailed metric cards, synchronized in real time with Redux Toolkit and persisted across sessions.',
    tech: 'Redux Toolkit (compareCitiesSlice) • Multi-Axis Radar Chart • Synchronized Telemetry Hook',
  },
  {
    name: 'Satellites (ISS Orbit Tracker)',
    route: '/satellites/*',
    badge: 'NESTED ROUTE STATION',
    desc: 'Dedicated low-Earth-orbit station tracking the International Space Station (NORAD 25544) in real time every 5 seconds. Employs React Router nested routing with <Outlet /> to seamlessly transition between the equirectangular 2D orbital map, upcoming overhead pass schedules, and station specifications.',
    tech: 'React Router Nested Routes (<Outlet />) • 5-Second Interval Polling • Ground Track Canvas 2D',
  },
  {
    name: 'Alerts (Command Center)',
    route: '/alerts',
    badge: 'REAL-TIME MONITOR',
    desc: 'Consolidated operational monitoring feed aggregating real-time environmental anomalies from live streams: high-magnitude seismic events (USGS ≥ 3.5), elevated air quality risks (AQI > 50), extreme temperature warnings, and visible overhead satellite passes.',
    tech: 'Centralized TelemetryContext • Severity Classification • Category Filtering • Global Counter Pill',
  },
  {
    name: 'Aurora & Space Weather',
    route: '/aurora',
    badge: '3D LIGHTING ENGINE',
    desc: 'Interactive 3D WebGL Aurora Borealis & Australis visualizer. Features realistic Rayleigh atmospheric corona glow, undulating ionospheric curtain ribbons, fluted vertical ray pillars, dynamic 3D multi-point lighting, real-time NOAA SWPC planetary Kp-index, and DSCOVR satellite IMF Bz telemetry.',
    tech: 'Vanilla Three.js Atmosphere • Dual Auroral Ovals • Real 3D PointLights • Evaluation Stress-Test',
  },
  {
    name: 'Earth Watch (Geophysical Events)',
    route: '/earth-watch',
    badge: 'INFINITE SCROLL FEED',
    desc: 'Planetary natural disaster and seismic intelligence center powered by NASA EONET and USGS. Features an infinite scroll feed with IntersectionObserver sentinel pagination, category filtering (Wildfires, Storms, Volcanoes), an interactive tectonic plate boundary map, and safety guidelines.',
    tech: 'NASA EONET V3 • USGS Seismic Feed • IntersectionObserver Pagination • Plate Boundaries',
  },
  {
    name: 'Journal (Personal Ledger)',
    route: '/journal',
    badge: 'PROTECTED PRIVACY GATE',
    desc: 'Personal environmental log protected by a client-side 4-digit passcode gate. Features reusable validated form fields, observation categorization, JSON backup and restore, camera snapshot image generation, and live toast notifications.',
    tech: 'ProtectedRoute Component • ValidatedField (Shake Animation) • JSON Backup • HTML Canvas Export',
  },
  {
    name: 'Settings (System Controls)',
    route: '/settings',
    badge: 'CONFIGURATION SUITE',
    desc: 'Comprehensive application configuration panel. Allows operators to customize measurement units (°C/°F), toggle telemetry polling rates, configure the Privacy Lock passcode, enable Web Audio acoustic synthesizer feedback, and perform factory resets.',
    tech: 'SettingsContext Provider • Passcode Validation • Web Audio Synthesizer • LocalStorage Sync',
  },
  {
    name: 'About (System Documentation)',
    route: '/about',
    badge: 'TECHNICAL SPECIFICATION',
    desc: 'Complete architectural specification, full curriculum syllabus progression (Lectures 1–72), observatory station guides, and keyless public API attributions.',
    tech: 'Component Documentation • Syllabus Mapping • Public Endpoint Index • Hand-Crafted CSS3',
  },
];

const API_ATTRIBUTIONS = [
  {
    name: 'NOAA SWPC Space Weather API',
    endpoint: 'services.swpc.noaa.gov',
    desc: 'Planetary K-index geomagnetic activity, 3-hour Kp history, real RTSW solar wind plasma speed & DSCOVR IMF Bz magnetometer telemetry.',
  },
  {
    name: 'NASA EONET V3 Events API',
    endpoint: 'eonet.gsfc.nasa.gov',
    desc: 'Real-time open natural disaster events feed (wildfires, severe storms, volcanoes, floods) with infinite scroll sentinel pagination.',
  },
  {
    name: 'Open-Meteo Weather Forecast API',
    endpoint: 'api.open-meteo.com',
    desc: 'Current weather conditions, 7-day temperature curves, 24h pressure & humidity trends with exponential backoff retry logic.',
  },
  {
    name: 'Open-Meteo Air Quality API',
    endpoint: 'air-quality-api.open-meteo.com',
    desc: '24-hour US & European AQI, PM2.5, PM10 pollutant counts with categorical status color mapping.',
  },
  {
    name: 'Open-Meteo Geocoding API',
    endpoint: 'geocoding-api.open-meteo.com',
    desc: 'Global city coordinate search, debounced autocomplete, & dynamic route slug parameter resolution.',
  },
  {
    name: 'USGS Earthquakes Feed',
    endpoint: 'earthquake.usgs.gov',
    desc: 'Real-time 24-hour seismic event GeoJSON summary feed with tectonic plate boundary overlay and magnitude scatter plot.',
  },
  {
    name: 'WhereTheISS Satellite API',
    endpoint: 'api.wheretheiss.at',
    desc: '5-second live low-Earth-orbit telemetry for International Space Station (NORAD 25544) with 2D equirectangular tracking map.',
  },
  {
    name: 'Sunrise-Sunset.org Solar API',
    endpoint: 'api.sunrise-sunset.org',
    desc: 'Calculated astronomical sunrise/sunset timestamps, day length, solar ratio dial, & lunar phase illumination cycle.',
  },
  {
    name: 'Open ER Exchange Rates API',
    endpoint: 'open.er-api.com',
    desc: 'Real-time global currency exchange rates (USD base) for macroeconomic cross-correlation and financial shift alerts.',
  },
];

export function About() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          About OrbitX Observatory
          <span className="page-title__tag">ARCHITECTURE & SYLLABUS SPECIFICATION</span>
        </h1>
        <p className="page-subtitle">
          Real-time planetary monitoring platform, comprehensive curriculum implementation (Lectures 1–72), and station technical documentation
        </p>
      </header>

      <article className="about-article">
        {/* Executive Platform Summary */}
        <div className="about-highlight-box">
          <p style={{ color: 'var(--color-accent-teal)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>
            🛰️ PLATFORM OVERVIEW & ENGINEERING PHILOSOPHY
          </p>
          <p>
            <strong>OrbitX Observatory</strong> is a production-grade, real-time planetary monitoring platform that consolidates live data streams across atmospheric physics, geophysics, satellite orbits, solar plasma, and space weather into a unified interface. Built with <strong>zero external UI component libraries or CSS frameworks</strong>, OrbitX demonstrates the power of clean React 18 component composition, vanilla Three.js WebGL rendering, and standard CSS3 architecture.
          </p>
          <p style={{ marginTop: '8px' }}>
            The platform strictly honors the principle of architectural restraint: exactly one sanctioned dependency addition — <strong>Redux Toolkit (<code style={{ color: 'var(--color-accent-teal)' }}>@reduxjs/toolkit</code> & <code style={{ color: 'var(--color-accent-teal)' }}>react-redux</code>)</strong> — is integrated alongside Context API to illustrate clean architectural separation between page-scoped state, shell-wide preferences, and synchronized global caches.
          </p>
        </div>

        {/* 4 Architectural Pillars */}
        <section>
          <h2 className="about-section-title">Core Engineering Pillars</h2>
          <div className="about-pillars-grid">
            <div className="about-pillar-card">
              <span className="about-pillar-card__title">🪐 Pure Vanilla WebGL 3D</span>
              <p className="about-pillar-card__text">
                Direct DOM Three.js manipulation with procedural Canvas texture generation, custom raycaster click interactions, dynamic atmospheric lighting, and explicit resource disposal (<code style={{ color: 'var(--color-accent-teal)' }}>dispose()</code>) on unmount.
              </p>
            </div>

            <div className="about-pillar-card">
              <span className="about-pillar-card__title">⚛️ React 18 Architecture</span>
              <p className="about-pillar-card__text">
                Functional component hierarchy powered by 10 custom hooks, memoized selectors, Context API for shell state, and Redux Toolkit for cross-station comparison synchronization.
              </p>
            </div>

            <div className="about-pillar-card">
              <span className="about-pillar-card__title">🎨 Hand-Crafted CSS3 System</span>
              <p className="about-pillar-card__text">
                Zero CSS frameworks. Engineered exclusively with CSS custom properties, semantic class names, mobile-first responsive media queries, and high-contrast observatory tokens.
              </p>
            </div>

            <div className="about-pillar-card">
              <span className="about-pillar-card__title">📡 Resilient Public REST Feeds</span>
              <p className="about-pillar-card__text">
                Consumes 9 live keyless public APIs utilizing an exponential backoff retry protocol (<code style={{ color: 'var(--color-accent-teal)' }}>fetchWithRetry.js</code>) with loading skeletons, debouncing, and graceful error handling.
              </p>
            </div>
          </div>
        </section>

        {/* Curriculum & Syllabus Implementation (Lectures 1–72) */}
        <section style={{ marginTop: 'var(--space-md)' }}>
          <h2 className="about-section-title">Curriculum & Syllabus Implementation (Lectures 1–72)</h2>
          <p style={{ color: 'var(--color-mute)', marginBottom: 'var(--space-md)' }}>
            Complete architectural mapping showing how each phase of the Front End Engineering curriculum is applied across the OrbitX codebase:
          </p>

          <div className="about-syllabus-grid">
            {SYLLABUS_MODULES.map((mod) => (
              <div key={mod.lectures} className="about-syllabus-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="about-lecture-badge">{mod.lectures}</span>
                  <span className="badge-promo">{mod.phase}</span>
                </div>
                <h3 className="about-syllabus-card__title">{mod.title}</h3>
                <ul className="about-syllabus-card__list">
                  {mod.topics.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
                <div className="about-station-card__tech">
                  <strong>OrbitX Implementation:</strong> {mod.orbitxImpl}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Observatory Stations & Tabs Directory */}
        <section style={{ marginTop: 'var(--space-md)' }}>
          <h2 className="about-section-title">Observatory Stations & Tabs Directory (10 Total)</h2>
          <p style={{ color: 'var(--color-mute)', marginBottom: 'var(--space-md)' }}>
            Detailed overview of each dedicated station, its operational purpose, route pattern, and supporting technologies:
          </p>

          <div className="about-stations-grid">
            {OBSERVATORY_TABS.map((tab) => (
              <div key={tab.name} className="about-station-card">
                <div className="about-station-card__header">
                  <h3 className="about-station-card__title">{tab.name}</h3>
                  <span className="about-station-card__route">{tab.route}</span>
                </div>
                <span className="badge-promo" style={{ alignSelf: 'flex-start', color: 'var(--color-accent-teal)', borderColor: 'var(--color-accent-teal)' }}>
                  {tab.badge}
                </span>
                <p className="about-station-card__desc">{tab.desc}</p>
                <div className="about-station-card__tech">
                  <strong>Stack:</strong> {tab.tech}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Telemetry Data Sources & API Attribution */}
        <section style={{ marginTop: 'var(--space-md)' }}>
          <h2 className="about-section-title">Telemetry Data Sources & API Attribution (9 Keyless Public Endpoints)</h2>
          <p style={{ color: 'var(--color-mute)', marginBottom: 'var(--space-md)' }}>
            OrbitX operates exclusively on keyless, public-domain scientific endpoints without proprietary tokens or paywalls:
          </p>

          <div className="about-api-grid">
            {API_ATTRIBUTIONS.map((api) => (
              <div key={api.name} className="about-api-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{api.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-accent-teal)' }}>{api.endpoint}</span>
                </div>
                <p style={{ marginTop: '6px', color: 'var(--color-mute)', fontSize: 'var(--text-caption-sm)' }}>{api.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4-Column Credit Footer */}
        <footer className="about-footer">
          <div className="about-footer__columns">
            <div>
              <h3 className="about-footer__col-title">Telemetry Feeds</h3>
              <ul className="about-footer__col-list">
                <li>NOAA Space Weather Prediction Center</li>
                <li>NASA Earth Observatory (EONET)</li>
                <li>USGS Earthquake Hazards Program</li>
                <li>Open-Meteo Weather & AQI</li>
                <li>WhereTheISS Satellite API</li>
              </ul>
            </div>
            <div>
              <h3 className="about-footer__col-title">Architecture</h3>
              <ul className="about-footer__col-list">
                <li>Vanilla Three.js WebGL Engine</li>
                <li>React 18 & React Router v6</li>
                <li>Redux Toolkit State Management</li>
                <li>HTML5 Canvas 2D Graphics</li>
                <li>Web Audio API Telemetry Feedback</li>
              </ul>
            </div>
            <div>
              <h3 className="about-footer__col-title">Curriculum Coverage</h3>
              <ul className="about-footer__col-list">
                <li>Lectures 1–18: HTML5, CSS3, ES6+</li>
                <li>Lectures 19–36: React Core & Hooks</li>
                <li>Lectures 37–48: Routing & Navigation (PBE-I)</li>
                <li>Lectures 49–54: Context & Redux Toolkit</li>
                <li>Lectures 55–72: Forms, Resilience & APIs (PBE-II)</li>
              </ul>
            </div>
            <div>
              <h3 className="about-footer__col-title">Engineering Standards</h3>
              <ul className="about-footer__col-list">
                <li>Zero External UI/CSS Libraries</li>
                <li>Single Sanctioned Redux Dependency</li>
                <li>Explicit WebGL Memory Disposal</li>
                <li>Mobile-First 320px to 4K Responsive</li>
              </ul>
            </div>
          </div>

          <div className="about-footer__fineprint">
            <span>ORBITX OBSERVATORY • FRONT END ENGINEERING-II (PBE-II) SPECIFICATION</span>
            <span>BUILD v9.0 • PRODUCTION VERIFIED & COMPILED CLEANLY</span>
          </div>
        </footer>
      </article>
    </div>
  );
}
