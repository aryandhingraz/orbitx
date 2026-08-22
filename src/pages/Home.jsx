import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from '../globe/Globe.jsx';
import { OrbitRing } from '../components/OrbitRing.jsx';
import { DataPanel } from '../components/DataPanel.jsx';
import { InstrumentStrip } from '../components/InstrumentStrip.jsx';
import { InstrumentGauge } from '../components/InstrumentGauge.jsx';
import { ErrorBadge } from '../components/ErrorBadge.jsx';
import { SkeletonPulse } from '../components/SkeletonPulse.jsx';
import { AstronomyCountdown } from '../components/AstronomyCountdown.jsx';
import { Legend } from '../components/Legend.jsx';

import { useTelemetry } from '../context/TelemetryContext.jsx';
import { useWeather } from '../hooks/useWeather.js';
import { useAirQuality } from '../hooks/useAirQuality.js';
import { useSunAndMoon } from '../hooks/useSunAndMoon.js';
import { useWorldClocks } from '../hooks/useWorldClocks.js';
import { useGlobalCitySnapshot } from '../hooks/useGlobalCitySnapshot.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatTemperature, formatCoordinate, formatCurrency } from '../utils/formatters.js';

const VISITED_KEY = 'orbitx-visited';

const GLOBE_LAYERS = [
  { id: 'overview', label: 'Overview' },
  { id: 'weather', label: 'Weather Layer' },
  { id: 'aqi', label: 'Air Quality Layer' },
  { id: 'seismic', label: 'Seismic Layer' },
  { id: 'satellites', label: 'Satellites Layer' },
];

function getTimeAgo(timestamp) {
  if (!timestamp) return 'Live';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m ago`;
}

export function Home() {
  const { units } = useSettings();
  const navigate = useNavigate();

  const { geo, weather, airQuality, iss, quakes, currency } = useTelemetry();
  const lat = geo.data?.latitude;
  const lon = geo.data?.longitude;

  const sunMoon = useSunAndMoon(lat, lon);
  const worldClocks = useWorldClocks();
  const globalCitySnapshot = useGlobalCitySnapshot();

  const [activeLayer, setActiveLayer] = useState('overview');
  const [activePanelRing, setActivePanelRing] = useState(null);
  const [selectedGlobeMarker, setSelectedGlobeMarker] = useState(null);
  const [clickedCoord, setClickedCoord] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // On-demand weather & AQI fetch for clicked globe surface coordinates (§3)
  const coordWeather = useWeather(clickedCoord?.lat, clickedCoord?.lon);
  const coordAQI = useAirQuality(clickedCoord?.lat, clickedCoord?.lon);

  useEffect(() => {
    try {
      const visited = localStorage.getItem(VISITED_KEY);
      if (!visited) {
        setShowOnboarding(true);
      }
    } catch {
      // ignore
    }
  }, []);

  function handleDismissOnboarding() {
    setShowOnboarding(false);
    try {
      localStorage.setItem(VISITED_KEY, 'true');
    } catch {
      // ignore
    }
  }

  function handleMarkerClick(ringId) {
    setActivePanelRing((prev) => (prev === ringId ? null : ringId));
    setSelectedGlobeMarker(null);
    setClickedCoord(null);
  }

  function handleGlobeMarkerSelect(userData) {
    if (!userData) return;
    if (userData.kind === 'overview') {
      navigate('/explore', {
        state: { selectedCity: { name: userData.name, latitude: userData.lat, longitude: userData.lon } },
      });
      return;
    }
    setActivePanelRing(null);
    setClickedCoord(null);
    setSelectedGlobeMarker(userData);
  }

  // 3D Globe Surface Point/Region Click Handler (§3)
  function handleGlobeSurfaceSelect({ region, lat, lon }) {
    setActivePanelRing(null);
    setSelectedGlobeMarker(null);
    setClickedCoord({ region, lat, lon });
  }

  function handleClosePanel() {
    setActivePanelRing(null);
    setSelectedGlobeMarker(null);
    setClickedCoord(null);
  }

  const utcClock = worldClocks.data?.find((c) => c.code === 'UTC')?.timeString || '12:00:00 UTC';

  const layerLegendItems = {
    overview: [
      { color: 'var(--color-accent-teal)', label: 'Station Telemetry Waypoint (Click to Explore)' },
    ],
    weather: [
      { color: 'var(--color-success-bright)', label: 'Nominal / Mild Temp' },
      { color: 'var(--color-info)', label: 'Moderate Temp' },
      { color: 'var(--color-sale)', label: 'Extreme Temp Alert' },
    ],
    aqi: [
      { color: 'var(--color-success-bright)', label: 'Good AQI (0 - 50)' },
      { color: 'var(--color-info)', label: 'Moderate AQI (51 - 150)' },
      { color: 'var(--color-sale)', label: 'Unhealthy AQI (> 150)' },
    ],
    seismic: [
      { color: 'var(--color-info)', label: 'Mag < 5.0 (Moderate Quake)' },
      { color: 'var(--color-sale)', label: 'Mag ≥ 5.0 (Severe Quake)' },
    ],
    satellites: [
      { color: 'var(--color-accent-teal)', label: 'Live ISS Position Marker' },
    ],
  }[activeLayer] || [];

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      {/* Campaign Tile Hero Section */}
      <section className="campaign-tile" style={{ padding: 'var(--space-xl)', border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-soft-cloud)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
              <span className="swatch-dot"></span>
              <span className="badge-promo">ORBITX OBSERVATORY STATION 01</span>
            </div>
            <h1 className="mono-num" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-hero)', fontWeight: 700, lineHeight: 0.9, textTransform: 'uppercase', color: 'var(--color-ink)', margin: 'var(--space-xs) 0' }}>
              {utcClock}
            </h1>
            <p className="page-subtitle" style={{ marginTop: 'var(--space-xs)' }}>
              Telemetry Location: <strong>{geo.data?.cityLabel || 'GREENWICH OBSERVATORY'}</strong> ({formatCoordinate(lat, lon)})
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <span className="badge-promo">WEATHER: {getTimeAgo(weather.lastUpdated)}</span>
            <span className="badge-promo">ISS: {getTimeAgo(iss.lastUpdated)}</span>
            <span className="badge-promo">QUAKES: {getTimeAgo(quakes.lastUpdated)}</span>
          </div>
        </div>

        {/* Globe Dataset Layer Tab Strip */}
        <div className="tab-strip" style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-hairline-soft)' }}>
          {GLOBE_LAYERS.map((layer) => (
            <button
              key={layer.id}
              type="button"
              className={`filter-chip ${activeLayer === layer.id ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveLayer(layer.id)}
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Dynamic Globe Layer Legend */}
        <Legend title={`${activeLayer.toUpperCase()} LAYER COLOR KEY`} items={layerLegendItems} />
      </section>

      {/* Astronomy Countdown Widget */}
      <AstronomyCountdown
        sunrise={sunMoon.data?.sunrise}
        sunset={sunMoon.data?.sunset}
        moonPhaseName={sunMoon.data?.moonPhase?.name}
      />

      {/* Radial Orbit Ring System + WebGL Globe Center */}
      <div className="orbit-system-container">
        <Globe
          activeLayer={activeLayer}
          weatherData={weather.data}
          aqiData={airQuality.data}
          quakeData={quakes.data}
          issData={iss.data}
          citySnapshots={globalCitySnapshot.citySnapshots}
          onMarkerSelect={handleGlobeMarkerSelect}
          onGlobeSurfaceSelect={handleGlobeSurfaceSelect}
        />

        <OrbitRing
          ringId="inner"
          radiusPercent={36}
          ringClass="inner"
          isPaused={activePanelRing === 'inner'}
          onMarkerClick={handleMarkerClick}
          activeMarkerId={activePanelRing}
          markerAngle={sunMoon.data?.moonPhase?.illuminationPercent ? (sunMoon.data.moonPhase.illuminationPercent / 100) * 360 : 90}
          markerLabel={`LUNAR ${sunMoon.data?.moonPhase?.illuminationPercent ?? 50}%`}
          isStale={sunMoon.isStale}
        />

        <OrbitRing
          ringId="mid"
          radiusPercent={42}
          ringClass="mid"
          isPaused={activePanelRing === 'mid'}
          onMarkerClick={handleMarkerClick}
          activeMarkerId={activePanelRing}
          markerAngle={iss.data?.ringAngle ?? 210}
          markerLabel={`ISS ${iss.data?.altitude ? iss.data.altitude + 'km' : '25544'}`}
          isStale={iss.isStale}
        />

        <OrbitRing
          ringId="outer"
          radiusPercent={48}
          ringClass="outer"
          isPaused={activePanelRing === 'outer'}
          onMarkerClick={handleMarkerClick}
          activeMarkerId={activePanelRing}
          markerAngle={330}
          markerLabel="CLOCKS & FOREX"
          isStale={currency.isStale}
        />
      </div>

      {/* 6-Gauge Planetary Status Matrix */}
      <div style={{ marginTop: 'var(--space-md)' }}>
        <Legend title="GAUGE STATUS INDICATOR KEY" items={[
          { color: 'var(--color-success-bright)', label: 'Nominal Telemetry' },
          { color: 'var(--color-info)', label: 'Warning / Elevated' },
          { color: 'var(--color-sale)', label: 'Alert / Threshold Exceeded' },
        ]} />

        <InstrumentStrip>
          {weather.isLoading ? (
            <SkeletonPulse width="100%" height="84px" />
          ) : weather.error && !weather.data ? (
            <ErrorBadge message="Weather error" />
          ) : (
            <InstrumentGauge
              label="Local Temp"
              value={formatTemperature(weather.data?.temperature, units)}
              unit=""
              status="nominal"
              isStale={weather.isStale}
            />
          )}

          {airQuality.isLoading ? (
            <SkeletonPulse width="100%" height="84px" />
          ) : (
            <InstrumentGauge
              label="Air Quality"
              value={airQuality.data?.aqi ?? '—'}
              unit="AQI"
              status={airQuality.data?.statusColor || 'nominal'}
              isStale={airQuality.isStale}
            />
          )}

          {quakes.isLoading ? (
            <SkeletonPulse width="100%" height="84px" />
          ) : (
            <InstrumentGauge
              label="24h Quakes"
              value={quakes.data?.count ?? 0}
              unit="events"
              status={quakes.data?.status || 'nominal'}
              isStale={quakes.isStale}
            />
          )}

          {iss.isLoading ? (
            <SkeletonPulse width="100%" height="84px" />
          ) : (
            <InstrumentGauge
              label="ISS Speed"
              value={iss.data?.velocity ? Math.round(iss.data.velocity).toLocaleString() : '—'}
              unit="km/h"
              status="nominal"
              isStale={iss.isStale}
            />
          )}

          <InstrumentGauge
            label="Atmosphere"
            value={weather.data?.pressure ? Math.round(weather.data.pressure) : 1013}
            unit="hPa"
            status="nominal"
          />

          <InstrumentGauge
            label="Forex EUR"
            value={currency.data?.rates?.EUR ? formatCurrency(currency.data.rates.EUR, 'EUR') : '€0.92'}
            unit=""
            status="nominal"
          />
        </InstrumentStrip>
      </div>

      {/* First-Visit Onboarding Guide Modal */}
      {showOnboarding && (
        <DataPanel isOpen={true} title="Welcome to OrbitX Observatory" onClose={handleDismissOnboarding}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <p style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
              🌍 AN ANTIQUE OBSERVATORY DESK REBUILT WITH MODERN TELEMETRY SENSORS
            </p>
            <p style={{ color: 'var(--color-mute)' }}>
              OrbitX tracks planet Earth in real time using concentric orbit rings surrounding an interactive WebGL globe. Click any region or 3D pin marker on the sphere to view detailed telemetry popups!
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: 'var(--space-md)' }}
              onClick={handleDismissOnboarding}
            >
              INITIALIZE OBSERVATORY DESK
            </button>
          </div>
        </DataPanel>
      )}

      {/* Interactive 3D Globe Region Point-Click Detail Panel (§3) */}
      {clickedCoord && (
        <DataPanel isOpen={true} title={`Region Detail — ${clickedCoord.region}`} onClose={handleClosePanel}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="data-widget-card" style={{ borderLeft: '4px solid var(--color-accent-teal)' }}>
              <span className="instrument-gauge__label">Geographic Region & Coordinates</span>
              <span className="instrument-gauge__value" style={{ color: 'var(--color-accent-teal)' }}>
                {clickedCoord.region}
              </span>
              <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
                Exact Coordinates: {formatCoordinate(clickedCoord.lat, clickedCoord.lon)}
              </span>
            </div>

            <div className="data-widget-card">
              <span className="instrument-gauge__label">Current Regional Weather</span>
              {coordWeather.isLoading ? (
                <SkeletonPulse width="100%" height="40px" />
              ) : (
                <span className="instrument-gauge__value">
                  {formatTemperature(coordWeather.data?.temperature, units)}
                </span>
              )}
              <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
                Wind: {coordWeather.data?.windSpeed ?? 12} km/h • Humidity: {coordWeather.data?.humidity ?? 65}% • Pressure: {coordWeather.data?.pressure ?? 1013} hPa
              </span>
            </div>

            <div className="data-widget-card">
              <span className="instrument-gauge__label">Air Quality Readout</span>
              {coordAQI.isLoading ? (
                <SkeletonPulse width="100%" height="40px" />
              ) : (
                <span className="instrument-gauge__value" style={{ color: coordAQI.data?.statusColor || 'var(--color-success-bright)' }}>
                  {coordAQI.data?.aqi ?? 30} AQI ({coordAQI.data?.category || 'Good'})
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ textAlign: 'center' }}
              onClick={() => {
                navigate('/explore', {
                  state: {
                    selectedCity: {
                      name: `${clickedCoord.region} (${clickedCoord.lat.toFixed(1)}°, ${clickedCoord.lon.toFixed(1)}°)`,
                      latitude: clickedCoord.lat,
                      longitude: clickedCoord.lon,
                    },
                  },
                });
              }}
            >
              Explore this location →
            </button>
          </div>
        </DataPanel>
      )}

      {/* Interactive 3D Globe Marker Detail Panel */}
      {selectedGlobeMarker && (
        <DataPanel isOpen={true} title={`Globe Marker — ${selectedGlobeMarker.name}`} onClose={handleClosePanel}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {selectedGlobeMarker.kind === 'seismic' && (
              <>
                <div className="data-widget-card" style={{ borderLeft: '4px solid var(--color-sale)' }}>
                  <span className="instrument-gauge__label">Seismic Event Magnitude</span>
                  <span className="instrument-gauge__value" style={{ color: 'var(--color-sale)', fontSize: 'var(--text-heading-xl)' }}>
                    Mag {selectedGlobeMarker.mag?.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
                    {selectedGlobeMarker.name} ({formatCoordinate(selectedGlobeMarker.lat, selectedGlobeMarker.lon)})
                  </span>
                </div>
                <div className="data-widget-card">
                  <span className="instrument-gauge__label">Timestamp</span>
                  <span className="instrument-gauge__value" style={{ fontSize: 'var(--text-body-md)' }}>
                    {new Date(selectedGlobeMarker.time).toLocaleString()}
                  </span>
                </div>
                <a
                  href={selectedGlobeMarker.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textAlign: 'center' }}
                >
                  View on USGS Observatory ↗
                </a>
              </>
            )}

            {selectedGlobeMarker.kind === 'weather' && (
              <>
                <div className="data-widget-card">
                  <span className="instrument-gauge__label">City Location</span>
                  <span className="instrument-gauge__value">{selectedGlobeMarker.name}</span>
                  <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
                    {formatCoordinate(selectedGlobeMarker.lat, selectedGlobeMarker.lon)}
                  </span>
                </div>
                <div className="data-widget-card">
                  <span className="instrument-gauge__label">Temperature & Atmosphere</span>
                  <span className="instrument-gauge__value">{selectedGlobeMarker.temp}°</span>
                  <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
                    Wind: {selectedGlobeMarker.wind} km/h • Humidity: {selectedGlobeMarker.humidity}% • Pressure: {selectedGlobeMarker.pressure} hPa
                  </span>
                </div>
              </>
            )}

            {selectedGlobeMarker.kind === 'aqi' && (
              <>
                <div className="data-widget-card" style={{ borderLeft: `4px solid ${selectedGlobeMarker.status}` }}>
                  <span className="instrument-gauge__label">Air Quality Index</span>
                  <span className="instrument-gauge__value" style={{ color: selectedGlobeMarker.status, fontSize: 'var(--text-heading-xl)' }}>
                    {selectedGlobeMarker.aqi} AQI
                  </span>
                  <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
                    Category: {selectedGlobeMarker.category} • {selectedGlobeMarker.name}
                  </span>
                </div>
              </>
            )}

            {selectedGlobeMarker.kind === 'satellite' && (
              <>
                <div className="data-widget-card">
                  <span className="instrument-gauge__label">Live Satellite Telemetry</span>
                  <span className="instrument-gauge__value">{selectedGlobeMarker.name}</span>
                  <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
                    Altitude: {selectedGlobeMarker.altitude}km • Speed: {selectedGlobeMarker.velocity}km/h • Visibility: {selectedGlobeMarker.visibility}
                  </span>
                </div>
              </>
            )}
          </div>
        </DataPanel>
      )}

      {/* Orbit Ring Sliding Telemetry Data Panels */}
      <DataPanel
        isOpen={activePanelRing !== null && !showOnboarding && !selectedGlobeMarker && !clickedCoord}
        title={
          activePanelRing === 'inner'
            ? 'Solar Terminator & Lunar Telemetry'
            : activePanelRing === 'mid'
            ? 'ISS Satellite Orbit (ZARYA-25544)'
            : 'World Clocks & Currency Rates'
        }
        onClose={handleClosePanel}
      >
        {activePanelRing === 'inner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="data-widget-card">
              <span className="instrument-gauge__label">Moon Phase</span>
              <span className="instrument-gauge__value">
                {sunMoon.data?.moonPhase?.glyph} {sunMoon.data?.moonPhase?.name}
              </span>
              <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
                Illumination: {sunMoon.data?.moonPhase?.illuminationPercent}%
              </span>
            </div>
            <div className="data-widget-card">
              <span className="instrument-gauge__label">Sunrise & Sunset</span>
              <span className="instrument-gauge__value" style={{ fontSize: 'var(--text-body-md)' }}>
                🌅 {sunMoon.data?.sunrise ? new Date(sunMoon.data.sunrise).toLocaleTimeString() : '06:12 AM'}
              </span>
              <span className="instrument-gauge__value" style={{ fontSize: 'var(--text-body-md)', marginTop: '4px' }}>
                🌇 {sunMoon.data?.sunset ? new Date(sunMoon.data.sunset).toLocaleTimeString() : '06:45 PM'}
              </span>
            </div>
          </div>
        )}

        {activePanelRing === 'mid' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="data-widget-card">
              <span className="instrument-gauge__label">Live Position</span>
              <span className="instrument-gauge__value">
                {formatCoordinate(iss.data?.latitude, iss.data?.longitude)}
              </span>
            </div>
            <div className="data-widget-card">
              <span className="instrument-gauge__label">Altitude & Speed</span>
              <span className="instrument-gauge__value">
                {iss.data?.altitude ?? 418} km @ {iss.data?.velocity ? Math.round(iss.data.velocity).toLocaleString() : 27580} km/h
              </span>
            </div>
            <div className="data-widget-card">
              <span className="instrument-gauge__label">Orbital Visibility</span>
              <span className="instrument-gauge__value" style={{ textTransform: 'capitalize' }}>
                {iss.data?.visibility ?? 'Daylight'}
              </span>
            </div>
          </div>
        )}

        {activePanelRing === 'outer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginBottom: '8px', textTransform: 'uppercase' }}>
                GLOBAL CLOCKS (1s Tick)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {worldClocks.data?.map((clock) => (
                  <div key={clock.code} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption-sm)', background: 'var(--color-soft-cloud)', padding: '8px 12px', border: '1px solid var(--color-hairline)' }}>
                    <span>{clock.name} ({clock.code})</span>
                    <span style={{ color: 'var(--color-accent-teal)', fontWeight: 600 }}>{clock.timeString}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginBottom: '8px', marginTop: '12px', textTransform: 'uppercase' }}>
                FOREX RATES (1 USD Base)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption-sm)' }}>
                {currency.data?.rates &&
                  Object.entries(currency.data.rates).slice(0, 6).map(([curr, rate]) => (
                    <div key={curr} style={{ background: 'var(--color-soft-cloud)', padding: '8px', border: '1px solid var(--color-hairline)' }}>
                      <span style={{ color: 'var(--color-mute)' }}>{curr}: </span>
                      <span>{formatCurrency(rate, curr)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </DataPanel>
    </div>
  );
}
