import { useState, useEffect } from 'react';

export function useGeocodingSearch(query) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!cancelled) {
          const list = (json.results || []).map((item) => ({
            id: item.id,
            name: item.name,
            country: item.country,
            latitude: item.latitude,
            longitude: item.longitude,
            elevation: item.elevation,
            timezone: item.timezone,
          }));
          setResults(list);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      }
    }, 350); // 350ms debounce

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return { results, isLoading, error };
}
