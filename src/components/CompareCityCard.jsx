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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {weather.isLoading ? (
          <SkeletonPulse width="100%" height="54px" />
        ) : (
          <InstrumentGauge
            label="Temperature"
            value={formatTemperature(weather.data?.temperature, units)}
            unit=""
            status="nominal"
          />
        )}

        {airQuality.isLoading ? (
          <SkeletonPulse width="100%" height="54px" />
        ) : (
          <InstrumentGauge
            label="Air Quality"
            value={airQuality.data?.aqi ?? '—'}
            unit="AQI"
            status={airQuality.data?.statusColor || 'nominal'}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="instrument-gauge">
          <span className="instrument-gauge__label">Wind Speed</span>
          <span className="instrument-gauge__value" style={{ fontSize: '15px' }}>
            {formatWindSpeed(weather.data?.windSpeed, units)}
          </span>
        </div>
        <div className="instrument-gauge">
          <span className="instrument-gauge__label">Sunrise / Sunset</span>
          <span className="instrument-gauge__value" style={{ fontSize: '11px' }}>
            🌅 {sunMoon.data?.sunrise ? new Date(sunMoon.data.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
            <br />
            🌇 {sunMoon.data?.sunset ? new Date(sunMoon.data.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
