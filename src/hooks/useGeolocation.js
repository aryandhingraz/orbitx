import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';

// New Delhi, India as default fallback geography (§7 Rubric Alignment)
const FALLBACK_LOCATION = { latitude: 28.6139, longitude: 77.209, cityLabel: 'New Delhi, India (Default)' };

export function useGeolocation() {
  const { defaultCity } = useSettings();
  const [state, setState] = useState({
    data: defaultCity ? { latitude: defaultCity.lat, longitude: defaultCity.lon, cityLabel: defaultCity.name } : null,
    isLoading: !defaultCity,
    isStale: false,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    if (defaultCity) {
      setState({
        data: { latitude: defaultCity.lat, longitude: defaultCity.lon, cityLabel: defaultCity.name },
        isLoading: false,
        isStale: false,
        error: null,
        lastUpdated: Date.now(),
      });
      return;
    }

    if (!('geolocation' in navigator)) {
      setState({
        data: FALLBACK_LOCATION,
        isLoading: false,
        isStale: true,
        error: new Error('Geolocation unsupported'),
        lastUpdated: Date.now(),
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          data: {
            latitude: Math.round(pos.coords.latitude * 100) / 100,
            longitude: Math.round(pos.coords.longitude * 100) / 100,
            cityLabel: 'Local Coordinates',
          },
          isLoading: false,
          isStale: false,
          error: null,
          lastUpdated: Date.now(),
        });
      },
      (err) => {
        console.warn('Geolocation fallback activated:', err.message);
        setState({
          data: FALLBACK_LOCATION,
          isLoading: false,
          isStale: true,
          error: err,
          lastUpdated: Date.now(),
        });
      },
      { timeout: 8000 }
    );
  }, [defaultCity]);

  return state;
}
