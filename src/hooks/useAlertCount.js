import { useMemo } from 'react';

export function calculateAlertCount({ weatherData, aqiData, quakesData, issData, currencyData, userLat, userLon }) {
  let count = 0;

  // 1. Seismic alerts (mag >= 3.5)
  if (quakesData?.quakes) {
    const severeQuakes = quakesData.quakes.filter((q) => q.mag >= 3.5);
    count += severeQuakes.length;
  }

  // 2. Air Quality alert (AQI > 50)
  if (aqiData?.aqi > 50) {
    count += 1;
  }

  // 3. ISS Overhead & Visible Alert (§1.4)
  if (issData?.visibility === 'visible' && userLat != null && userLon != null && issData?.latitude != null && issData?.longitude != null) {
    const latDiff = Math.abs(userLat - issData.latitude);
    const lonDiff = Math.abs(userLon - issData.longitude);
    if (latDiff <= 30 && lonDiff <= 30) {
      count += 1;
    }
  }

  // 4. Extreme Temperature Alert
  if (weatherData?.temperature !== undefined && weatherData?.temperature !== null) {
    if (weatherData.temperature > 35 || weatherData.temperature < 0) {
      count += 1;
    }
  }

  // 5. Forex Shift Alert (shift >= 0.3%) (§1.3)
  if (currencyData?.hasShift) {
    count += 1;
  }

  return count;
}

export function useAlertCount(telemetry = {}) {
  return useMemo(() => calculateAlertCount(telemetry), [
    telemetry.weatherData,
    telemetry.aqiData,
    telemetry.quakesData,
    telemetry.issData,
    telemetry.currencyData,
    telemetry.userLat,
    telemetry.userLon,
  ]);
}
