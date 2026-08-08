import { useState, useEffect } from 'react';

const FALLBACK_RATES = { EUR: 0.92, GBP: 0.79, JPY: 154.2, CAD: 1.36, INR: 83.9, AUD: 1.52 };

export function useCurrency(baseCurrency = 'USD') {
  const [state, setState] = useState({
    data: { base: 'USD', date: new Date().toISOString().split('T')[0], rates: FALLBACK_RATES },
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
        // Use free open exchange rate API with full CORS support
        const url = `https://open.er-api.com/v6/latest/${baseCurrency}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!cancelled && json.rates) {
          setState({
            data: {
              base: json.base_code || baseCurrency,
              date: json.time_last_update_utc || new Date().toISOString().split('T')[0],
              rates: json.rates,
            },
            isLoading: false,
            isStale: false,
            error: null,
            lastUpdated: Date.now(),
          });
        }
      } catch (err) {
        if (!cancelled && err.name !== 'AbortError') {
          // Graceful fallback on CORS / network error
          setState({
            data: {
              base: baseCurrency,
              date: new Date().toISOString().split('T')[0],
              rates: FALLBACK_RATES,
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
