import { useSpaceWeather } from '../hooks/useSpaceWeather.js';
import { InstrumentGauge } from '../components/InstrumentGauge.jsx';
import { SkeletonPulse } from '../components/SkeletonPulse.jsx';
import { SpaceWeatherTrendChart } from '../components/SpaceWeatherTrendChart.jsx';
import { Legend } from '../components/Legend.jsx';

export function SpaceWeather() {
  const spaceWeather = useSpaceWeather();
  const data = spaceWeather.data;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Solar & Space Weather Station
          <span className="page-title__tag">NOAA SWPC TELEMETRY</span>
        </h1>
        <p className="page-subtitle">
          Real-time planetary K-index, geomagnetic storm prediction, solar wind plasma, & aurora visibility telemetry
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
              Planetary K-Index: Kp {data?.kpIndex ?? 2}
            </h2>
          </div>

          <span className="badge-promo" style={{ color: data?.kpStatus === 'alert' ? 'var(--color-sale)' : 'var(--color-accent-teal)', borderColor: data?.kpStatus === 'alert' ? 'var(--color-sale)' : 'var(--color-accent-teal)' }}>
            Aurora Likelihood: {data?.auroraLikelihood || 'Low'}
          </span>
        </div>

        {/* Geomagnetic Storm Status Legend (§2.2 Item 6) */}
        <Legend title="GEOMAGNETIC K-INDEX STATUS KEY" items={[
          { color: 'var(--color-success-bright)', label: 'Kp 0 - 3 (Quiet / Nominal)' },
          { color: 'var(--color-info)', label: 'Kp 4 (Unsettled / Active)' },
          { color: 'var(--color-sale)', label: 'Kp ≥ 5 (Geomagnetic Storm Alert)' },
        ]} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
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
            value={data?.solarWindSpeed || 450}
            unit="km/s"
            status="nominal"
          />

          <InstrumentGauge
            label="Solar Wind Density"
            value={data?.solarWindDensity || '5.2'}
            unit="p/cm³"
            status="nominal"
          />

          <InstrumentGauge
            label="Aurora Visibility"
            value={data?.auroraLikelihood || 'Low'}
            unit=""
            status={data?.kpStatus || 'nominal'}
          />
        </div>
      </section>

      {/* 24-Hour K-Index Trend Chart */}
      <SpaceWeatherTrendChart kHistory={data?.kHistory || []} />

      {/* Solar Physics Reference Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-xl)' }}>
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
