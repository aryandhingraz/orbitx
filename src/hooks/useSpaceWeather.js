import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { fetchWithRetry } from '../utils/fetchWithRetry.js';

const POLL_MS = 5 * 60 * 1000; // 5 minutes

const DEFAULT_K_HISTORY = [
  { time: '00:00', timeFull: '00:00 UTC', kp: 2.0 },
  { time: '03:00', timeFull: '03:00 UTC', kp: 2.3 },
  { time: '06:00', timeFull: '06:00 UTC', kp: 1.7 },
  { time: '09:00', timeFull: '09:00 UTC', kp: 2.0 },
  { time: '12:00', timeFull: '12:00 UTC', kp: 1.7 },
  { time: '15:00', timeFull: '15:00 UTC', kp: 2.7 },
  { time: '18:00', timeFull: '18:00 UTC', kp: 3.0 },
  { time: '21:00', timeFull: '21:00 UTC', kp: 2.0 },
];

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
        const kIndexUrl = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
        const windUrl = 'https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json';

        const [kRes, wRes] = await Promise.allSettled([
          fetchWithRetry(kIndexUrl, { signal: controller.signal }, 2, 500, 'NOAA SWPC 24h K-Index'),
          fetchWithRetry(windUrl, { signal: controller.signal }, 2, 500, 'NOAA Solar Wind API'),
        ]);

        let kIndexVal = 2; // Default nominal
        let kHistory = DEFAULT_K_HISTORY;

        if (kRes.status === 'fulfilled' && kRes.value.ok) {
          const json = await kRes.value.json();
          if (Array.isArray(json) && json.length > 0) {
            const last8 = json.slice(-8);
            kHistory = last8.map((item) => {
              const kpNum = typeof item.Kp === 'number' ? Math.round(item.Kp * 10) / 10 : parseFloat(item.Kp) || 2;
              const timeStr = item.time_tag ? item.time_tag.substring(11, 16) : '00:00';
              const fullStr = item.time_tag ? item.time_tag.replace('T', ' ') + ' UTC' : `${timeStr} UTC`;
              return {
                time: timeStr,
                timeFull: fullStr,
                kp: kpNum,
              };
            });
            const latest = kHistory[kHistory.length - 1];
            kIndexVal = Math.round(latest.kp);
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
              kHistory: DEFAULT_K_HISTORY,
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
