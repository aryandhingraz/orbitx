import { useState, useEffect, useMemo } from 'react';
import { getMoonPhase } from '../utils/moonPhase.js';

export function useSunAndMoon(rawLat, rawLon) {
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
    let cancelled = false;
    let controller;

    async function poll() {
      controller = new AbortController();
      try {
        const queryLat = lat ?? 51.4769;
        const queryLon = lon ?? -0.0005;
        const url = `https://api.sunrise-sunset.org/json?lat=${queryLat}&lng=${queryLon}&formatted=0`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const moon = getMoonPhase(new Date());

        const transformed = {
          sunrise: json.results.sunrise,
          sunset: json.results.sunset,
          dayLength: json.results.day_length,
          solarNoon: json.results.solar_noon,
          moonPhase: moon,
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
          // Fallback to local solar estimate if API is blocked or offline
          const now = new Date();
          const sunriseEst = new Date(now.setHours(6, 12, 0)).toISOString();
          const sunsetEst = new Date(now.setHours(18, 45, 0)).toISOString();
          const moon = getMoonPhase(new Date());

          setState({
            data: {
              sunrise: sunriseEst,
              sunset: sunsetEst,
              dayLength: 45180,
              solarNoon: new Date().toISOString(),
              moonPhase: moon,
            },
            isLoading: false,
            isStale: true,
            error: err,
            lastUpdated: Date.now(),
          });
        }
      }
    }

    poll();
    const id = setInterval(poll, 60 * 60 * 1000); // 1 hour poll

    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(id);
    };
  }, [lat, lon]);

  return state;
}
