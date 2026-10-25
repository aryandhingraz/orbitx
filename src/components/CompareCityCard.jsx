import { useSunAndMoon } from '../hooks/useSunAndMoon.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatTemperature, formatWindSpeed, formatCoordinate } from '../utils/formatters.js';
import { InstrumentGauge } from './InstrumentGauge.jsx';
import { SkeletonPulse } from './SkeletonPulse.jsx';

export function CompareCityCard({ city, weatherData, aqiData, onRemove }) {
  const { units } = useSettings();
  const sunMoon = useSunAndMoon(city.latitude, city.longitude);

  const weather = weatherData || {};
  const airQuality = aqiData || {};

  return (
    <div className="compare-card data-widget-card" style={{ gap: 'var(--space-md)' }}>
      <div className="compare-card__header">
        <div style={{ minWidth: 0 }}>
          <h2 className="compare-card__name" title={city.name}>{city.name}</h2>
          <span className="compare-card__country" title={`${city.country} • ${formatCoordinate(city.latitude, city.longitude)}`}>
            {city.country} • {formatCoordinate(city.latitude, city.longitude)}
          </span>
        </div>
        <button
          type="button"
          className="btn-icon-circular"
          onClick={onRemove}
          aria-label={`Remove ${city.name} from comparison`}
          title={`Remove ${city.name}`}
          style={{ width: '32px', height: '32px', fontSize: '12px' }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: 'var(--space-sm)', minWidth: 0 }}>
        {!weather.temperature && weather.temperature !== 0 ? (
          <SkeletonPulse width="100%" height="84px" />
        ) : (
          <InstrumentGauge
            label="Temperature"
            value={formatTemperature(weather.temperature, units)}
            unit=""
            status="nominal"
          />
        )}

        {!airQuality.aqi && airQuality.aqi !== 0 ? (
          <SkeletonPulse width="100%" height="84px" />
        ) : (
          <InstrumentGauge
            label="Air Quality"
            value={airQuality.aqi ?? '—'}
            unit="AQI"
            status={airQuality.aqi > 150 ? 'alert' : airQuality.aqi > 50 ? 'warning' : 'nominal'}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: 'var(--space-sm)', minWidth: 0 }}>
        <InstrumentGauge
          label="Wind Speed"
          value={formatWindSpeed(weather.windSpeed, units)}
          unit=""
          status="nominal"
        />

        <InstrumentGauge
          label="Pressure"
          value={weather.pressure ? Math.round(weather.pressure) : 1013}
          unit="hPa"
          status="nominal"
        />
      </div>

      <div className="instrument-gauge" style={{ minHeight: '76px' }}>
        <span className="instrument-gauge__label">Solar Schedule</span>
        <div style={{ display: 'flex', gap: '12px', fontSize: 'var(--text-caption-sm)', fontFamily: 'var(--font-mono)', paddingTop: '4px', flexWrap: 'wrap' }}>
          <span>🌅 {sunMoon.data?.sunrise ? new Date(sunMoon.data.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:12 AM'}</span>
          <span style={{ color: 'var(--color-mute)' }}>|</span>
          <span>🌇 {sunMoon.data?.sunset ? new Date(sunMoon.data.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:45 PM'}</span>
        </div>
      </div>
    </div>
  );
}
