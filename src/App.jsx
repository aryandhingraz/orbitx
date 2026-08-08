import { HashRouter } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { AppRouter } from './router.jsx';
import { NavRail } from './components/NavRail.jsx';
import './styles/layout.css';

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <div className="app-shell">
          <NavRail />
          <main className="main-viewport">
            <AppRouter />
          </main>
        </div>
      </HashRouter>
    </SettingsProvider>
  );
}
