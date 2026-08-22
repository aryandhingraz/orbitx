# OrbitX - Live Earth Instrument Panel

[![Deploy OrbitX](https://github.com/aryandhingraz/orbitx/actions/workflows/deploy.yml/badge.svg)](https://github.com/aryandhingraz/orbitx/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-0f766e?style=flat-square)](https://aryandhingraz.github.io/orbitx/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=flat-square&logo=threedotjs)](https://threejs.org/)

OrbitX is a live, multi-page observatory dashboard for planet Earth. It combines a custom WebGL globe, real-time environmental telemetry, satellite tracking, seismic activity, air-quality data, space-weather signals, and personal observation tools into one polished front-end application.

Live project: **https://aryandhingraz.github.io/orbitx/**

---

## Project Highlights

- Interactive Three.js/WebGL Earth with dedicated vanilla JavaScript globe engine
- 10 routed observatory stations built with React Router
- Real-time public API integrations for weather, air quality, earthquakes, ISS position, astronomy, exchange rates, natural events, and space weather
- Canvas-based telemetry charts for trends, distributions, maps, and radar comparison views
- Responsive app shell with desktop navigation rail and mobile-friendly routing
- Persistent local observation journal with telemetry snapshots
- GitHub Actions deployment pipeline that automatically publishes the live site after every push to `main`

---

## Live Pages

| Station | Purpose |
|---|---|
| Home | Main observatory desk with interactive Earth, telemetry rings, and instrument gauges |
| Explore | City-level weather, air-quality, pressure, and humidity analytics |
| Compare | Multi-city environmental comparison with radar-style visualization |
| Satellites | Live ISS position, satellite telemetry, and orbital tracking interface |
| Alerts | Aggregated environmental alert command center |
| Space Weather | NOAA SWPC geomagnetic and solar-wind telemetry |
| Earth Watch | NASA EONET natural events, earthquakes, and safety context |
| Journal | Personal telemetry ledger for saved observations |
| Settings | Display units, refresh cadence, theme, and interface preferences |
| About | Architecture notes, public API credits, and evaluation mapping |

---

## Tech Stack

| Area | Tools |
|---|---|
| Frontend | React 18, React Router |
| Build Tool | Vite |
| 3D Graphics | Three.js, WebGL |
| Data Visualization | Canvas 2D, custom chart components |
| Styling | Vanilla CSS, design tokens, responsive layouts |
| Deployment | GitHub Pages, GitHub Actions |

---

## Public Data Sources

OrbitX uses keyless public APIs and browser-native capabilities:

| Data | Source |
|---|---|
| Weather forecast | Open-Meteo Weather Forecast API |
| Air quality | Open-Meteo Air Quality API |
| City search | Open-Meteo Geocoding API |
| Earthquakes | USGS Earthquake GeoJSON Feed |
| ISS position | WhereTheISS Satellite API |
| Solar schedule | Sunrise-Sunset.org API |
| Exchange rates | Open ER Exchange Rates API |
| Natural events | NASA EONET V3 Events API |
| Space weather | NOAA SWPC Space Weather APIs |
| Current location | Browser Geolocation API |

---

## Architecture

The project is organized by purpose under `src/`:

```text
src/
  components/   Reusable interface and chart components
  context/      App-wide settings and telemetry state
  globe/        Isolated Three.js/WebGL globe engine
  hooks/        Data-fetching and browser API hooks
  pages/        Routed station screens
  styles/       Global CSS, layout rules, tokens, and component styles
  utils/        Pure formatting, conversion, color, export, and helper logic
```

The main DOM/WebGL showcase is `src/globe/globeEngine.js`, which is intentionally isolated from React. It handles canvas rendering, Three.js scene construction, pointer interactions, animation, raycasting, and cleanup.

---

## Local Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Deployment

The repository is configured with GitHub Actions. Every push to `main` installs dependencies, builds OrbitX with the correct GitHub Pages base path, and publishes the latest production build automatically.

Live deployment:

```text
https://aryandhingraz.github.io/orbitx/
```

---

## Academic Integrity Notice

OrbitX is an original Front End Engineering evaluation project by Aryan Dhingra. The repository is public for review, demonstration, and portfolio visibility. Please do not copy or submit this work as your own.

---

## Author

**Aryan Dhingra**  
GitHub: [@aryandhingraz](https://github.com/aryandhingraz)
