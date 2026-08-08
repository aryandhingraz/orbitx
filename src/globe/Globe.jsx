import { useRef, useEffect } from 'react';
import { initGlobeEngine } from './globeEngine.js';
import '../styles/components/globe.css';

export function Globe() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = initGlobeEngine(container);

    return () => {
      engine?.dispose();
    };
  }, []);

  return (
    <div className="globe-wrapper">
      <div
        ref={containerRef}
        className="globe-container"
        aria-label="3D Interactive Earth Globe"
        role="img"
      />
    </div>
  );
}
