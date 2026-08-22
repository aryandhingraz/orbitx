import { useState, useEffect } from 'react';

const POLL_MS = 10 * 60 * 1000; // 10 minutes

const MOCK_EVENTS = [
  {
    id: 'eonet-1',
    title: 'Wildfire — Wildfire Activity in Pacific Northwest',
    category: 'Wildfires',
    categorySlug: 'wildfires',
    lat: 44.5,
    lon: -121.2,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    link: 'https://eonet.gsfc.nasa.gov',
  },
  {
    id: 'eonet-2',
    title: 'Severe Storm — Tropical Cyclone Tracking',
    category: 'Severe Storms',
    categorySlug: 'severeStorms',
    lat: 18.4,
    lon: -66.1,
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    link: 'https://eonet.gsfc.nasa.gov',
  },
  {
    id: 'eonet-3',
    title: 'Volcanic Activity — Sakurajima Volcanic Plume',
    category: 'Volcanoes',
    categorySlug: 'volcanoes',
    lat: 31.58,
    lon: 130.65,
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    link: 'https://eonet.gsfc.nasa.gov',
  },
];

export function useNaturalEvents() {
  const [state, setState] = useState({
    data: { events: MOCK_EVENTS, count: MOCK_EVENTS.length },
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
        const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=30';
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!cancelled && json.events && Array.isArray(json.events)) {
          const transformed = json.events.map((item) => {
            const catObj = item.categories?.[0] || {};
            const geoObj = item.geometry?.[0] || {};
            const coords = geoObj.coordinates || [0, 0];

            return {
              id: item.id,
              title: item.title,
              category: catObj.title || 'Natural Event',
              categorySlug: catObj.id || 'other',
              lat: coords[1] ?? 0,
              lon: coords[0] ?? 0,
              date: geoObj.date || item.geometry?.[item.geometry.length - 1]?.date || new Date().toISOString(),
              link: item.sources?.[0]?.url || 'https://eonet.gsfc.nasa.gov',
            };
          });

          setState({
            data: { events: transformed, count: transformed.length },
            isLoading: false,
            isStale: false,
            error: null,
            lastUpdated: Date.now(),
          });
        }
      } catch (err) {
        if (!cancelled && err.name !== 'AbortError') {
          setState({
            data: { events: MOCK_EVENTS, count: MOCK_EVENTS.length },
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
  }, []);

  return state;
}
