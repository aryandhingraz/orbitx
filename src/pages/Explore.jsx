import { useGeolocation } from '../hooks/useGeolocation.js';
import { useWeather } from '../hooks/useWeather.js';
import { useAirQuality } from '../hooks/useAirQuality.js';
import { useQuakes } from '../hooks/useQuakes.js';
import { useSunAndMoon } from '../hooks/useSunAndMoon.js';
import { useSettings } from '../context/SettingsContext.jsx';

import { TempTrendChart } from '../components/TempTrendChart.jsx';
import { AqiTrendChart } from '../components/AqiTrendChart.jsx';
import { QuakeDistChart } from '../components/QuakeDistChart.jsx';
import { MoonPhaseStripChart } from '../components/MoonPhaseStripChart.jsx';
import { SeismicScatterChart } from '../components/SeismicScatterChart.jsx';
import { SolarRatioChart } from '../components/SolarRatioChart.jsx';

export function Explore() {
  const { units } = useSettings();
  const geo = useGeolocation();
  const weather = useWeather(geo.data?.latitude, geo.data?.longitude);
  const airQuality = useAirQuality(geo.data?.latitude, geo.data?.longitude);
  const quakes = useQuakes();
  const sunMoon = useSunAndMoon(geo.data?.latitude, geo.data?.longitude);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Environmental Analytics
          <span className="page-title__tag">6-CANVAS MATRIX</span>
        </h1>
        <p className="page-subtitle">
          Hand-drawn 2D telemetry charts & 7-day trend analysis for {geo.data?.cityLabel || 'Planet Earth'}
        </p>
      </header>

      {/* 6 Canvas 2D Analytics Charts Grid (§4.2) */}
      <div className="explore-grid">
        <TempTrendChart
          dailyData={weather.data?.daily || []}
          unit={units === 'imperial' ? '°F' : '°C'}
        />

        <AqiTrendChart hourlyAqi={airQuality.data?.hourlyTrend || []} />

        <QuakeDistChart quakes={quakes.data?.quakes || []} />

        <SeismicScatterChart quakes={quakes.data?.quakes || []} />

        <SolarRatioChart dayLengthSec={sunMoon.data?.dayLength || 45180} />

        <MoonPhaseStripChart />
      </div>
    </div>
  );
}
