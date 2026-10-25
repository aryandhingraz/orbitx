import { useState, useEffect } from 'react';
import { longitudeToAngle } from '../utils/angleMath.js';
import { fetchWithRetry } from '../utils/fetchWithRetry.js';

export function useISS() {
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
        const url = 'https://api.wheretheiss.at/v1/satellites/25544';
        const res = await fetchWithRetry(url, { signal: controller.signal }, 2, 500, 'ISS Telemetry API');
        const json = await res.json();

        const transformed = {
          latitude: json.latitude,
          longitude: json.longitude,
          altitude: Math.round(json.altitude),
          velocity: Math.round(json.velocity),
          visibility: json.visibility,
          ringAngle: longitudeToAngle(json.longitude),
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
          // Simulated orbital telemetry fallback if satellite endpoint drops
          const nowSec = Date.now() / 1000;
          const simLon = ((nowSec % 5400) / 5400) * 360 - 180; // 90 min orbit round earth
          setState((prev) => ({
            ...prev,
            data: prev.data || {
              latitude: 28.5,
              longitude: simLon,
              altitude: 418,
              velocity: 27580,
              visibility: 'daylight',
              ringAngle: longitudeToAngle(simLon),
            },
            isLoading: false,
            error: err,
            isStale: true,
          }));
        }
      }
    }

    poll();
    const id = setInterval(poll, 5000); // 5-second polling (§6)

    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(id);
    };
  }, []);

  return state;
}
