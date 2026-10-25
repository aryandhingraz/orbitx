import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { fetchWithRetry } from '../utils/fetchWithRetry.js';

const POLL_MS = { live: 10 * 60 * 1000, balanced: 15 * 60 * 1000, 'battery-saver': 30 * 60 * 1000 };

export function useAirQuality(rawLat, rawLon) {
  const { refreshRate } = useSettings();
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
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide&hourly=us_aqi&forecast_days=1`;
        const res = await fetchWithRetry(url, { signal: controller.signal }, 2, 500, 'Air Quality API');
        const json = await res.json();

        const usAqi = json.current.us_aqi ?? 25;
        let category = 'Good';
        let statusColor = 'nominal';

        if (usAqi > 50 && usAqi <= 100) {
          category = 'Moderate';
          statusColor = 'warning';
        } else if (usAqi > 100 && usAqi <= 150) {
          category = 'Unhealthy for Sensitive Groups';
          statusColor = 'warning';
        } else if (usAqi > 150) {
          category = 'Unhealthy';
          statusColor = 'alert';
        }

        const transformed = {
          aqi: usAqi,
          category,
          statusColor,
          pm25: json.current.pm2_5,
          pm10: json.current.pm10,
          co: json.current.carbon_monoxide,
          no2: json.current.nitrogen_dioxide,
          hourlyTrend: json.hourly?.us_aqi?.slice(0, 24) || [],
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
  }, [lat, lon, refreshRate]);

  return state;
}
