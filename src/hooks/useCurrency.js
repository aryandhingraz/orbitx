import { useState, useEffect, useRef } from 'react';

const FALLBACK_RATES = { EUR: 0.92, GBP: 0.79, JPY: 154.2, CAD: 1.36, INR: 83.9, AUD: 1.52 };

export function useCurrency(baseCurrency = 'USD') {
  const prevRateRef = useRef(null);

  const [state, setState] = useState({
    data: {
      base: 'USD',
      date: new Date().toISOString().split('T')[0],
      rates: FALLBACK_RATES,
      rateDeltaPct: 0,
      hasShift: false,
    },
    isLoading: false,
    isStale: false,
    error: null,
    lastUpdated: Date.now(),
  });

  useEffect(() => {
    let cancelled = false;
    let controller;

    async function poll() {
      controller = new AbortController();
      try {
        const url = `https://open.er-api.com/v6/latest/${baseCurrency}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!cancelled && json.rates) {
          const currentEur = json.rates.EUR || 0.92;
          let deltaPct = 0;
          let shiftDetected = false;

          if (prevRateRef.current != null && prevRateRef.current > 0) {
            deltaPct = ((currentEur - prevRateRef.current) / prevRateRef.current) * 100;
            if (Math.abs(deltaPct) >= 0.3) {
              shiftDetected = true;
            }
          }
          prevRateRef.current = currentEur;

          setState({
            data: {
              base: json.base_code || baseCurrency,
              date: json.time_last_update_utc || new Date().toISOString().split('T')[0],
              rates: json.rates,
              rateDeltaPct: Math.round(deltaPct * 100) / 100,
              hasShift: shiftDetected,
            },
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
              base: baseCurrency,
              date: new Date().toISOString().split('T')[0],
              rates: FALLBACK_RATES,
              rateDeltaPct: 0,
              hasShift: false,
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
    const id = setInterval(poll, 30 * 60 * 1000);

    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(id);
    };
  }, [baseCurrency]);

  return state;
}
