import { useState, useEffect } from 'react';

const CITIES = [
  { name: 'London', timeZone: 'Europe/London', code: 'LDN' },
  { name: 'New York', timeZone: 'America/New_York', code: 'NYC' },
  { name: 'Tokyo', timeZone: 'Asia/Tokyo', code: 'TYO' },
  { name: 'Sydney', timeZone: 'Australia/Sydney', code: 'SYD' },
  { name: 'UTC Observatory', timeZone: 'UTC', code: 'UTC' },
];

export function useWorldClocks() {
  const [clocks, setClocks] = useState([]);

  useEffect(() => {
    function tick() {
      const now = new Date();
      const updated = CITIES.map((city) => {
        try {
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: city.timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });
          return {
            ...city,
            timeString: formatter.format(now),
          };
        } catch {
          return { ...city, timeString: '—' };
        }
      });
      setClocks(updated);
    }

    tick();
    const id = setInterval(tick, 1000); // 1-second tick

    return () => clearInterval(id);
  }, []);

  return { data: clocks, isLoading: clocks.length === 0, isStale: false, error: null, lastUpdated: Date.now() };
}
