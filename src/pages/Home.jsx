import { useState } from 'react';
import { Globe } from '../globe/Globe.jsx';
import { OrbitRing } from '../components/OrbitRing.jsx';
import { DataPanel } from '../components/DataPanel.jsx';
import '../styles/components/orbitRing.css';

export function Home() {
  const [activePanelRing, setActivePanelRing] = useState(null);

  function handleMarkerClick(ringId) {
    setActivePanelRing((prev) => (prev === ringId ? null : ringId));
  }

  function handleClosePanel() {
    setActivePanelRing(null);
  }

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <header className="page-header">
        <h1 className="page-title">
          Earth Observatory
          <span className="page-title__tag">ORBITX-01</span>
        </h1>
        <p className="page-subtitle">Real-time planetary telemetry & orbital positioning system</p>
      </header>

      {/* Radial Orbit Ring System + WebGL Globe Center (§2.4, §2.5) */}
      <div className="orbit-system-container">
        {/* Globe Center */}
        <Globe />

        {/* Concentric Orbit Rings */}
        {/* Inner Ring: Solar Terminator & Moon Phase */}
        <OrbitRing
          ringId="inner"
          radiusPercent={36}
          ringClass="inner"
          isPaused={activePanelRing === 'inner'}
          onMarkerClick={handleMarkerClick}
          activeMarkerId={activePanelRing}
          markerAngle={90}
          markerLabel="SOLAR.LUNAR"
        />

        {/* Mid Ring: ISS Satellite Tracker */}
        <OrbitRing
          ringId="mid"
          radiusPercent={42}
          ringClass="mid"
          isPaused={activePanelRing === 'mid'}
          onMarkerClick={handleMarkerClick}
          activeMarkerId={activePanelRing}
          markerAngle={210}
          markerLabel="ISS.SAT-25544"
        />

        {/* Outer Ring: World Clocks & Currency Telemetry */}
        <OrbitRing
          ringId="outer"
          radiusPercent={48}
          ringClass="outer"
          isPaused={activePanelRing === 'outer'}
          onMarkerClick={handleMarkerClick}
          activeMarkerId={activePanelRing}
          markerAngle={330}
          markerLabel="CLOCKS.FOREX"
        />
      </div>

      {/* Sliding Data Panel Modal */}
      <DataPanel
        isOpen={activePanelRing !== null}
        title={
          activePanelRing === 'inner'
            ? 'Solar Terminator & Lunar Telemetry'
            : activePanelRing === 'mid'
            ? 'ISS Orbit Telemetry (ZARYA)'
            : 'Global Clocks & Currency Exchange'
        }
        onClose={handleClosePanel}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
          <p>Orbital Ring Selected: <span style={{ color: 'var(--brass)' }}>{activePanelRing?.toUpperCase()}</span></p>
          <p style={{ marginTop: '1rem', color: 'var(--parchment-dim)' }}>
            Live telemetry data feeds connecting to planetary public endpoints...
          </p>
        </div>
      </DataPanel>
    </div>
  );
}
