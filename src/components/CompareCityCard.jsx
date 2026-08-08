import { useWeather } from '../hooks/useWeather.js';
import { useAirQuality } from '../hooks/useAirQuality.js';
import { useSunAndMoon } from '../hooks/useSunAndMoon.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatTemperature, formatWindSpeed, formatCoordinate } from '../utils/formatters.js';
import { InstrumentGauge } from './InstrumentGauge.jsx';
import { SkeletonPulse } from './SkeletonPulse.jsx';

export function CompareCityCard({ city, onRemove }) {
  const { units } = useSettings();
  const weather = useWeather(city.latitude, city.longitude);
  const airQuality = useAirQuality(city.latitude, city.longitude);
  const sunMoon = useSunAndMoon(city.latitude, city.longitude);

  return (
    <div className="compare-card">
      <div className="compare-card__header">
        <div>
          <h2 className="compare-card__name">{city.name}</h2>
          <span className="compare-card__country">{city.country} • {formatCoordinate(city.latitude, city.longitude)}</span>
        </div>
        <button
          type="button"
          className="compare-card__remove"
          onClick={onRemove}
          aria-label={`Remove ${city.name} from comparison`}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {weather.isLoading ? (
          <SkeletonPulse width="100%" height="68px" />
        ) : (
          <InstrumentGauge
            label="Temperature"
            value={formatTemperature(weather.data?.temperature, units)}
            unit=""
            status="nominal"
          />
        )}

        {airQuality.isLoading ? (
          <SkeletonPulse width="100%" height="68px" />
        ) : (
          <InstrumentGauge
            label="Air Quality"
            value={airQuality.data?.aqi ?? '—'}
            unit="AQI"
            status={airQuality.data?.statusColor || 'nominal'}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <InstrumentGauge
          label="Wind Speed"
          value={formatWindSpeed(weather.data?.windSpeed, units)}
          unit=""
          status="nominal"
        />

        <InstrumentGauge
          label="Humidity & Pressure"
          value={`${weather.data?.humidity ?? 55}%`}
          unit={`${weather.data?.pressure ? Math.round(weather.data.pressure) : 1013} hPa`}
          status="nominal"
        />
      </div>

      <div className="instrument-gauge" style={{ minHeight: '76px' }}>
        <span className="instrument-gauge__label">Solar Schedule</span>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontFamily: 'var(--font-mono)', paddingTop: '4px' }}>
          <span>🌅 {sunMoon.data?.sunrise ? new Date(sunMoon.data.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:12 AM'}</span>
          <span style={{ color: 'var(--parchment-dim)' }}>|</span>
          <span>🌇 {sunMoon.data?.sunset ? new Date(sunMoon.data.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:45 PM'}</span>
        </div>
      </div>
    </div>
  );
}
