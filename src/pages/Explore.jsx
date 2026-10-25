import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addCity } from '../store/compareCitiesSlice.js';
import { showToast } from '../store/uiSlice.js';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useWeather } from '../hooks/useWeather.js';
import { useAirQuality } from '../hooks/useAirQuality.js';
import { useQuakes } from '../hooks/useQuakes.js';
import { useSunAndMoon } from '../hooks/useSunAndMoon.js';
import { useGeocodingSearch } from '../hooks/useGeocodingSearch.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { fetchWithRetry } from '../utils/fetchWithRetry.js';

import { TempTrendChart } from '../components/TempTrendChart.jsx';
import { AqiTrendChart } from '../components/AqiTrendChart.jsx';
import { PressureTrendChart } from '../components/PressureTrendChart.jsx';
import { HumidityTrendChart } from '../components/HumidityTrendChart.jsx';
import { QuakeDistChart } from '../components/QuakeDistChart.jsx';
import { MoonPhaseStripChart } from '../components/MoonPhaseStripChart.jsx';
import { SeismicScatterChart } from '../components/SeismicScatterChart.jsx';
import { SolarRatioChart } from '../components/SolarRatioChart.jsx';
import { SkeletonPulse } from '../components/SkeletonPulse.jsx';
import { Legend } from '../components/Legend.jsx';

const DEFAULT_CITIES = [
  { name: 'New Delhi', latitude: 28.6139, longitude: 77.209, country: 'India', slug: 'new-delhi' },
  { name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, country: 'India', slug: 'mumbai' },
  { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India', slug: 'bengaluru' },
  { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, country: 'India', slug: 'kolkata' },
  { name: 'Chennai', latitude: 13.0827, longitude: 80.2707, country: 'India', slug: 'chennai' },
  { name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, country: 'India', slug: 'hyderabad' },
  { name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', slug: 'london' },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', slug: 'tokyo' },
  { name: 'New York', latitude: 40.7128, longitude: -74.0060, country: 'United States', slug: 'new-york' },
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'Australia', slug: 'sydney' },
  { name: 'Cairo', latitude: 30.0444, longitude: 31.2357, country: 'Egypt', slug: 'cairo' },
];

export function Explore() {
  const dispatch = useDispatch();
  const { units } = useSettings();
  const geo = useGeolocation();
  const location = useLocation();
  const navigate = useNavigate();
  const { citySlug } = useParams();

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChartTab, setActiveChartTab] = useState('temp'); // 'temp' | 'aqi' | 'pressure' | 'humidity'

  // Dynamic Route & State Resolver (§2.1 Lectures 37-42)
  useEffect(() => {
    if (location.state?.selectedCity) {
      setSelectedLocation(location.state.selectedCity);
      return;
    }

    if (citySlug) {
      const normalized = citySlug.toLowerCase();
      const matched = DEFAULT_CITIES.find(
        (c) => c.slug === normalized || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalized
      );
      if (matched) {
        setSelectedLocation(matched);
      } else {
        // Deep-link dynamic resolution via Geocoding API
        const cleanName = citySlug.replace(/-/g, ' ');
        fetchWithRetry(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&count=1&language=en&format=json`,
          {},
          2,
          500,
          'City Deep-Link Lookup'
        )
          .then((res) => res.json())
          .then((json) => {
            if (json.results && json.results[0]) {
              const r = json.results[0];
              setSelectedLocation({
                name: r.name,
                country: r.country,
                latitude: r.latitude,
                longitude: r.longitude,
              });
            }
          })
          .catch((err) => {
            console.warn('Could not resolve route param city:', err);
          });
      }
    }
  }, [citySlug, location.state]);

  const activeLat = selectedLocation?.latitude ?? geo.data?.latitude;
  const activeLon = selectedLocation?.longitude ?? geo.data?.longitude;
  const activeLabel = selectedLocation?.name ?? geo.data?.cityLabel ?? 'New Delhi, India (Default)';

  const geocode = useGeocodingSearch(searchQuery);

  const weather = useWeather(activeLat, activeLon);
  const airQuality = useAirQuality(activeLat, activeLon);
  const quakes = useQuakes();
  const sunMoon = useSunAndMoon(activeLat, activeLon);

  function handleSelectCity(city) {
    setSelectedLocation(city);
    setSearchQuery('');
    const slug = city.slug || city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    navigate(`/explore/${slug}`, { state: { selectedCity: city }, replace: true });
  }

  function handlePinToCompare(city) {
    dispatch(addCity(city));
    dispatch(showToast({ message: `${city.name} pinned to comparison matrix!`, type: 'success' }));
    navigate('/compare');
  }

  // Dynamic Chart Legend Items (§2.2 Item 9)
  const chartLegendItems = {
    temp: [
      { color: 'var(--color-sale)', label: 'Daily Max Temperature Curve' },
      { color: 'var(--color-info)', label: 'Daily Min Temperature Curve' },
    ],
    aqi: [
      { color: 'var(--color-accent-teal)', label: '24-Hour Air Quality Index' },
      { color: 'var(--color-info)', label: 'Scrubber Active Index Readout' },
    ],
    pressure: [
      { color: 'var(--color-accent-teal)', label: 'Surface Pressure Curve (hPa)' },
    ],
    humidity: [
      { color: 'var(--color-info)', label: 'Relative Humidity Curve (% RH)' },
    ],
  }[activeChartTab] || [];

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Environmental Analytics
          <span className="page-title__tag">TELEMETRY MATRIX</span>
        </h1>
        <p className="page-subtitle">
          Hand-drawn Canvas 2D telemetry trend charts & environmental analytics for <strong>{activeLabel}</strong>
        </p>
      </header>

      {/* City Search + Recents Selector */}
      <section className="data-widget-card" style={{ gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          <span className="instrument-gauge__label">Location Telemetry Search</span>
          <div className="search-pill-wrapper" style={{ maxWidth: '600px' }}>
            <span className="search-pill-icon">🔍</span>
            <input
              type="text"
              className="search-pill"
              placeholder="Search any global city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {geocode.results.length > 0 && (
            <div style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-none)', marginTop: '4px', maxWidth: '600px', zIndex: 10 }}>
              {geocode.results.map((city) => (
                <div
                  key={city.id}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--color-hairline-soft)' }}
                >
                  <button
                    type="button"
                    style={{ textAlign: 'left', color: 'var(--color-ink)', cursor: 'pointer', background: 'transparent', flex: 1 }}
                    onClick={() => handleSelectCity(city)}
                  >
                    <strong>{city.name}</strong>, {city.country} ({city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°)
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ height: '32px', padding: '0 10px', fontSize: 'var(--text-caption-sm)' }}
                    onClick={() => handlePinToCompare(city)}
                  >
                    + Compare
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Location Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', flexWrap: 'wrap', marginTop: 'var(--space-xs)' }}>
          <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', marginRight: '8px' }}>QUICK SELECT:</span>
          {DEFAULT_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              className={`filter-chip ${activeLabel === city.name ? 'filter-chip--active' : ''}`}
              onClick={() => handleSelectCity(city)}
            >
              {city.name}
            </button>
          ))}
        </div>
      </section>

      {/* Main Tabbed Chart Frame */}
      <section className="data-widget-card" style={{ gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <div>
            <span className="badge-promo">ENVIRONMENTAL TREND FRAME</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-lg)', color: 'var(--color-ink)', marginTop: '4px' }}>
              {activeChartTab === 'temp' && '7-Day Temperature Trend'}
              {activeChartTab === 'aqi' && '24-Hour Air Quality Index'}
              {activeChartTab === 'pressure' && '24-Hour Atmospheric Pressure Trend'}
              {activeChartTab === 'humidity' && '24-Hour Relative Humidity Telemetry'}
            </h2>
          </div>

          <div className="tab-strip">
            <button
              type="button"
              className={`filter-chip ${activeChartTab === 'temp' ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveChartTab('temp')}
            >
              Temperature
            </button>
            <button
              type="button"
              className={`filter-chip ${activeChartTab === 'aqi' ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveChartTab('aqi')}
            >
              Air Quality
            </button>
            <button
              type="button"
              className={`filter-chip ${activeChartTab === 'pressure' ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveChartTab('pressure')}
            >
              Pressure
            </button>
            <button
              type="button"
              className={`filter-chip ${activeChartTab === 'humidity' ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveChartTab('humidity')}
            >
              Humidity
            </button>
          </div>
        </div>

        {/* Chart Color Legend (§2.2 Item 9) */}
        <Legend title={`${activeChartTab.toUpperCase()} CHART COLOR KEY`} items={chartLegendItems} />

        {/* Active Chart Frame Render */}
        <div style={{ marginTop: 'var(--space-md)' }}>
          {weather.isLoading ? (
            <SkeletonPulse width="100%" height="280px" />
          ) : activeChartTab === 'temp' ? (
            <TempTrendChart
              dailyData={weather.data?.daily || []}
              unit={units === 'imperial' ? '°F' : '°C'}
            />
          ) : activeChartTab === 'aqi' ? (
            <AqiTrendChart hourlyAqi={airQuality.data?.hourlyTrend || []} />
          ) : activeChartTab === 'pressure' ? (
            <PressureTrendChart hourlyPressure={weather.data?.hourlyPressure || []} />
          ) : (
            <HumidityTrendChart hourlyHumidity={weather.data?.hourlyHumidity || []} />
          )}
        </div>
      </section>

      {/* 4 Secondary Telemetry Analytics Canvas Charts with Dedicated Legends (§2.3) */}
      <div className="explore-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'var(--space-xl)' }}>
        <div>
          <QuakeDistChart quakes={quakes.data?.quakes || []} />
          <div style={{ marginTop: 'var(--space-xs)' }}>
            <Legend
              title="SEISMIC BUCKET KEY"
              items={[
                { color: 'var(--color-success)', label: '<2.5 M (Minor)' },
                { color: 'var(--color-accent-teal)', label: '2.5-4.0 M (Light)' },
                { color: 'var(--color-info)', label: '4.0-5.5 M (Moderate)' },
                { color: 'var(--color-sale)', label: '≥5.5 M (Severe)' },
              ]}
            />
          </div>
        </div>

        <div>
          <SeismicScatterChart quakes={quakes.data?.quakes || []} />
          <div style={{ marginTop: 'var(--space-xs)' }}>
            <Legend
              title="SEISMIC MATRIX KEY"
              items={[
                { color: 'var(--color-success)', label: 'Minor (<3.5 M)' },
                { color: 'var(--color-info)', label: 'Moderate (3.5-5.0 M)' },
                { color: 'var(--color-sale)', label: 'Severe (≥5.0 M)' },
              ]}
            />
          </div>
        </div>

        <div>
          <SolarRatioChart dayLengthSec={sunMoon.data?.dayLength || 45180} />
          <div style={{ marginTop: 'var(--space-xs)' }}>
            <Legend
              title="SOLAR TERMINATOR KEY"
              items={[
                { color: 'var(--color-accent-teal)', label: 'Daylight Hours' },
                { color: 'var(--color-hairline)', label: 'Night Hours' },
              ]}
            />
          </div>
        </div>

        <div>
          <MoonPhaseStripChart />
          <div style={{ marginTop: 'var(--space-xs)' }}>
            <Legend
              title="LUNAR PHASE KEY"
              items={[
                { color: 'var(--color-accent-teal)', label: 'Illuminated Phase' },
                { color: 'var(--color-soft-cloud)', label: 'Shadowed Disc' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
