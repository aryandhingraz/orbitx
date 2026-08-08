import { HashRouter } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { AppRouter } from './router.jsx';
import { Starfield } from './components/Starfield.jsx';
import { NavRail } from './components/NavRail.jsx';
import { OfflineBanner } from './components/OfflineBanner.jsx';
import { KeyboardShortcutOverlay } from './components/KeyboardShortcutOverlay.jsx';

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <Starfield />
        <OfflineBanner />
        <div className="app-shell">
          <NavRail />
          <main className="main-viewport">
            <AppRouter />
          </main>
        </div>
        <KeyboardShortcutOverlay />
      </HashRouter>
    </SettingsProvider>
  );
}
