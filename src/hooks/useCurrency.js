import { useState, useEffect } from 'react';

export function useCurrency(baseCurrency = 'USD') {
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
        const url = `https://api.frankfurter.app/latest?from=${baseCurrency}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const transformed = {
          base: json.base,
          date: json.date,
          rates: json.rates, // { EUR: 0.92, GBP: 0.78, JPY: 154.5, ... }
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
          // Hardcoded forex fallback rates if offline
          setState({
            data: {
              base: 'USD',
              date: new Date().toISOString().split('T')[0],
              rates: { EUR: 0.92, GBP: 0.79, JPY: 154.2, CAD: 1.36, INR: 83.9 },
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
    const id = setInterval(poll, 30 * 60 * 1000); // 30 min poll

    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(id);
    };
  }, [baseCurrency]);

  return state;
}
