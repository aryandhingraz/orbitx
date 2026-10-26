> **Agent kickoff instructions — read this block first, before anything else below.**
> 1. Read this entire file top to bottom before writing or generating any code. Do not start scaffolding from a partial read.
> 2. Scaffold the project with Vite + React exactly as structured in §0 — every file goes in the folder that matches its *purpose*, not dumped flat. Do not deviate from that folder layout, and do not add a folder that isn't listed there without flagging it first.
> 3. Follow the build order in §11 exactly, one step at a time, one commit per step. Do not generate the whole site in a single pass — stop after each step, confirm it actually runs (`npm run dev`), then continue.
> 4. Hold to the tech stack for the entire build: semantic HTML5, hand-written CSS3 (no framework), vanilla ES6+ JS, and React (JSX, props, state, hooks, Router, Context) — nothing outside what §0 names.
> 5. Before declaring the project finished, run the full checklist in §16 line by line.

---

# OrbitX — Master Build Prompt
### A live, multi-page instrument panel for planet Earth — organized by purpose, not by accident

Feed this entire document to your coding agent (Antigravity) as one master prompt. This version specifies a **properly organized, multi-folder React project** — every file lives in a folder that reflects what it does (components, hooks, pages, styles, utilities, globe engine), so the codebase reads clearly to anyone opening it, including an evaluator. This directly satisfies the rubric's explicit "maintains a well-organized folder structure" line item (§17.2), not just general tidiness.

This build satisfies **BECSE (AIFT) Batch 2025, Front End Engineering-II, Project-Based Evaluation-I**, syllabus lectures 1–42 and both rubric components. See §17 for the explicit line-by-line mapping to the two attached documents.

---

## 0. Project scaffold and folder organization (build this first, exactly as laid out)

Scaffold with Vite (`npm create vite@latest orbitx -- --template react`), then reshape into this structure. Every folder groups files by **purpose**, so decoding the project means opening one clearly-named folder, not searching a flat pile:

```
orbitx/
├─ index.html                     # single entry point — mounts <div id="root">
├─ package.json
├─ vite.config.js
├─ .gitignore                     # node_modules, dist, .env
├─ README.md
├─ public/
│  └─ textures/                   # globe day/night/bump map images
└─ src/
   ├─ main.jsx                     # ReactDOM.createRoot(...).render(<App/>)
   ├─ App.jsx                      # <SettingsProvider><Router/></SettingsProvider>
   ├─ router.jsx                   # HashRouter + all six <Route> definitions
   │
   ├─ context/                     # app-wide state, not tied to one page
   │  └─ SettingsContext.jsx       # units, theme override, refresh cadence
   │
   ├─ styles/                      # every CSS rule in the app — nothing inline
   │  ├─ tokens.css                # §2 color/type/spacing custom properties
   │  ├─ base.css                  # resets, box-sizing, focus-visible defaults
   │  ├─ layout.css                # page shell grid, NavRail, breakpoints
   │  └─ components/                # one stylesheet per component, same name
   │     ├─ orbitRing.css
   │     ├─ instrumentGauge.css
   │     ├─ dataPanel.css
   │     ├─ instrumentStrip.css
   │     ├─ navRail.css
   │     └─ ...one file per component in src/components/
   │
   ├─ globe/                       # the vanilla-JS/WebGL showcase, isolated on purpose
   │  ├─ Globe.jsx                 # thin React wrapper — useRef + useEffect mount/cleanup
   │  └─ globeEngine.js            # pure vanilla JS + Three.js — zero React imports
   │
   ├─ hooks/                       # one file per data source, identical shape
   │  ├─ useGeolocation.js
   │  ├─ useWeather.js
   │  ├─ useAirQuality.js
   │  ├─ useQuakes.js
   │  ├─ useISS.js
   │  ├─ useSunAndMoon.js
   │  ├─ useCurrency.js
   │  ├─ useWorldClocks.js
   │  └─ useGeocodingSearch.js     # powers Compare's city search
   │
   ├─ components/                  # small, reusable, presentational pieces
   │  ├─ NavRail.jsx
   │  ├─ OrbitRing.jsx
   │  ├─ OrbitMarker.jsx
   │  ├─ InstrumentGauge.jsx
   │  ├─ InstrumentStrip.jsx
   │  ├─ DataPanel.jsx
   │  ├─ ErrorBadge.jsx
   │  ├─ SkeletonPulse.jsx
   │  ├─ KeyboardShortcutOverlay.jsx
   │  ├─ Starfield.jsx
   │  └─ OfflineBanner.jsx
   │
   ├─ pages/                       # one file per route, composed from the above
   │  ├─ Home.jsx
   │  ├─ Explore.jsx
   │  ├─ Compare.jsx
   │  ├─ Journal.jsx
   │  ├─ Settings.jsx
   │  └─ About.jsx
   │
   └─ utils/                       # pure functions, no React, no side effects
      ├─ moonPhase.js              # Conway synodic-month calculation
      ├─ angleMath.js              # lat/long/time → ring-angle conversions
      ├─ formatters.js             # number/time/currency formatting, null-safe
      └─ unitConversion.js         # °C↔°F, km/h↔mph, driven by SettingsContext
```

**Naming rule:** a component's `.jsx` file and its `.css` file share the same name (`OrbitRing.jsx` ↔ `orbitRing.css`), and every hook file's name matches its exported function (`useWeather.js` exports `useWeather`). Anyone should be able to guess a file's location from its purpose alone before opening the folder tree.

**Why folders, why this split:** `hooks/` isolates every API integration so a broken endpoint is a one-file fix; `components/` never imports directly from `pages/` (dependencies flow one direction: utils → hooks → components → pages); `globe/` is deliberately separate from `components/` because it is the project's explicit vanilla-JS/DOM-manipulation showcase and should not be mistaken for a React component internally — only its thin wrapper is React.

---

## 1. Concept & positioning

OrbitX is not "a weather app with extra widgets." The mental model: an antique observatory desk rebuilt with modern sensors — brass dials, hand-ruled orbit rings, a glowing globe at the center — reporting real, live data pulled from public APIs, spread across six purposeful pages.

**Tone:** precise, calm, a little reverent — a ship's chronometer, not a video-game HUD, not a corporate SaaS dashboard.

**What makes it unique:** every other "Earth dashboard" project is a neon globe on black or a flat card grid. OrbitX's globe is orbited by rings that are simultaneously navigation *and* live visualization — the ISS ring's marker sits at the ISS's actual current longitude, updated every 5 seconds. Nothing on the page is decorative; every visual element encodes a real number, and every page has a distinct real job (§4).

---

## 2. Design system

### 2.1 Color tokens — "brass instrument, deep sky" (in `styles/tokens.css`)

Deliberately not the generic AI-dashboard defaults (cream+serif+terracotta, or near-black+acid-green neon).

```css
:root {
  /* base surfaces */
  --void:          #0B0E1A;
  --panel:         #141A2E;
  --panel-raised:  #1B2340;
  --hairline:      rgba(201, 162, 39, 0.18);

  /* accents — line work, glows, small fills only */
  --brass:           #C9A227;
  --brass-glow:      rgba(201, 162, 39, 0.35);
  --verdigris:       #5FBFA9;
  --verdigris-glow:  rgba(95, 191, 169, 0.30);

  /* text */
  --parchment:      #ECE6D6;
  --parchment-dim:  #A9A38F;

  /* status — reserved, never decorative */
  --signal:       #E2604F;
  --signal-glow:  rgba(226, 96, 79, 0.30);
  --nominal:      #5FBFA9;

  /* elevation */
  --shadow-panel: 0 8px 24px rgba(0,0,0,0.45);
  --shadow-ring:  0 0 24px var(--brass-glow);
}

/* Day mode — auto-applied via SettingsContext detecting local sunrise/sunset */
[data-theme="day"] {
  --void:  #EDE6D3;
  --panel: #FBF8F0;
  --panel-raised: #F2ECDD;
  --parchment: #1B1A16;
  --parchment-dim: #6B6455;
  --hairline: rgba(140, 106, 20, 0.22);
}
```

**Hard rule:** `--signal` only ever appears on genuine alerts (magnitude ≥5 quake, negative currency delta, fetch failure). If more than ~10% of a screenshot is coral, remove some.

### 2.2 Typography — three roles, zero overlap

| Role | Typeface | Where |
|---|---|---|
| Display | `Space Grotesk` 600/700 | Wordmark, `NavRail` labels, section headers, ring captions |
| Body | `Source Serif 4` 400/500 | Descriptions, About page, Journal entries, tooltips |
| Data | `IBM Plex Mono` 400/500 | Every number — temp, coordinates, timestamps, rates. Always `font-variant-numeric: tabular-nums` |

Type scale (rem): `0.75 / 0.875 / 1 / 1.25 / 1.75 / 2.75 / 4` → `--text-xs` … `--text-3xl` in `tokens.css`. Use only these seven sizes anywhere.

### 2.3 Spacing & radius

4px base spacing scale (`--space-1: 4px` → `--space-12: 48px`). Panels `--radius-panel: 10px`; gauges/bezels fully circular; pills `--radius-pill: 999px`.

### 2.4 Layout — radial, not a card grid

```
                    ┌───────────────────────────────┐
                    │      O R B I T X  (wordmark)    │
                    └───────────────────────────────┘

                 ⟲   outer ring  — world clocks + currency
               ⟲     mid ring   — ISS live position
             ⟲       inner ring — sunrise / moon phase
                         ●━━━━━━━━━●
                     ╱    🌍 GLOBE    ╲
                         ●━━━━━━━━━●

   [ weather gauge ]  [ air quality gauge ]  [ quake counter gauge ]
            — instrument strip: brass-bezel circular readouts —
```

Grid: CSS Grid for the page shell in `layout.css` (`grid-template-rows: auto 1fr auto`), Flexbox inside every panel/gauge component's own stylesheet.

### 2.5 Signature element — the Orbit Ring System

Three concentric SVG rings around the globe on Home, each rotating continuously (outer 120s / mid 80s / inner 45s, CSS `@keyframes`, GPU-accelerated `transform`), each carrying one glowing brass marker positioned by real data (ISS longitude, lead world-clock minute, solar terminator fraction). Clicking a marker pauses that ring, intensifies its glow, and slides in a `DataPanel` from that ring's compass edge (280ms, `cubic-bezier(0.16,1,0.3,1)`). Recalculate marker angle on every poll — a frozen marker is a bug.

### 2.6 Motion table

| Moment | Effect | Duration | Easing |
|---|---|---|---|
| Page load | Rings + globe settle, staggered outer→inner (120ms stagger) | 600ms | `cubic-bezier(0.34,1.56,0.64,1)` |
| Ambient ring rotation | Linear | per ring | `linear` |
| Marker glow pulse | Opacity 0.6↔1, tied to that hook's real poll interval | matches hook | `ease-in-out` |
| Panel slide-in | translate + fade from ring edge | 280ms | `cubic-bezier(0.16,1,0.3,1)` |
| Route change | 180ms cross-fade | 180ms | `ease` |
| Hover | brightness + 1px lift | 150ms | `ease-out` |

Respect `prefers-reduced-motion`: freeze all rotation, replace overshoot/slide with plain 200ms fades everywhere.

### 2.7 Restraint checklist

- One accent (brass *or* verdigris) dominant per view.
- Flat panels — `--panel` fill + 1px `--hairline` border + `--shadow-panel`. No stacked blur.
- Visible 2px brass focus outline everywhere, never removed without replacement.
- Every icon is a custom 1.5px-stroke SVG line icon, consistent style across all six pages.

---

## 3. Tech stack (matches the attached syllabus exactly, mapped to the folders in §0)

| Layer | Tech | Lives in | Why |
|---|---|---|---|
| Globe rendering | Vanilla JS + Three.js, imperative DOM/canvas mount | `globe/globeEngine.js` + `globe/Globe.jsx` wrapper | Explicit DOM-manipulation showcase — required by rubric line item, kept structurally separate from `components/` on purpose |
| App shell, routing | React 18 + React Router (`HashRouter`) | `src/App.jsx`, `src/router.jsx` | JSX, component composition, React Router (Lectures 37–42) |
| Global state | React Context | `src/context/SettingsContext.jsx` | Units/theme/refresh-rate available to every hook and page without prop-drilling |
| Styling | Plain CSS3, custom-property tokens, no framework | `src/styles/` | Box Model/Flexbox/Grid/media queries stay visibly your own work |
| Data layer | One custom hook per API | `src/hooks/` | Clean, testable, isolates each integration to one file |
| Pure logic | Framework-free utility functions | `src/utils/` | Keeps math/formatting testable and reusable across hooks and pages |

---

## 4. The six pages (this is the "multiple page website" requirement)

All six live in `src/pages/`, rendered through `router.jsx`'s `HashRouter`, sharing one persistent `NavRail` from `src/components/`. Route transitions cross-fade per §2.6; no full page reload ever happens.

### 4.1 `Home.jsx` — `/`
The signature globe + three orbit rings + instrument strip from §2.5, composed from `globe/Globe.jsx`, `components/OrbitRing.jsx`, and `components/InstrumentStrip.jsx`. Also owns day/night theme detection via `SettingsContext`.

### 4.2 `Explore.jsx` — `/explore`
One section per data category, each with a hand-drawn `<canvas>` chart (vanilla Canvas 2D, no charting library): 7-day temperature trend, 24-hour AQI trend, this week's earthquakes by magnitude, an 8-day moon phase strip. Each chart's drawing logic lives inside that section's own `useEffect`, redrawing on data change.

### 4.3 `Compare.jsx` — `/compare`
Debounced city search (via `hooks/useGeocodingSearch.js`, hitting Open-Meteo's free geocoding endpoint) letting the user add up to 3 cities side by side — weather, AQI, local time, sunrise/sunset — in the same brass-bezel, mono-data styling as the rest of the app.

### 4.4 `Journal.jsx` — `/journal`
Pin a timestamped snapshot of current data (from any Home panel or Explore chart) to `localStorage`. Rendered as a vertical timeline of brass-bezel entry cards, with a snapshot-export action (§15) and a "clear journal" action.

### 4.5 `Settings.jsx` — `/settings`
A short form page — units (°C/°F, km/h vs mph), theme override (Auto/Day/Night), data refresh cadence (Live/Balanced/Battery-saver), and a "reset default city" action — all read/written through `context/SettingsContext.jsx`, persisted under one `orbitx-settings` key in `localStorage`. This is the page that makes OrbitX a tool you'd keep open, not just a demo — worth calling out in the viva.

### 4.6 `About.jsx` — `/about`
Body-serif page crediting every API (§6), plus a "How this is built" section explicitly naming the `globe/` folder as the vanilla-DOM-manipulation showcase versus the React tree everywhere else — written for the evaluator.

**Nav rail order:** Home · Explore · Compare · Journal · Settings · About — always in this order, current route highlighted in brass.

---

## 5. Component & hook contracts (exact props/return shapes, so no file guesses at another's interface)

- **`OrbitRing({ radiusRem, angleDeg, periodSec, isPaused, onMarkerClick, label })`** — never computes data itself; angle always passed in from the page.
- **`OrbitMarker({ isActive, isStale, onClick, label })`** — a real `<button>`, `aria-expanded`, `aria-label`; shows `--signal` ring if stale.
- **`InstrumentGauge({ label, value, unit, status, trend })`** — `status ∈ {"nominal","warning","alert","loading","error"}`; `trend ∈ {"up","down","flat",null}`. Receives pre-formatted primitives from `utils/formatters.js` only, never raw fetch state.
- **`DataPanel({ isOpen, anchorSide, title, onClose, children })`** — `anchorSide ∈ {"top","right","bottom","left"}`; traps focus while open; restores focus to the trigger on close.

Every hook in `hooks/` returns the identical shape:

```js
{ data, isLoading, isStale, error, lastUpdated }
```

`isStale = true` when the last success is older than 2× that hook's poll interval — an amber "last known good" state distinct from a hard error.

---

## 6. Data layers — exact API contracts (all free, all keyless)

| Feature | Hook file | Endpoint | Poll interval |
|---|---|---|---|
| Geolocation | `useGeolocation.js` | Browser `navigator.geolocation.getCurrentPosition` | once |
| Weather | `useWeather.js` | `api.open-meteo.com/v1/forecast` | 10 min |
| Weather (7-day) | `useWeather.js` (extended query) | same endpoint, `daily=...` | 1 hr |
| Air quality | `useAirQuality.js` | `air-quality-api.open-meteo.com/v1/air-quality` | 10 min |
| Earthquakes | `useQuakes.js` | `earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson` | 5 min |
| ISS location | `useISS.js` | `api.wheretheiss.at/v1/satellites/25544` | 5 sec |
| Sunrise/sunset | `useSunAndMoon.js` | `api.sunrise-sunset.org/json` | 1 hr |
| Moon phase | `useSunAndMoon.js` → `utils/moonPhase.js` | computed locally | n/a |
| Currency | `useCurrency.js` | `api.frankfurter.app/latest` | 30 min |
| World clocks | `useWorldClocks.js` | `Intl.DateTimeFormat` | 1 sec local tick |
| Geocoding search | `useGeocodingSearch.js` | `geocoding-api.open-meteo.com/v1/search?name=` | on debounced keystroke |

### 6.1 Fetch pattern every hook file must follow

```js
export function useExampleData(params) {
  const [state, setState] = useState({ data: null, isLoading: true, isStale: false, error: null, lastUpdated: null });
  useEffect(() => {
    let cancelled = false, controller;
    async function poll() {
      controller = new AbortController();
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setState({ data: transform(json), isLoading: false, isStale: false, error: null, lastUpdated: Date.now() });
      } catch (err) {
        if (!cancelled && err.name !== "AbortError") {
          setState((prev) => ({ ...prev, isLoading: false, error: err, isStale: true }));
        }
      }
    }
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => { cancelled = true; controller?.abort(); clearInterval(id); };
  }, [/* stable, memoized deps only — e.g. rounded coordinates */]);
  return state;
}
```

**Non-negotiable bug-prevention notes:** always clean up the interval + abort in-flight requests on unmount; round/memoize geolocation coordinates before using them as effect dependencies; never let one bad response crash more than its own ring/gauge/chart.

---

## 7. Error, loading, and empty states

- **Loading:** `components/SkeletonPulse.jsx` — brass shimmer on the actual gauge/marker/chart shape.
- **Stale:** last known value dimmed 40%, small amber dot, label "last known good."
- **Hard error:** `components/ErrorBadge.jsx` — signal-coral outline, "Signal lost — retrying," manual retry button. `utils/formatters.js` must guard null/NaN and render `"—"` instead of ever leaking `undefined`/`NaN`/`Invalid Date`.
- **Empty:** a real designed empty state per context ("No tremors recorded today," "Search a city to compare," "Nothing pinned yet").

---

## 8. Responsive behavior

- **Desktop ≥1024px:** `NavRail` as a slim vertical sidebar. Home uses the full radial layout. Explore/Compare/Journal use a centered ~1100px column.
- **Tablet 640–1023px:** `NavRail` collapses to icons-only. Globe shrinks, rings compress inward but stay literal rings.
- **Mobile <640px:** `NavRail` becomes a fixed bottom tab bar (44×44px min tap targets). Home abandons literal rotating rings for a vertical stacked instrument-card list. Explore charts stack single-column. Compare becomes swipeable one-city-per-card.
- Use `clamp()` for hero/globe sizing instead of fixed breakpoint jumps.
- Test at minimum: 320px, 390px, 768px, 1024px, 1440px. No horizontal scroll, no overlapping text, no tap target under 44px, at any of these.

---

## 9. Performance

- Cap Three.js pixel ratio at 2; dispose everything in `Globe.jsx`'s cleanup — a leaked WebGL context across route changes is a real bug since Home mounts/unmounts as the user navigates.
- Debounce all resize handlers (~150ms).
- Memoize angle-math and chart-data transforms with `useMemo`, keyed on rounded/primitive values.
- Lazy-load lighter-traffic routes (`Journal`, `Settings`, `About`) with `React.lazy` + `Suspense` to keep the initial bundle lean — a real Vite build supports this cleanly, unlike a CDN-only setup.

---

## 10. Design rationale — why these exact choices

- **Navy + brass over black + neon:** the default "space dashboard" trope is pure black with electric glow. OrbitX's palette reads as *scientific and considered* instead, borrowed from ship's brass instruments and observatory desks.
- **Verdigris as the second accent:** the natural patina brass develops over time — keeps the palette narratively consistent rather than two unrelated brand colors bolted together.
- **Three typefaces, three jobs, never mixed:** grotesk = label, serif = something meant to be read, mono = a live number. Real functional hierarchy, not decoration.
- **Radial layout over a card grid:** harder to build correctly (§2.5, §5) but the one choice that could only belong to *this* concept.
- **Every animation timed to something real:** ring periods and pulse timing come from real data cadence (§2.6), not arbitrary "nice-looking" numbers.

---

## 11. Build order (each step ends in a working, committable state)

1. `npm create vite@latest orbitx -- --template react`; reshape into the folder structure in §0; confirm `npm run dev` shows the default Vite page. Commit: `chore: scaffold Vite React project with organized folder structure`.
2. Build `styles/tokens.css`, `base.css`, `layout.css` — full palette/type scale, page shell, `NavRail` for desktop + mobile. Commit: `feat: design tokens and page shell layout`.
3. Set up `router.jsx` with `HashRouter` and all six routes rendering placeholder pages from `pages/`. Confirm route highlighting and cross-fade. Commit: `feat: six-page routing shell`.
4. Build `globe/globeEngine.js` and `globe/Globe.jsx`; get the rotating globe rendering on `Home.jsx`. Commit: `feat: rotating WebGL globe`.
5. Build `utils/angleMath.js` and wire up the three orbit rings with static test markers. Commit: `feat: orbit ring interaction`.
6. Build `context/SettingsContext.jsx` early (units/theme/refresh-rate), since hooks in the next step read from it. Commit: `feat: settings context`.
7. Build hooks one at a time in `hooks/`, wiring each into Home's rings/gauges, testing loading/stale/error before moving on: geolocation → weather → air quality → sun/moon → ISS → quakes → currency → world clocks. One commit per hook.
8. Build `Explore.jsx`'s four hand-drawn Canvas charts. Commit: `feat: explore page canvas charts`.
9. Build `useGeocodingSearch.js` + `Compare.jsx`'s search and comparison layout. Commit: `feat: compare page`.
10. Build `Journal.jsx`'s pin action, `localStorage` persistence, timeline list, snapshot export. Commit: `feat: journal page and local persistence`.
11. Build `Settings.jsx` page UI on top of the context from step 6. Commit: `feat: settings page`.
12. Write `About.jsx`'s content. Full accessibility pass (§8) and reduced-motion pass (§2.6). Commit: `fix: about page, accessibility, reduced motion`.
13. Add the elevated elements from §15, one commit each: ambient starfield → keyboard shortcuts overlay → first-visit onboarding → offline banner → print stylesheet.
14. Full restraint/QA pass against §2.7 and the checklist in §16, tested at all five breakpoints from §8. Commit: `polish: restraint pass and responsive QA`.
15. Write final `README.md` per §12, last. Commit: `docs: README with data sources and architecture notes`.

---

## 12. README requirements

One-paragraph pitch, a screenshot/GIF of the orbit ring interaction and at least one other page, the exact folder structure from §0 with a one-line note on what each folder is for, setup/run instructions (`npm install && npm run dev`), the full API list from §6 with links, an explicit sentence pointing the evaluator to `globe/globeEngine.js` as the vanilla-JS/DOM-manipulation component versus the React tree everywhere else, and a short "known limitations" section.

---

## 13. Rubric alignment (explicit, line by line)

**Component 1 — Presentation:** Demo script walks the six pages in a deliberate order — Home (rings) → Explore (charts) → Compare (search two cities live) → Journal (pin something on the spot) → Settings → About — narrating real, live data throughout.

**Component 2 — Project Work & Viva:**
- *HTML Structure and CSS Styling:* semantic tags, CSS Grid for page shells, Flexbox everywhere else, entirely hand-written via `styles/tokens.css` — zero inline styles, zero CSS framework.
- *JavaScript and GitHub Basics:* the organized `src/` folder structure from §0 *is* this rubric line item; the vanilla `globe/globeEngine.js`, Canvas charts, `utils/` functions; the incremental, meaningfully-named commit history from §11; a `.gitignore`.
- *DOM Manipulation:* the Three.js globe lifecycle in `globe/`, the four hand-drawn Canvas charts on Explore, the Geolocation API call, and ring rotation transforms — all imperative DOM/Canvas/WebGL work outside React's virtual DOM, called out explicitly in the README.
- *React Basics:* every page/component is a functional component; props flow per the contracts in §5; `useState`/`useEffect`/`useContext` drive state throughout; `HashRouter` demonstrates the React Router syllabus topic; multiple custom hooks compose `useState`+`useEffect`.

Commit to GitHub from step 1 of §11 onward — the rubric explicitly requires a repository "updated regularly throughout the semester."

---

## 14. Elevated, hi-tech, still-useful elements (build after the six core pages work)

- **Ambient starfield (`components/Starfield.jsx`):** a single `<canvas>` behind the app, drawn once on mount with vanilla Canvas 2D — a few hundred low-opacity brass/parchment dots. Restrained, reinforces the DOM/Canvas showcase from §0.
- **Keyboard shortcuts (`components/KeyboardShortcutOverlay.jsx`):** `?` opens an overlay listing shortcuts (`1`–`6` jump pages, `Esc` closes panels, `/` focuses Compare's search). One self-contained `useEffect` keydown listener.
- **Snapshot export:** a "Export as image" action in `Journal.jsx`, rendering an entry onto an off-screen `<canvas>` and triggering a download via `canvas.toDataURL()`.
- **First-visit onboarding:** an `orbitx-visited` `localStorage` flag gates a single dismissible `DataPanel` explaining the ring interaction on first load only.
- **Offline banner (`components/OfflineBanner.jsx`):** listens for `online`/`offline` browser events, shows one calm unifying banner instead of every ring silently erroring individually.
- **Print stylesheet:** a `@media print` block hiding the nav rail, globe, and animated rings, showing only Journal/Compare data tables cleanly.

---

## 15. Quality bar — pre-submission checklist

- [ ] `npm run dev` shows zero console errors/warnings on first load, on every one of the six pages.
- [ ] Every hook manually tested in a failure state (offline, or a typo'd endpoint) shows `ErrorBadge`/stale state, never a blank panel or crash.
- [ ] No visible `NaN`, `undefined`, `null`, or `Invalid Date` anywhere, under any data state.
- [ ] Every `useEffect` with an interval/subscription has a matching cleanup — confirmed by navigating rapidly between all six pages ten times and checking the console.
- [ ] WebGL context disposed on route-away-from-Home, re-created cleanly on route-back — confirmed via the browser's memory tab.
- [ ] Visually correct at 320px, 390px, 768px, 1024px, 1440px — no horizontal scroll, no overlap, no tap target under 44px.
- [ ] `prefers-reduced-motion` genuinely freezes rotation and swaps every slide/overshoot for a plain fade.
- [ ] Full keyboard-only pass: every interactive element reachable/operable with `Tab`/`Enter`/`Esc`, visible brass focus outline throughout.
- [ ] Day mode and Night mode both pass a basic 4.5:1 text-contrast check.
- [ ] `localStorage` state (Journal, Settings) survives a hard refresh and browser restart.
- [ ] GitHub history shows the incremental commits from §11, not one final upload.
- [ ] README accurately reflects the final feature set, updated last.

---

## 16. Final reminder for the agent

Navy, brass, verdigris, parchment (or the day-mode equivalents). Six real pages, one router, a folder for every purpose — `hooks/` for data, `components/` for reusable pieces, `pages/` for routes, `globe/` for the vanilla-JS showcase, `utils/` for pure logic, `styles/` for every rule. Radial layout on Home, not a card grid. One glowing globe, three honest rings, hand-drawn charts, a working city-compare tool, a persistent Journal — every visual element tied to a real number, every failure handled gracefully, every breakpoint tested, every file exactly where its purpose says it should be.

---

## 17. Appendix — source document mapping

### 17.1 Syllabus table (Lectures 1–42) → prompt section

| Syllabus row | Topics | Required in |
|---|---|---|
| Lectures 1–6 | HTML5, semantic tags, accessibility, CSS3, Box Model, Flexbox, Grid, responsive, media queries, mobile-first | §0 (semantic HTML5, hand-written CSS3), §2 (Box Model/Grid/Flexbox), §8 (mobile-first breakpoints) |
| Lectures 7–12 | JS basics, Dev tools, VS Code, Git/GitHub basics | §11 build order (incremental commits), §13 mapping, `.gitignore` |
| Lectures 13–18 | ES6+, Promises, async/await, fetch API, DOM manipulation, event handling, browser storage, JSON, forms | §6/§6.1 (fetch pattern), §4.4 Journal (`localStorage`), §0 `globe/` (DOM manipulation) |
| Lectures 19–24 | Events, forms, controlled components, React project setup | §4.3 Compare's search input, §0 Vite scaffold |
| Lectures 25–30 | React intro, component architecture, JSX, props, state, rendering lists, conditional rendering | §5 (component contracts), §4 (six pages as components) |
| Lectures 31–36 | useState, useEffect, useRef, useMemo, useCallback, custom hooks, lifting state up | §6.1 (hook pattern), §9 (`useMemo`/`useRef`), §0 `context/` (Context as lifted-state solution) |
| Lectures 37–42 | React Router, nested/dynamic routes, protected routes, 404 pages | §0 `router.jsx`, §4 (`HashRouter`, six routes) |

### 17.2 Rubric PDF (CUIET/CSE/AIFT/2026/53) → prompt section

| Rubric item | Marks | Required in |
|---|---|---|
| Component 1 — Presentation | 5 | §13, opening paragraph |
| HTML Structure and CSS Styling | up to 8 | §13, bullet 1 |
| JavaScript and GitHub Basics — **explicitly includes "maintains a well-organized folder structure"** | up to 8 | §0 (the entire folder scaffold exists to satisfy this named line item), §13 bullet 2 |
| DOM Manipulation | up to 5 | §13, bullet 3 — `globe/` folder kept structurally separate on purpose |
| React Basics | up to 4 | §13, bullet 4 |
| Note: GitHub submission mandatory, repo updated regularly | — | §11 (commit after every step) |
| Note: evaluator reviews repo structure, contributions, version history | — | §12 README pointing evaluator to the folder layout and its rationale |

Nothing in this document exists outside what these two source documents call for — the folder-per-purpose structure in §0 is a direct, literal response to the rubric's own wording ("maintains a well-organized folder structure"), not a stylistic preference layered on top.

---

## 18. Reference implementation snippets (so no file's shape is left to guesswork)

These are not the full implementation — they're the exact skeleton each file should follow, so every hook, every context, and every wired-up component looks like it came from the same disciplined hand.

### 18.1 `src/context/SettingsContext.jsx`

```jsx
import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "orbitx-settings";
const defaults = {
  units: "metric",        // "metric" | "imperial"
  theme: "auto",           // "auto" | "day" | "night"
  refreshRate: "live",     // "live" | "balanced" | "battery-saver"
  defaultCity: null,       // { name, lat, lon } or null → use geolocation
};

const SettingsContext = createContext(defaults);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults; // corrupted localStorage must never crash the app
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <SettingsContext.Provider value={{ ...settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
```

### 18.2 `src/hooks/useWeather.js` (the reference pattern every other hook copies exactly)

```js
import { useState, useEffect, useMemo } from "react";
import { useSettings } from "../context/SettingsContext.jsx";
import { celsiusToFahrenheit } from "../utils/unitConversion.js";

const POLL_MS = { live: 5 * 60 * 1000, balanced: 10 * 60 * 1000, "battery-saver": 30 * 60 * 1000 };

export function useWeather(rawLat, rawLon) {
  const { units, refreshRate } = useSettings();
  // round to ~1km precision so this never re-triggers the effect on float jitter
  const lat = useMemo(() => (rawLat != null ? Math.round(rawLat * 100) / 100 : null), [rawLat]);
  const lon = useMemo(() => (rawLon != null ? Math.round(rawLon * 100) / 100 : null), [rawLon]);

  const [state, setState] = useState({
    data: null, isLoading: true, isStale: false, error: null, lastUpdated: null,
  });

  useEffect(() => {
    if (lat == null || lon == null) return; // wait for geolocation to resolve
    let cancelled = false;
    let controller;

    async function poll() {
      controller = new AbortController();
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const tempC = json.current.temperature_2m;
        const transformed = {
          temperature: units === "imperial" ? celsiusToFahrenheit(tempC) : tempC,
          windSpeed: json.current.wind_speed_10m,
          weatherCode: json.current.weather_code,
        };
        if (!cancelled) {
          setState({ data: transformed, isLoading: false, isStale: false, error: null, lastUpdated: Date.now() });
        }
      } catch (err) {
        if (!cancelled && err.name !== "AbortError") {
          setState((prev) => ({ ...prev, isLoading: false, error: err, isStale: true }));
        }
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS[refreshRate]);
    return () => { cancelled = true; controller?.abort(); clearInterval(id); };
  }, [lat, lon, units, refreshRate]);

  return state;
}
```

### 18.3 `src/components/InstrumentGauge.jsx` (a shared component, kept dumb on purpose)

```jsx
export function InstrumentGauge({ label, value, unit, status = "nominal", trend = null }) {
  const trendGlyph = { up: "▲", down: "▼", flat: "▬" }[trend] ?? "";
  return (
    <div className={`instrument-gauge instrument-gauge--${status}`}>
      <span className="instrument-gauge__label">{label}</span>
      <span className="instrument-gauge__value">
        {value ?? "—"}<span className="instrument-gauge__unit">{unit}</span>
      </span>
      {trend && <span className="instrument-gauge__trend">{trendGlyph}</span>}
    </div>
  );
}
```

`InstrumentGauge` never imports a hook, never calls `fetch`, never knows what API its number came from — the owning page formats the value via `utils/formatters.js` first. This separation is what keeps `components/` genuinely reusable rather than each gauge being secretly a one-off.

### 18.4 `src/App.jsx` (the composition root — short on purpose)

```jsx
import { HashRouter } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { AppRouter } from "./router.jsx";
import { Starfield } from "./components/Starfield.jsx";
import { NavRail } from "./components/NavRail.jsx";
import { OfflineBanner } from "./components/OfflineBanner.jsx";

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <Starfield />
        <OfflineBanner />
        <div className="app-shell">
          <NavRail />
          <AppRouter />
        </div>
      </HashRouter>
    </SettingsProvider>
  );
}
```

Nothing else belongs in `App.jsx`. If a future feature needs more than this, it belongs in a new file in the right folder, not appended here.

---

## 19. Requirements traceability — everything requested, confirmed present

A running record so nothing discussed gets silently dropped as the prompt evolved. Every item below maps to a live section of this document, not a leftover intention.

| Requirement, as given | Where it lives now |
|---|---|
| Multi-page website (not one long scroll) | §4 — six real routed pages |
| "Runs from index file" / single entry point | §0 — `index.html` mounts `<div id="root">`, `main.jsx` is the one JS entry |
| Complete tech stack only: HTML, CSS, vanilla JS, React | §3 — every layer mapped to a folder, no framework, no extra library beyond Three.js for the globe (already named in the original brief's API/animation list) |
| Files/folders organized by purpose, easy to decode | §0 — full folder-per-purpose scaffold, naming rule, one-directional dependency flow |
| Advanced, unique, hi-tech, beautiful, professional aesthetic | §2 (full design system), §10 (design rationale explaining *why*), §14 (elevated polish elements) |
| Useful, fully functional on all devices | §8 (responsive breakpoints 320–1440px), §4.3/§4.5 (Compare and Settings as genuinely useful, not decorative, pages) |
| More elements added for aesthetic/usefulness | §4.3 Compare, §4.4 Journal, §4.5 Settings, §14 (starfield, shortcuts, export, onboarding, offline banner, print sheet) |
| Bug-less, error-less | §6.1 (mandatory fetch/cleanup pattern), §7 (error/stale/empty states), §15 (line-by-line pre-submission checklist) |
| Detailed and deep, not superficial | §18 (concrete reference code for every file type: context, hook, component, root) |
| Based only on the attached rubric PDF and syllabus image | §17 (explicit line-by-line mapping of every section back to a named syllabus row or rubric criterion) |
| Built with an agentic coding tool (Antigravity) | §11 (step-by-step, one-commit-per-step build order suited to iterative agentic use), kickoff block at the top of this file |
| "My perfect frontend project" | The document as a whole — concept (§1) through final reminder (§16) form one coherent, non-contradictory brief |

If a future instruction changes one of the above, update the corresponding section directly rather than appending a contradictory new one — this table only stays true if the document it describes stays internally consistent.
