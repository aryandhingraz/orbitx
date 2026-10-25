import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCity, removeCity } from '../store/compareCitiesSlice.js';
import { showToast } from '../store/uiSlice.js';
import { useGeocodingSearch } from '../hooks/useGeocodingSearch.js';
import { useMultiCityTelemetry } from '../hooks/useMultiCityTelemetry.js';
import { CompareCityCard } from '../components/CompareCityCard.jsx';
import { RadarChart } from '../components/RadarChart.jsx';
import { Legend } from '../components/Legend.jsx';
import { RADAR_CITY_COLORS } from '../utils/colorTokens.js';
import '../styles/components/compare.css';

export function Compare() {
  const [searchTerm, setSearchTerm] = useState('');
  const cities = useSelector((state) => state.compareCities.cities);
  const dispatch = useDispatch();

  const [viewMode, setViewMode] = useState('gauges'); // 'gauges' | 'table'

  const { results, isLoading } = useGeocodingSearch(searchTerm);
  const multiTelemetry = useMultiCityTelemetry(cities);

  function handleSelectCity(city) {
    if (cities.length >= 4) {
      dispatch(showToast({ message: 'Maximum of 4 cities can be compared simultaneously.', type: 'sale' }));
      return;
    }
    if (cities.some((c) => c.name.toLowerCase() === city.name.toLowerCase())) {
      dispatch(showToast({ message: `${city.name} is already in comparison matrix.`, type: 'info' }));
      setSearchTerm('');
      return;
    }
    dispatch(addCity(city));
    dispatch(showToast({ message: `${city.name} added to comparison matrix.`, type: 'success' }));
    setSearchTerm('');
  }

  function handleRemoveCity(id) {
    const target = cities.find((c) => c.id === id);
    dispatch(removeCity(id));
    dispatch(showToast({ message: `${target?.name || 'City'} removed from comparison.`, type: 'info' }));
  }

  const radarData = cities.map((c) => {
    const t = multiTelemetry[c.id];
    const temp = t?.weather?.temperature ?? 15;
    const aqi = t?.airQuality?.aqi ?? 25;
    const wind = t?.weather?.windSpeed ?? 12;
    const press = t?.weather?.pressure ?? 1013;
    const hum = t?.weather?.humidity ?? 65;

    const tempNorm = Math.max(0.1, Math.min(1.0, (temp + 10) / 50));
    const aqiNorm = Math.max(0.1, Math.min(1.0, 1.0 - (aqi / 200)));
    const windNorm = Math.max(0.1, Math.min(1.0, wind / 60));
    const pressNorm = Math.max(0.1, Math.min(1.0, (press - 980) / 60));
    const humNorm = Math.max(0.1, Math.min(1.0, hum / 100));

    return {
      name: c.name,
      normalizedValues: [tempNorm, aqiNorm, windNorm, pressNorm, humNorm],
    };
  });

  // Radar Legend Items mapped 1:1 to compared cities (§2.2 Item 4)
  const radarLegendItems = cities.map((c, idx) => ({
    color: RADAR_CITY_COLORS[idx % RADAR_CITY_COLORS.length].css,
    label: c.name,
  }));

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          City Comparator
          <span className="page-title__tag">4-CITY MATRIX</span>
        </h1>
        <p className="page-subtitle">
          Cross-examine climate, AQI, & environmental telemetry across up to 4 global cities
        </p>
      </header>

      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div className="compare-search min-w-0">
          <div className="search-pill-wrapper">
            <span className="search-pill-icon">🔍</span>
            <input
              type="text"
              className="search-pill"
              placeholder="Search city to add for comparison (e.g. New Delhi, Mumbai, Bengaluru, London)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search city name for comparison"
            />
          </div>

          {/* Quick Preset Cities to Add (§7 India-First) */}
          {cities.length < 4 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>Quick Add:</span>
              {[
                { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 },
                { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777 },
                { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946 },
                { name: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639 },
                { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
                { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
              ]
                .filter((p) => !cities.some((c) => c.name.toLowerCase() === p.name.toLowerCase()))
                .slice(0, 4)
                .map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    className="filter-chip"
                    style={{ fontSize: '11px', padding: '3px 10px' }}
                    onClick={() => handleSelectCity(preset)}
                  >
                    + {preset.name}
                  </button>
                ))}
            </div>
          )}

          {searchTerm.trim().length >= 2 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-none)', zIndex: 50, maxHeight: '300px', overflowY: 'auto' }}>
              {isLoading ? (
                <div style={{ padding: '12px 16px', color: 'var(--color-mute)' }}>Searching telemetry database...</div>
              ) : results.length === 0 ? (
                <div style={{ padding: '12px 16px', color: 'var(--color-mute)' }}>No cities found matching "{searchTerm}"</div>
              ) : (
                results.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    style={{ width: '100%', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-hairline-soft)', color: 'var(--color-ink)', cursor: 'pointer', background: 'transparent', display: 'flex', justifyContent: 'space-between' }}
                    onClick={() => handleSelectCity(city)}
                  >
                    <strong>{city.name}</strong>
                    <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)' }}>
                      {city.country} ({city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°)
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="tab-strip">
          <button
            type="button"
            className={`filter-chip ${viewMode === 'gauges' ? 'filter-chip--active' : ''}`}
            onClick={() => setViewMode('gauges')}
          >
            Gauge View
          </button>
          <button
            type="button"
            className={`filter-chip ${viewMode === 'table' ? 'filter-chip--active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Multi-Metric Canvas Radar Visualization with Legend (§2.2 Item 4) */}
      <div>
        <RadarChart citiesData={radarData} />
        <Legend title="RADAR CITY COLOR KEY" items={radarLegendItems} />
      </div>

      {/* View Mode Content Render */}
      {viewMode === 'gauges' ? (
        <div className="compare-grid">
          {cities.map((city) => (
            <CompareCityCard
              key={city.id}
              city={city}
              weatherData={multiTelemetry[city.id]?.weather}
              aqiData={multiTelemetry[city.id]?.airQuality}
              onRemove={() => handleRemoveCity(city.id)}
            />
          ))}
        </div>
      ) : (
        /* Table View with AQI Legend (§2.2 Item 5) */
        <div className="compare-table-container">
          <Legend title="TABLE AQI STATUS KEY" items={[
            { color: 'var(--color-success-bright)', label: 'Good AQI (0 - 50)' },
            { color: 'var(--color-info)', label: 'Moderate AQI (51 - 150)' },
            { color: 'var(--color-sale)', label: 'Unhealthy AQI (> 150)' },
          ]} />

          <table className="compare-table" style={{ marginTop: 'var(--space-xs)' }}>
            <thead>
              <tr>
                <th>City Name</th>
                <th>Coordinates</th>
                <th>Country</th>
                <th>Telemetry Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => {
                const aqiInfo = multiTelemetry[city.id]?.airQuality;
                const statusCategory = aqiInfo?.category || 'GOOD AQI';
                const statusColor = aqiInfo?.statusColor || 'var(--color-success-bright)';

                return (
                  <tr key={city.id}>
                    <td style={{ fontWeight: 600 }}>{city.name}</td>
                    <td className="font-mono">{city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°</td>
                    <td>{city.country}</td>
                    <td>
                      <span className="badge-promo" style={{ color: statusColor, borderColor: statusColor }}>
                        {statusCategory}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="badge-sale-text"
                        onClick={() => handleRemoveCity(city.id)}
                        style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
