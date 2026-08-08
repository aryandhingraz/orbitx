import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { celsiusToFahrenheit, kmhToMph } from '../utils/unitConversion.js';

const POLL_MS = { live: 5 * 60 * 1000, balanced: 10 * 60 * 1000, 'battery-saver': 30 * 60 * 1000 };

export function useWeather(rawLat, rawLon) {
  const { units, refreshRate } = useSettings();
  const lat = useMemo(() => (rawLat != null ? Math.round(rawLat * 100) / 100 : null), [rawLat]);
  const lon = useMemo(() => (rawLon != null ? Math.round(rawLon * 100) / 100 : null), [rawLon]);

  const [state, setState] = useState({
    data: null,
    isLoading: true,
    isStale: false,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    if (lat == null || lon == null) return;
    let cancelled = false;
    let controller;

    async function poll() {
      controller = new AbortController();
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const currentTempC = json.current.temperature_2m;
        const currentWindKmh = json.current.wind_speed_10m;

        const transformed = {
          temperature: units === 'imperial' ? celsiusToFahrenheit(currentTempC) : currentTempC,
          humidity: json.current.relative_humidity_2m,
          windSpeed: units === 'imperial' ? kmhToMph(currentWindKmh) : currentWindKmh,
          weatherCode: json.current.weather_code,
          pressure: json.current.surface_pressure,
          daily: json.daily.time.map((time, idx) => ({
            time,
            maxTemp: units === 'imperial' ? celsiusToFahrenheit(json.daily.temperature_2m_max[idx]) : json.daily.temperature_2m_max[idx],
            minTemp: units === 'imperial' ? celsiusToFahrenheit(json.daily.temperature_2m_min[idx]) : json.daily.temperature_2m_min[idx],
            weatherCode: json.daily.weather_code[idx],
          })),
        };

        if (!cancelled) {
          setState({
            data: transformed,
            isLoading: false,
            isStale: false,
            error: null,
            lastUpdated: Date.now(),
          });
        }
      } catch (err) {
        if (!cancelled && err.name !== 'AbortError') {
          setState((prev) => ({ ...prev, isLoading: false, error: err, isStale: true }));
        }
      }
    }

    poll();
    const intervalMs = POLL_MS[refreshRate] || POLL_MS.live;
    const id = setInterval(poll, intervalMs);

    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(id);
    };
  }, [lat, lon, units, refreshRate]);

  return state;
}
