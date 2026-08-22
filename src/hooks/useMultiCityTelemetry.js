import { useState, useEffect } from 'react';
import { celsiusToFahrenheit, kmhToMph } from '../utils/unitConversion.js';
import { useSettings } from '../context/SettingsContext.jsx';

export function useMultiCityTelemetry(cities = []) {
  const { units } = useSettings();
  const [telemetryMap, setTelemetryMap] = useState({});

  useEffect(() => {
    if (!cities || cities.length === 0) return;
    let cancelled = false;

    async function fetchCityData(city) {
      const { latitude: lat, longitude: lon, id } = city;
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure&timezone=auto`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&forecast_days=1`;

        const [wRes, aRes] = await Promise.all([
          fetch(weatherUrl),
          fetch(aqiUrl),
        ]);

        let weatherData = null;
        let aqiData = null;

        if (wRes.ok) {
          const wJson = await wRes.json();
          const currentTempC = wJson.current.temperature_2m;
          const currentWindKmh = wJson.current.wind_speed_10m;
          weatherData = {
            temperature: units === 'imperial' ? celsiusToFahrenheit(currentTempC) : currentTempC,
            humidity: wJson.current.relative_humidity_2m,
            windSpeed: units === 'imperial' ? kmhToMph(currentWindKmh) : currentWindKmh,
            pressure: wJson.current.surface_pressure,
            weatherCode: wJson.current.weather_code,
          };
        }

        if (aRes.ok) {
          const aJson = await aRes.json();
          const usAqi = aJson.current.us_aqi ?? 25;
          let category = 'Good AQI';
          let statusColor = 'var(--color-success-bright)';

          if (usAqi > 50 && usAqi <= 100) {
            category = 'MODERATE AQI';
            statusColor = 'var(--color-info)';
          } else if (usAqi > 100 && usAqi <= 150) {
            category = 'UNHEALTHY (SENSITIVE) AQI';
            statusColor = 'var(--color-info)';
          } else if (usAqi > 150) {
            category = 'UNHEALTHY AQI';
            statusColor = 'var(--color-sale)';
          } else {
            category = 'GOOD AQI';
            statusColor = 'var(--color-success-bright)';
          }

          aqiData = {
            aqi: usAqi,
            category,
            statusColor,
          };
        }

        return { id, weather: weatherData, airQuality: aqiData };
      } catch (err) {
        return { id, weather: null, airQuality: null, error: err };
      }
    }

    async function fetchAll() {
      const results = await Promise.all(cities.map(fetchCityData));
      if (!cancelled) {
        const resultMap = {};
        results.forEach((res) => {
          resultMap[res.id] = res;
        });
        setTelemetryMap(resultMap);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [cities, units]);

  return telemetryMap;
}
