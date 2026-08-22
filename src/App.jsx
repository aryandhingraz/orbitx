import { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { TelemetryProvider } from './context/TelemetryContext.jsx';
import { AppRouter } from './router.jsx';
import { Starfield } from './components/Starfield.jsx';
import { NavRail } from './components/NavRail.jsx';
import { OfflineBanner } from './components/OfflineBanner.jsx';
import { LiveTicker } from './components/LiveTicker.jsx';
import { KeyboardShortcutOverlay } from './components/KeyboardShortcutOverlay.jsx';

import { useGeolocation } from './hooks/useGeolocation.js';
import { useWeather } from './hooks/useWeather.js';
import { useAirQuality } from './hooks/useAirQuality.js';
import { useISS } from './hooks/useISS.js';
import { useQuakes } from './hooks/useQuakes.js';
import { useCurrency } from './hooks/useCurrency.js';
import { useAlertCount } from './hooks/useAlertCount.js';
import { formatTemperature } from './utils/formatters.js';

function ShellContent() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const toggleShortcuts = () => setShowShortcuts((prev) => !prev);

  const geo = useGeolocation();
  const lat = geo.data?.latitude;
  const lon = geo.data?.longitude;

  const weather = useWeather(lat, lon);
  const airQuality = useAirQuality(lat, lon);
  const iss = useISS();
  const quakes = useQuakes();
  const currency = useCurrency('USD');

  const alertCount = useAlertCount({
    weatherData: weather.data,
    aqiData: airQuality.data,
    quakesData: quakes.data,
    issData: iss.data,
    currencyData: currency.data,
    userLat: lat,
    userLon: lon,
  });

  return (
    <TelemetryProvider value={{ geo, weather, airQuality, iss, quakes, currency }}>
      <div className="app-shell">
        <NavRail alertCount={alertCount} onOpenShortcuts={toggleShortcuts} />
        <main className="main-viewport">
          <LiveTicker
            issSpeed={iss.data?.velocity ? Math.round(iss.data.velocity).toLocaleString() : '27,580'}
            issAlt={iss.data?.altitude ?? 418}
            temp={formatTemperature(weather.data?.temperature)}
            aqi={airQuality.data?.aqi ?? 25}
            quakeCount={quakes.data?.count ?? 0}
            location={geo.data?.cityLabel}
          />
          <AppRouter />
        </main>
        <KeyboardShortcutOverlay
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
          onToggle={toggleShortcuts}
        />
      </div>
    </TelemetryProvider>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <Starfield />
        <OfflineBanner />
        <ShellContent />
      </HashRouter>
    </SettingsProvider>
  );
}
