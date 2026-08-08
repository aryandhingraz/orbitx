import { HashRouter } from 'react-router-dom';
import { AppRouter } from './router.jsx';
import { NavRail } from './components/NavRail.jsx';
import './styles/layout.css';

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <NavRail />
        <main className="main-viewport">
          <AppRouter />
        </main>
      </div>
    </HashRouter>
  );
}
