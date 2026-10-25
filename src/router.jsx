import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home.jsx';
import { Explore } from './pages/Explore.jsx';
import { Compare } from './pages/Compare.jsx';
import { Satellites, SatelliteMapTab, SatelliteScheduleTab, SatelliteInfoTab } from './pages/Satellites.jsx';
import { Alerts } from './pages/Alerts.jsx';
import { SpaceWeather } from './pages/SpaceWeather.jsx';
import { EarthWatch } from './pages/EarthWatch.jsx';
import { Journal } from './pages/Journal.jsx';
import { Settings } from './pages/Settings.jsx';
import { About } from './pages/About.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* Dynamic Route with URL parameter (§2.1 Lectures 37-42) */}
      <Route path="/explore" element={<Explore />} />
      <Route path="/explore/:citySlug" element={<Explore />} />
      
      <Route path="/compare" element={<Compare />} />
      
      {/* Nested Routes with <Outlet> layout (§2.2 Lectures 37-42) */}
      <Route path="/satellites" element={<Satellites />}>
        <Route index element={<Navigate to="/satellites/map" replace />} />
        <Route path="map" element={<SatelliteMapTab />} />
        <Route path="schedule" element={<SatelliteScheduleTab />} />
        <Route path="info" element={<SatelliteInfoTab />} />
      </Route>
      
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/space-weather" element={<SpaceWeather defaultTab="3d-aurora" />} />
      <Route path="/aurora" element={<SpaceWeather defaultTab="3d-aurora" />} />
      <Route path="/earth-watch" element={<EarthWatch />} />
      
      {/* Protected Route for Journal (§2.3 Lectures 37-42) */}
      <Route path="/journal" element={
        <ProtectedRoute>
          <Journal />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={<Settings />} />
      <Route path="/about" element={<About />} />
      
      {/* Designed 404 Catch-all Route (§2.4 Lectures 37-42) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
