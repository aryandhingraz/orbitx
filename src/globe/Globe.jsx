import { useRef, useEffect } from 'react';
import { initGlobeEngine } from './globeEngine.js';
import '../styles/components/globe.css';

export function Globe({ activeLayer = 'overview', weatherData, aqiData, quakeData, issData, citySnapshots, onMarkerSelect, onGlobeSurfaceSelect }) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    engineRef.current = initGlobeEngine(
      container,
      activeLayer,
      { weatherData, aqiData, quakeData, issData, citySnapshots },
      onMarkerSelect,
      onGlobeSurfaceSelect
    );

    return () => {
      engineRef.current?.dispose();
    };
  }, []); // Mount once

  useEffect(() => {
    if (engineRef.current?.updateLayer) {
      engineRef.current.updateLayer(activeLayer, { weatherData, aqiData, quakeData, issData, citySnapshots });
    }
  }, [activeLayer, weatherData, aqiData, quakeData, issData, citySnapshots]);

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
