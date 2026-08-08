import { useState, useEffect } from 'react';
import { Globe } from '../globe/Globe.jsx';
import { OrbitRing } from '../components/OrbitRing.jsx';
import { DataPanel } from '../components/DataPanel.jsx';
import { InstrumentStrip } from '../components/InstrumentStrip.jsx';
import { InstrumentGauge } from '../components/InstrumentGauge.jsx';
import { ErrorBadge } from '../components/ErrorBadge.jsx';
import { SkeletonPulse } from '../components/SkeletonPulse.jsx';

import { useGeolocation } from '../hooks/useGeolocation.js';
import { useWeather } from '../hooks/useWeather.js';
import { useAirQuality } from '../hooks/useAirQuality.js';
import { useSunAndMoon } from '../hooks/useSunAndMoon.js';
import { useISS } from '../hooks/useISS.js';
import { useQuakes } from '../hooks/useQuakes.js';
import { useCurrency } from '../hooks/useCurrency.js';
import { useWorldClocks } from '../hooks/useWorldClocks.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatTemperature, formatCoordinate, formatCurrency } from '../utils/formatters.js';
import { playTelemetryClick } from '../utils/soundSynthesizer.js';

const VISITED_KEY = 'orbitx-visited';

export function Home() {
  const { units, soundEnabled } = useSettings();
  const geo = useGeolocation();
  const lat = geo.data?.latitude;
  const lon = geo.data?.longitude;

  const weather = useWeather(lat, lon);
  const airQuality = useAirQuality(lat, lon);
  const sunMoon = useSunAndMoon(lat, lon);
  const iss = useISS();
  const quakes = useQuakes();
  const currency = useCurrency('USD');
  const worldClocks = useWorldClocks();

  const [activePanelRing, setActivePanelRing] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    playTelemetryClick(soundEnabled);
    setShowOnboarding(false);
    try {
      localStorage.setItem(VISITED_KEY, 'true');
    } catch {
      // ignore
    }
  }

  function handleMarkerClick(ringId) {
    playTelemetryClick(soundEnabled);
    setActivePanelRing((prev) => (prev === ringId ? null : ringId));
  }

  function handleClosePanel() {
    playTelemetryClick(soundEnabled);
    setActivePanelRing(null);
  }

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <header className="page-header">
        <h1 className="page-title">
          Earth Observatory
          <span className="page-title__tag">ORBITX-01</span>
        </h1>
        <p className="page-subtitle">
          Telemetry Station: <span style={{ color: 'var(--brass)' }}>{geo.data?.cityLabel || 'Locating...'}</span> ({formatCoordinate(lat, lon)})
        </p>
      </header>

      {/* Radial Orbit Ring System + WebGL Globe Center (§2.4, §2.5) */}
      <div className="orbit-system-container">
        <Globe />

        {/* Inner Ring: Solar Terminator & Moon Phase */}
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

        {/* Mid Ring: ISS Satellite Live Position (5-sec updates) */}
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

        {/* Outer Ring: World Clocks & Currency Exchange */}
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

      {/* 6-Gauge Planetary Status Matrix (§2.4) */}
      <InstrumentStrip>
        {weather.isLoading ? (
          <SkeletonPulse width="165px" height="68px" />
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
          <SkeletonPulse width="165px" height="68px" />
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
          <SkeletonPulse width="165px" height="68px" />
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
          <SkeletonPulse width="165px" height="68px" />
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

      {/* First-Visit Onboarding Guide Modal (§14) */}
      {showOnboarding && (
        <DataPanel isOpen={true} title="Welcome to OrbitX Observatory" onClose={handleDismissOnboarding}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
            <p style={{ color: 'var(--brass)', fontWeight: 600 }}>
              🌍 AN ANTIQUE OBSERVATORY DESK REBUILT WITH MODERN WEBGL TELEMETRY SENSORS
            </p>
            <p>
              OrbitX tracks planet Earth in real time using concentric orbit rings surrounding a WebGL globe:
            </p>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Outer Ring:</strong> Global World Clocks (1s tick) & Forex exchange rates.</li>
              <li><strong>Mid Ring:</strong> ISS Space Station live position (updated every 5 seconds).</li>
              <li><strong>Inner Ring:</strong> Solar Terminator & Conway Lunar synodic phase.</li>
            </ul>
            <p style={{ color: 'var(--parchment-dim)' }}>
              Click any glowing brass ring marker to pause rotation and inspect live telemetry drawers!
            </p>
            <button
              type="button"
              className="journal-btn"
              style={{ marginTop: '12px', textAlign: 'center', justifyContent: 'center' }}
              onClick={handleDismissOnboarding}
            >
              INITIALIZE OBSERVATORY DESK
            </button>
          </div>
        </DataPanel>
      )}

      {/* Sliding Telemetry Data Panel (§2.5, §5) */}
      <DataPanel
        isOpen={activePanelRing !== null && !showOnboarding}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="instrument-gauge">
              <span className="instrument-gauge__label">Moon Phase</span>
              <span className="instrument-gauge__value">
                {sunMoon.data?.moonPhase?.glyph} {sunMoon.data?.moonPhase?.name}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--parchment-dim)' }}>
                Illumination: {sunMoon.data?.moonPhase?.illuminationPercent}%
              </span>
            </div>
            <div className="instrument-gauge">
              <span className="instrument-gauge__label">Sunrise & Sunset</span>
              <span className="instrument-gauge__value" style={{ fontSize: '14px' }}>
                🌅 {sunMoon.data?.sunrise ? new Date(sunMoon.data.sunrise).toLocaleTimeString() : '06:12 AM'}
              </span>
              <span className="instrument-gauge__value" style={{ fontSize: '14px', marginTop: '4px' }}>
                🌇 {sunMoon.data?.sunset ? new Date(sunMoon.data.sunset).toLocaleTimeString() : '06:45 PM'}
              </span>
            </div>
          </div>
        )}

        {activePanelRing === 'mid' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="instrument-gauge">
              <span className="instrument-gauge__label">Live Position</span>
              <span className="instrument-gauge__value">
                {formatCoordinate(iss.data?.latitude, iss.data?.longitude)}
              </span>
            </div>
            <div className="instrument-gauge">
              <span className="instrument-gauge__label">Altitude & Speed</span>
              <span className="instrument-gauge__value">
                {iss.data?.altitude ?? 418} km @ {iss.data?.velocity ? Math.round(iss.data.velocity).toLocaleString() : 27580} km/h
              </span>
            </div>
            <div className="instrument-gauge">
              <span className="instrument-gauge__label">Orbital Visibility</span>
              <span className="instrument-gauge__value" style={{ textTransform: 'capitalize' }}>
                {iss.data?.visibility ?? 'Daylight'}
              </span>
            </div>
          </div>
        )}

        {activePanelRing === 'outer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--brass)', marginBottom: '8px' }}>
                GLOBAL CLOCKS (1s Tick)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {worldClocks.data?.map((clock) => (
                  <div key={clock.code} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '13px', background: 'var(--panel-raised)', padding: '6px 10px', borderRadius: '4px' }}>
                    <span>{clock.name} ({clock.code})</span>
                    <span style={{ color: 'var(--brass)' }}>{clock.timeString}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--brass)', marginBottom: '8px', marginTop: '12px' }}>
                FOREX RATES (1 USD Base)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                {currency.data?.rates &&
                  Object.entries(currency.data.rates).slice(0, 6).map(([curr, rate]) => (
                    <div key={curr} style={{ background: 'var(--panel-raised)', padding: '6px', borderRadius: '4px' }}>
                      <span style={{ color: 'var(--parchment-dim)' }}>{curr}: </span>
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
