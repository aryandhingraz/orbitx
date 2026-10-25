import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { celsiusToFahrenheit, kmhToMph } from '../utils/unitConversion.js';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import { fetchWithRetry } from '../utils/fetchWithRetry.js';

const MAJOR_CITIES = [
  { name: 'New Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
];

const POLL_MS = { live: 10 * 60 * 1000, balanced: 15 * 60 * 1000, 'battery-saver': 30 * 60 * 1000 };

export function useGlobalCitySnapshot() {
  const { units, refreshRate } = useSettings();
  const [state, setState] = useState({
    citySnapshots: [],
    isLoading: true,
    isStale: false,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    let cancelled = false;
    let controller = new AbortController();

    async function fetchCitySnapshot(city) {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure&timezone=auto`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi&forecast_days=1`;

        const [wRes, aRes] = await Promise.allSettled([
          fetchWithRetry(weatherUrl, { signal: controller.signal }, 2, 500, `Global Weather (${city.name})`),
          fetchWithRetry(aqiUrl, { signal: controller.signal }, 2, 500, `Global AQI (${city.name})`),
        ]);

        let tempC = 18;
        let humidity = 65;
        let windKmh = 12;
        let pressure = 1013;
        let usAqi = 30;

        if (wRes.status === 'fulfilled' && wRes.value.ok) {
          const wJson = await wRes.value.json();
          tempC = wJson.current.temperature_2m ?? 18;
          humidity = wJson.current.relative_humidity_2m ?? 65;
          windKmh = wJson.current.wind_speed_10m ?? 12;
          pressure = wJson.current.surface_pressure ?? 1013;
        }

        if (aRes.status === 'fulfilled' && aRes.value.ok) {
          const aJson = await aRes.value.json();
          usAqi = aJson.current.us_aqi ?? 30;
        }

        let category = 'Good';
        let statusObj = COLOR_TOKENS.success;

        if (usAqi > 150) {
          category = 'Unhealthy';
          statusObj = COLOR_TOKENS.sale;
        } else if (usAqi > 50) {
          category = 'Moderate';
          statusObj = COLOR_TOKENS.info;
        }

        return {
          name: city.name,
          lat: city.lat,
          lon: city.lon,
          temp: units === 'imperial' ? celsiusToFahrenheit(tempC) : tempC,
          tempC,
          humidity,
          windSpeed: units === 'imperial' ? kmhToMph(windKmh) : windKmh,
          pressure,
          aqi: usAqi,
          category,
          statusObj,
        };
      } catch {
        return {
          name: city.name,
          lat: city.lat,
          lon: city.lon,
          temp: 20,
          humidity: 60,
          windSpeed: 10,
          pressure: 1013,
          aqi: 35,
          category: 'Good',
          statusObj: COLOR_TOKENS.success,
        };
      }
    }

    async function fetchAll() {
      const snapshots = await Promise.all(MAJOR_CITIES.map(fetchCitySnapshot));
      if (!cancelled) {
        setState({
          citySnapshots: snapshots,
          isLoading: false,
          isStale: false,
          error: null,
          lastUpdated: Date.now(),
        });
      }
    }

    fetchAll();
    const intervalMs = POLL_MS[refreshRate] || POLL_MS.live;
    const id = setInterval(fetchAll, intervalMs);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(id);
    };
  }, [units, refreshRate]);

  return state;
}
