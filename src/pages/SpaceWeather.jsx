import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSpaceWeather } from '../hooks/useSpaceWeather.js';
import { InstrumentGauge } from '../components/InstrumentGauge.jsx';
import { SkeletonPulse } from '../components/SkeletonPulse.jsx';
import { SpaceWeatherTrendChart } from '../components/SpaceWeatherTrendChart.jsx';
import { AuroraGlobe3D } from '../components/AuroraGlobe3D.jsx';
import { Legend } from '../components/Legend.jsx';
import { playTelemetryClick } from '../utils/soundSynthesizer.js';

export function SpaceWeather({ defaultTab = '3d-aurora' }) {
  const location = useLocation();
  const isAuroraRoute = location.pathname === '/aurora';

  const spaceWeather = useSpaceWeather();
  const data = spaceWeather.data;

  // Active Sub-Tab: '3d-aurora' | 'k-index' | 'solar-wind'
  const [activeTab, setActiveTab] = useState(isAuroraRoute ? '3d-aurora' : defaultTab);

  useEffect(() => {
    if (location.pathname === '/aurora') {
      setActiveTab('3d-aurora');
    }
  }, [location.pathname]);

  function handleTabChange(tab) {
    playTelemetryClick(true);
    setActiveTab(tab);
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          {isAuroraRoute || activeTab === '3d-aurora' ? '3D Aurora & Space Weather Station' : 'Solar & Space Weather Station'}
          <span className="page-title__tag">
            {isAuroraRoute || activeTab === '3d-aurora' ? '3D ATMOSPHERIC LIGHTING & NOAA TELEMETRY' : 'NOAA SWPC TELEMETRY'}
          </span>
        </h1>
        <p className="page-subtitle">
          Real-time planetary K-index, 3D WebGL Aurora Borealis visualizer, RTSW solar wind plasma, & IMF magnetosphere coupling
        </p>
      </header>

      {/* Hero Highlight Card */}
      <section className="data-widget-card" style={{ borderLeft: `4px solid ${data?.kpStatus === 'alert' ? 'var(--color-sale)' : 'var(--color-accent-teal)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <span className="swatch-dot" style={{ backgroundColor: data?.kpStatus === 'alert' ? 'var(--color-sale)' : 'var(--color-success-bright)' }}></span>
              <span className="badge-promo">GEOMAGNETIC ENVIRONMENT</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-lg)', color: 'var(--color-ink)', marginTop: '4px' }}>
              Planetary K-Index: Kp {data?.kpIndex ?? 2} • NOAA G-Scale: {data?.gScale || 'G0'}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
            <span className="badge-promo" style={{ color: data?.kpStatus === 'alert' ? 'var(--color-sale)' : 'var(--color-accent-teal)', borderColor: data?.kpStatus === 'alert' ? 'var(--color-sale)' : 'var(--color-accent-teal)' }}>
              Aurora Likelihood: {data?.auroraLikelihood || 'Low'}
            </span>
            <span className="badge-promo">
              IMF Bz: {data?.imfBz ?? -2.8} nT ({data?.imfBz < 0 ? 'Southward' : 'Northward'})
            </span>
          </div>
        </div>

        {/* 6-Gauge Space Weather Status Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
          {spaceWeather.isLoading ? (
            <SkeletonPulse width="100%" height="84px" />
          ) : (
            <InstrumentGauge
              label="Planetary K-Index"
              value={`Kp ${data?.kpIndex ?? 2}`}
              unit=""
              status={data?.kpStatus || 'nominal'}
            />
          )}

          <InstrumentGauge
            label="Solar Wind Speed"
            value={data?.solarWindSpeed || 420}
            unit="km/s"
            status="nominal"
          />

          <InstrumentGauge
            label="Proton Density"
            value={data?.solarWindDensity || '5.2'}
            unit="p/cm³"
            status="nominal"
          />

          <InstrumentGauge
            label="IMF Bz Component"
            value={`${data?.imfBz ?? -2.8}`}
            unit="nT"
            status={data?.imfBz < 0 ? 'nominal' : 'warning'}
          />

          <InstrumentGauge
            label="Auroral Power"
            value={data?.auroraPowerGW ?? 28}
            unit="GW"
            status="nominal"
          />

          <InstrumentGauge
            label="Equatorward Reach"
            value={`${data?.auroraMinLat ?? 60}°N`}
            unit=""
            status={data?.kpStatus || 'nominal'}
          />
        </div>

        {/* Primary Station Navigation Tabs (3D Aurora vs K-Index vs Solar Wind) */}
        <div className="tab-strip" style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-hairline-soft)' }}>
          <button
            type="button"
            className={`filter-chip ${activeTab === '3d-aurora' ? 'filter-chip--active' : ''}`}
            onClick={() => handleTabChange('3d-aurora')}
          >
            🌌 3D Aurora & Northern Lights
          </button>
          <button
            type="button"
            className={`filter-chip ${activeTab === 'k-index' ? 'filter-chip--active' : ''}`}
            onClick={() => handleTabChange('k-index')}
          >
            📊 24-Hour K-Index Profile
          </button>
          <button
            type="button"
            className={`filter-chip ${activeTab === 'solar-wind' ? 'filter-chip--active' : ''}`}
            onClick={() => handleTabChange('solar-wind')}
          >
            ⚡ Solar Wind & IMF Telemetry
          </button>
        </div>

        {/* Tab-Dependent Dynamic Color Legends */}
        {activeTab === '3d-aurora' && (
          <Legend
            title="3D AURORAL OVAL COLOR & VISIBILITY KEY"
            items={[
              { color: 'var(--color-accent-teal)', label: 'Oxygen Emission (557.7 nm Emerald Base Curtain)' },
              { color: '#A855F7', label: 'Nitrogen/Oxygen Crown (630.0 nm Violet Upper Curtain)' },
              { color: 'var(--color-success-bright)', label: 'Station Inside Oval (Overhead Aurora Visible)' },
              { color: 'var(--color-mute)', label: 'Station Below Viewing Threshold' },
            ]}
          />
        )}

        {activeTab === 'k-index' && (
          <Legend
            title="GEOMAGNETIC K-INDEX STATUS KEY"
            items={[
              { color: 'var(--color-success-bright)', label: 'Kp 0 - 3 (Quiet / Nominal)' },
              { color: 'var(--color-info)', label: 'Kp 4 (Unsettled / Active)' },
              { color: 'var(--color-sale)', label: 'Kp ≥ 5 (Geomagnetic Storm Alert)' },
            ]}
          />
        )}

        {activeTab === 'solar-wind' && (
          <Legend
            title="SOLAR WIND PLASMA & MAGNETOSPHERE KEY"
            items={[
              { color: 'var(--color-success-bright)', label: 'IMF Bz < 0 (Southward Direct Inflow)' },
              { color: 'var(--color-info)', label: 'IMF Bz ≥ 0 (Northward Repelling)' },
              { color: 'var(--color-sale)', label: 'Proton Speed > 500 km/s (Coronal Hole High Speed Stream)' },
            ]}
          />
        )}
      </section>

      {/* Render Active Tab View */}
      {activeTab === '3d-aurora' && (
        <AuroraGlobe3D
          kpIndex={data?.kpIndex ?? 2}
          imfBz={data?.imfBz ?? -2.8}
          solarWindSpeed={data?.solarWindSpeed ?? 420}
        />
      )}

      {activeTab === 'k-index' && (
        <SpaceWeatherTrendChart kHistory={data?.kHistory || []} />
      )}

      {activeTab === 'solar-wind' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'var(--space-xl)' }}>
          <div className="data-widget-card">
            <span className="badge-promo" style={{ color: 'var(--color-accent-teal)' }}>
              INTERPLANETARY MAGNETIC FIELD (IMF)
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', color: 'var(--color-ink)', marginTop: '4px' }}>
              Bz Orientation & Auroral Gate
            </h3>
            <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)' }}>
              Current Bz is <strong style={{ color: data?.imfBz < 0 ? 'var(--color-success-bright)' : 'var(--color-info)' }}>{data?.imfBz ?? -2.8} nT</strong> ({data?.bzDirection || 'Southward'}).
              When the interplanetary magnetic field points southward, it connects directly with Earth's magnetic lines, injecting high-energy solar wind electrons into the upper atmosphere to create brilliant dynamic auroral curtains.
            </p>
          </div>

          <div className="data-widget-card">
            <span className="badge-promo" style={{ color: 'var(--color-info)' }}>
              REAL-TIME SOLAR WIND PLASMA (RTSW)
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', color: 'var(--color-ink)', marginTop: '4px' }}>
              DSCOVR Satellite L1 Point Readout
            </h3>
            <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)' }}>
              Telemetry sampled 1.5 million kilometers sunward at the Sun-Earth L1 Lagrange point:
              Speed: <strong style={{ color: 'var(--color-ink)' }}>{data?.solarWindSpeed ?? 420} km/s</strong> •
              Density: <strong style={{ color: 'var(--color-ink)' }}>{data?.solarWindDensity ?? '5.2'} protons/cm³</strong> •
              Total Field Bt: <strong style={{ color: 'var(--color-ink)' }}>{data?.imfBt ?? 4.5} nT</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Solar Physics Reference Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-xl)' }}>
        <div className="data-widget-card">
          <span className="instrument-gauge__label">Geomagnetic K-Index Scale Rationale</span>
          <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '8px' }}>
            The Kp-index quantifies geomagnetic storm activity on a scale from 0 to 9. Values Kp ≥ 5 indicate a geomagnetic storm capable of triggering high-latitude auroras and orbital satellite drag.
          </p>
        </div>

        <div className="data-widget-card">
          <span className="instrument-gauge__label">NOAA SWPC Data Source</span>
          <p style={{ fontSize: 'var(--text-caption-md)', color: 'var(--color-mute)', marginTop: '8px' }}>
            Direct telemetry feeds provided by the NOAA Space Weather Prediction Center (SWPC) via real-time satellite plasma & magnetometers.
          </p>
        </div>
      </div>
    </div>
  );
}
