import { Globe } from '../globe/Globe.jsx';

export function Home() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Earth Observatory
          <span className="page-title__tag">ORBITX-01</span>
        </h1>
        <p className="page-subtitle">Real-time planetary telemetry & orbital positioning</p>
      </header>
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
        <Globe />
      </div>
    </div>
  );
}
