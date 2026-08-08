import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home.jsx';
import { Explore } from './pages/Explore.jsx';
import { Compare } from './pages/Compare.jsx';
import { Satellites } from './pages/Satellites.jsx';
import { Journal } from './pages/Journal.jsx';
import { Settings } from './pages/Settings.jsx';
import { About } from './pages/About.jsx';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/satellites" element={<Satellites />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
