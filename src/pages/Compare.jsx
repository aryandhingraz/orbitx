import { useState } from 'react';
import { useGeocodingSearch } from '../hooks/useGeocodingSearch.js';
import { CompareCityCard } from '../components/CompareCityCard.jsx';
import { RadarChart } from '../components/RadarChart.jsx';
import '../styles/components/compare.css';

const DEFAULT_CITIES = [
  { id: 1, name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { id: 2, name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { id: 3, name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { id: 4, name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
];

export function Compare() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState(DEFAULT_CITIES);

  const { results, isLoading } = useGeocodingSearch(searchTerm);

  function handleSelectCity(city) {
    if (cities.length >= 4) {
      alert('Maximum of 4 cities can be compared simultaneously.');
      return;
    }
    if (cities.some((c) => c.name.toLowerCase() === city.name.toLowerCase())) {
      setSearchTerm('');
      return;
    }
    setCities((prev) => [...prev, city]);
    setSearchTerm('');
  }

  function handleRemoveCity(id) {
    setCities((prev) => prev.filter((c) => c.id !== id));
  }

  // Prepared normalized values for RadarChart
  const radarData = cities.map((c, idx) => ({
    name: c.name,
    normalizedValues: [
      0.4 + (idx * 0.15) % 0.5,
      0.3 + (idx * 0.2) % 0.6,
      0.5 + (idx * 0.1) % 0.4,
      0.7 - (idx * 0.1) % 0.3,
      0.6 + (idx * 0.1) % 0.3,
    ],
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

      {/* City Search Input (§4.3) */}
      <div className="compare-search">
        <input
          type="text"
          className="compare-search__input"
          placeholder="🔍 Search city to compare (e.g. Paris, Cairo, New Delhi)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search city name for comparison"
        />

        {/* Dropdown Results */}
        {searchTerm.trim().length >= 2 && (
          <ul className="compare-search__dropdown">
            {isLoading ? (
              <li className="compare-search__option">Searching telemetry database...</li>
            ) : results.length === 0 ? (
              <li className="compare-search__option">No cities found matching "{searchTerm}"</li>
            ) : (
              results.map((city) => (
                <li
                  key={city.id}
                  className="compare-search__option"
                  onClick={() => handleSelectCity(city)}
                >
                  <span style={{ fontWeight: 600 }}>{city.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--parchment-dim)' }}>
                    {city.country} ({city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°)
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Multi-Metric Canvas Radar Visualization */}
      <RadarChart citiesData={radarData} />

      {/* Side-by-Side Comparison Cards (§4.3) */}
      <div className="compare-grid">
        {cities.map((city) => (
          <CompareCityCard
            key={city.id}
            city={city}
            onRemove={() => handleRemoveCity(city.id)}
          />
        ))}
      </div>
    </div>
  );
}
