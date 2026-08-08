import { useState, useEffect } from 'react';

export function useQuakes() {
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
        const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const features = json.features || [];
        const count = json.metadata?.count || features.length;

        let maxMag = 0;
        let maxQuake = null;
        let recentList = [];

        features.forEach((item) => {
          const mag = item.properties.mag || 0;
          if (mag > maxMag) {
            maxMag = mag;
            maxQuake = item;
          }
          recentList.push({
            id: item.id,
            mag,
            place: item.properties.place,
            time: item.properties.time,
            url: item.properties.url,
            coordinates: item.geometry.coordinates, // [lon, lat, depth]
          });
        });

        // Flag status: alert if maxMag >= 5.0 (§2.1)
        const status = maxMag >= 5.0 ? 'alert' : maxMag >= 3.5 ? 'warning' : 'nominal';

        const transformed = {
          count,
          maxMag: Math.round(maxMag * 10) / 10,
          maxQuakePlace: maxQuake?.properties?.place || 'Worldwide',
          status,
          quakes: recentList.slice(0, 15),
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
    const id = setInterval(poll, 5 * 60 * 1000); // 5-minute poll

    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(id);
    };
  }, []);

  return state;
}
