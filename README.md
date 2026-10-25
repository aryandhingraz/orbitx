# OrbitX — Real-Time Planetary Observatory & Space Instrument Panel

[![Deploy OrbitX](https://github.com/aryandhingraz/orbitx/actions/workflows/deploy.yml/badge.svg)](https://github.com/aryandhingraz/orbitx/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-0f766e?style=flat-square)](https://aryandhingraz.github.io/orbitx/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.0-764abc?style=flat-square&logo=redux)](https://redux-toolkit.js.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=flat-square&logo=threedotjs)](https://threejs.org/)

**OrbitX** is an autonomous, production-grade real-time planetary observatory and space science platform. Designed and engineered from the ground up without third-party component libraries or CSS frameworks, OrbitX consolidates live data streams across atmospheric physics, geophysics, satellite orbital tracks, solar wind plasma, and geomagnetic weather into a unified, high-performance web interface.

🌐 **Live Observatory**: [https://aryandhingraz.github.io/orbitx/](https://aryandhingraz.github.io/orbitx/)

---

## 🌟 Key Engineering Highlights

- **🪐 Vanilla WebGL 3D Planetary & Aurora Engine**: Custom DOM Three.js rendering with procedural texture synthesis, custom raycasting, dynamic 3D lighting, fluted ionization ray pillars, and **explicit GPU memory disposal (`dispose()`)** on unmount.
- **🌌 3D Northern & Southern Lights Visualizer (`/aurora`)**: Real-time simulated ionospheric curtains (Aurora Borealis & Australis) with Rayleigh atmospheric corona scattering, dual polar ovals, and live NOAA SWPC planetary Kp-index telemetry.
- **⚡ Evaluation Stress-Test Simulator**: Interactive control allowing instant simulation of geomagnetic activity from Kp 1 (Quiet) to Kp 9 (G5 Extreme Storm — triggering Stable Auroral Red SAR arcs visible at Hanle Dark Sky Reserve in Ladakh, India).
- **⚛️ Sanctioned Redux Toolkit Integration**: Strategic state separation between page-scoped state, Context API shell preferences, and global Redux slices (`compareCitiesSlice` and `uiSlice` toast queue).
- **🎨 Hand-Crafted CSS3 Design System**: 100% custom CSS3 custom properties and mobile-first responsive grid tested from 320px mobile to 4K ultra-wide (Zero Bootstrap, Tailwind, or external frameworks).
- **📡 Resilient REST Data Protocol**: Native `fetch` with an exponential backoff retry protocol (`fetchWithRetry.js`), debounced search autocomplete, loading skeletons, and `IntersectionObserver` sentinel infinite scroll.

---

## 🛰️ Observatory Stations & Tab Directory

| Station | Route | Description & Architecture |
|---|---|---|
| **Home** | `/` | Main observatory desk with interactive 3D WebGL Earth globe, geographic raycasting, layer switcher (Weather, AQI, Seismic, Satellites), global clocks, and solar/lunar countdown dials. |
| **Explore** | `/explore/:citySlug` | Deep-dive Canvas 2D trend charts for 7-day temperature, 24h AQI, pressure, and humidity. Supports dynamic route parameters, debounced geocoding search, and Redux pin-to-compare. |
| **Compare** | `/compare` | 4-city simultaneous comparison matrix with normalized 5-axis Canvas 2D radar chart and real-time Redux persistence. |
| **Satellites** | `/satellites/*` | Dedicated ISS tracker using React Router nested routes with `<Outlet />` (`map`, `schedule`, `info`), tracking ISS telemetry every 5 seconds with 2D equirectangular ground track. |
| **Alerts** | `/alerts` | Operational command center aggregating live environmental alerts (USGS quakes ≥ 3.5, elevated AQI > 50, extreme temperatures, and visible overhead satellite passes). |
| **Aurora & Space** | `/aurora` | 3D WebGL Aurora Borealis & Australis visualizer with dynamic 3D multi-point lighting, fluted ray pillars, 24-hour planetary K-index trend chart, and DSCOVR satellite IMF Bz telemetry. |
| **Earth Watch** | `/earth-watch` | NASA EONET natural disaster intelligence center with category filtering, infinite scroll pagination (`IntersectionObserver`), USGS seismic scatter plot, and tectonic plate boundaries. |
| **Journal** | `/journal` | Personal observation ledger secured behind a client-side 4-digit passcode gate (`ProtectedRoute.jsx`), featuring reusable validated inputs (`ValidatedField.jsx`), JSON backup/restore, and canvas image export. |
| **Settings** | `/settings` | System preferences for units (°C/°F), polling cadence, Privacy Lock passcode setup, Web Audio acoustic synthesizer feedback, and factory reset. |
| **About** | `/about` | Comprehensive technical documentation mapping Front End Engineering curriculum (Lectures 1–72), observatory station guides, and keyless public API attributions. |

---

## 📚 Curriculum & Syllabus Progression (Lectures 1–72)

OrbitX comprehensively implements the full university Front End Engineering curriculum:

```
Curriculum Architecture (Lectures 1–72)
│
├── Lectures 1–18: Web Foundations & Modern JavaScript
│   ├── Semantic HTML5 structure (<header>, <nav>, <main>, <article>, <section>, <footer>)
│   ├── Hand-crafted CSS3 (Box Model, Flexbox, Grid) — Zero external CSS frameworks
│   └── ES6+ Modules, Promises, async/await, and localStorage JSON serialization
│
├── Lectures 19–36: React 18 Core & Hooks Architecture
│   ├── Vite build tooling with clean transform (144 modules, 0 warnings)
│   ├── Component lifecycle, composition, controlled inputs, and conditional skeletons
│   └── 10 Custom Telemetry Hooks (useWeather, useAirQuality, useISS, useQuakes, etc.)
│
├── Lectures 37–48 (PBE-I): Routing, Navigation Layout & SPAs
│   ├── React Router v6 multi-page SPA with persistent NavRail and mobile drawer
│   ├── Dynamic Route Parameters: /explore/:citySlug with deep-link resolution
│   ├── Nested Routes with <Outlet />: /satellites/* (map, schedule, info)
│   ├── Protected Route Gate: /journal locked behind a client-side 4-digit passcode
│   └── Designed 404 Route: NotFound.jsx handling unmapped orbital coordinates
│
├── Lectures 49–54: Context API, Redux Toolkit & State Separation
│   ├── SettingsContext.jsx: Shell preferences (units, theme, audio feedback)
│   ├── TelemetryContext.jsx: Shared streams eliminating duplicate network requests
│   └── Redux Toolkit: compareCitiesSlice.js (city comparison) & uiSlice.js (toasts)
│
└── Lectures 55–72 (PBE-II): Forms, UI Patterns & Resilient REST APIs
    ├── Reusable ValidatedField.jsx: Touched state tracking, validation rules, CSS shake
    ├── Command Palette (Cmd+K) overlay with quick navigation & keyboard shortcuts
    ├── fetchWithRetry.js: Exponential backoff retry protocol (500ms, 1500ms)
    ├── Infinite Scroll Pagination: EarthWatch.jsx with IntersectionObserver sentinel
    └── 9 Keyless Public APIs: NOAA, NASA, Open-Meteo (3x), USGS, ISS, Solar, Open ER
```

---

## 📡 Public Telemetry APIs (9 Total)

OrbitX operates strictly on keyless, public-domain scientific endpoints without proprietary tokens or paywalls:

1. **NOAA SWPC Space Weather**: Planetary K-index, 3-hour Kp history, real RTSW solar wind plasma speed & DSCOVR IMF Bz magnetometer telemetry.
2. **NASA EONET V3 Events**: Open natural disaster events feed (wildfires, severe storms, volcanoes, floods).
3. **Open-Meteo Weather Forecast**: Current conditions, 7-day temperature curves, 24h pressure & humidity trends.
4. **Open-Meteo Air Quality**: 24-hour US & European AQI, PM2.5, PM10 pollutant counts.
5. **Open-Meteo Geocoding**: Global city coordinate search with debounced autocomplete.
6. **USGS Earthquakes**: Real-time 24-hour seismic event GeoJSON summary feed.
7. **WhereTheISS**: 5-second live low-Earth-orbit telemetry for the International Space Station (NORAD 25544).
8. **Sunrise-Sunset.org**: Calculated astronomical sunrise/sunset timestamps, day length, and solar ratio.
9. **Open ER Exchange Rates**: Real-time global currency exchange rates (USD base).

---

## 📁 Repository Directory Structure

```text
src/
├── components/     # Reusable UI widgets, Canvas 2D charts, and 3D Aurora visualizer
├── context/        # React Context providers (SettingsContext, TelemetryContext)
├── globe/          # Vanilla Three.js WebGL Earth engine and procedural shaders
├── hooks/          # 10 custom data-fetching and telemetry hooks
├── pages/          # 10 routed observatory station screens
├── store/          # Redux Toolkit store, compareCitiesSlice, and uiSlice
├── styles/         # Hand-crafted CSS3 tokens, layout, and component stylesheets
└── utils/          # Pure math, formatters, audio synthesizer, retry protocol, and exports
```

---

## 💻 Local Development & Build

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🚀 Deployment Pipeline

The repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`). On every push to `main`, dependencies are installed, OrbitX is built for production with the GitHub Pages base path (`--base=/orbitx/`), and the build artifacts are published automatically.

---

## 👤 Author

**Aryan Dhingra**  
GitHub: [@aryandhingraz](https://github.com/aryandhingraz)  
Project: OrbitX Observatory — Front End Engineering Evaluation
