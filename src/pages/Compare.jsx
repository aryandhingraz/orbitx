import { useState } from 'react';
import { useGeocodingSearch } from '../hooks/useGeocodingSearch.js';
import { CompareCityCard } from '../components/CompareCityCard.jsx';
import '../styles/components/compare.css';

const DEFAULT_CITIES = [
  { id: 1, name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { id: 2, name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { id: 3, name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
];

export function Compare() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState(DEFAULT_CITIES);

  const { results, isLoading } = useGeocodingSearch(searchTerm);

  function handleSelectCity(city) {
    if (cities.length >= 3) {
      alert('Maximum of 3 cities can be compared simultaneously.');
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

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          City Comparator
          <span className="page-title__tag">MULTI-POINT</span>
        </h1>
        <p className="page-subtitle">
          Cross-examine climate & environmental telemetry across up to 3 global cities
        </p>
      </header>

      {/* City Search Input (§4.3) */}
      <div className="compare-search">
        <input
          type="text"
          className="compare-search__input"
          placeholder="🔍 Search city to compare (e.g. Paris, Sydney, Cairo)..."
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
