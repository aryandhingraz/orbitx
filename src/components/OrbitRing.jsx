import { OrbitMarker } from './OrbitMarker.jsx';
import '../styles/components/orbitRing.css';

export function OrbitRing({
  ringId,
  radiusPercent,
  ringClass = 'outer',
  isPaused = false,
  onMarkerClick,
  activeMarkerId,
  markerAngle = 45,
  markerLabel = 'MARKER',
  isStale = false,
}) {
  const isActive = activeMarkerId === ringId;

  return (
    <div className="orbit-ring-container" style={{ position: 'absolute', inset: 0 }}>
      {/* SVG Ring Track */}
      <svg className="orbit-ring-svg" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radiusPercent}
          className={`orbit-ring-track ${isActive ? 'orbit-ring-track--active' : ''}`}
        />
      </svg>

      {/* Rotating Marker Container */}
      <div
        className={`orbit-ring-group orbit-ring-group--${ringClass} ${isPaused ? 'orbit-ring-group--paused' : ''}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        <OrbitMarker
          isActive={isActive}
          isStale={isStale}
          onClick={() => onMarkerClick(ringId)}
          label={markerLabel}
          angleDeg={markerAngle}
          radiusPercent={radiusPercent}
        />
      </div>
    </div>
  );
}
