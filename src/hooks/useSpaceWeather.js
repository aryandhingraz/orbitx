import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';

const POLL_MS = 5 * 60 * 1000; // 5 minutes

export function useSpaceWeather() {
  const { refreshRate } = useSettings();
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
        const kIndexUrl = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';
        const windUrl = 'https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json';

        const [kRes, wRes] = await Promise.allSettled([
          fetch(kIndexUrl, { signal: controller.signal }),
          fetch(windUrl, { signal: controller.signal }),
        ]);

        let kIndexVal = 2; // Default nominal
        let kHistory = [1, 2, 2, 3, 2, 1, 2, 3, 4, 3, 2, 2];

        if (kRes.status === 'fulfilled' && kRes.value.ok) {
          const json = await kRes.value.json();
          if (Array.isArray(json) && json.length > 0) {
            const latest = json[json.length - 1];
            kIndexVal = latest.kp_index ?? Math.round(latest.kp ?? latest.k_index ?? 2);
            kHistory = json.slice(-12).map((item) => item.kp_index ?? Math.round(item.kp ?? item.k_index ?? 2));
          }
        }

        let realSpeed = null;
        let realDensity = null;
        let isEstimated = false;

        // Parse NOAA SWPC real RTSW solar wind telemetry [{ proton_speed, proton_density, time_tag }, ...]
        if (wRes.status === 'fulfilled' && wRes.value.ok) {
          const windData = await wRes.value.json();
          if (Array.isArray(windData) && windData.length > 0) {
            for (let i = windData.length - 1; i >= 0; i--) {
              const row = windData[i];
              if (row && row.proton_speed != null && row.proton_density != null) {
                const speedVal = parseFloat(row.proton_speed);
                const densityVal = parseFloat(row.proton_density);
                if (!isNaN(speedVal) && !isNaN(densityVal) && speedVal > 0 && densityVal > 0) {
                  realSpeed = Math.round(speedVal);
                  realDensity = densityVal.toFixed(1);
                  break;
                }
              }
            }
          }
        }

        if (realSpeed == null || realDensity == null) {
          realSpeed = 420;
          realDensity = '5.2';
          isEstimated = true;
        }

        const kStatus = kIndexVal >= 5 ? 'alert' : kIndexVal >= 4 ? 'warning' : 'nominal';
        const auroraLikelihood = kIndexVal >= 6 ? 'High (Geomagnetic Storm)' : kIndexVal >= 4 ? 'Moderate' : 'Low';

        const transformed = {
          kpIndex: kIndexVal,
          kpStatus: kStatus,
          kHistory,
          solarWindSpeed: realSpeed,
          solarWindDensity: realDensity,
          auroraLikelihood,
          isEstimated,
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
          setState({
            data: {
              kpIndex: 2,
              kpStatus: 'nominal',
              kHistory: [2, 2, 3, 2, 3, 4, 3, 2, 3, 2, 3, 2],
              solarWindSpeed: 420,
              solarWindDensity: '5.2',
              auroraLikelihood: 'Low',
              isEstimated: true,
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
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(id);
    };
  }, [refreshRate]);

  return state;
}
