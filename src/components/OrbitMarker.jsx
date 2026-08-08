import '../styles/components/orbitMarker.css';

export function OrbitMarker({ isActive, isStale, onClick, label, angleDeg = 0, radiusPercent = 45 }) {
  // Convert angle in degrees to X/Y percentage position from center (50%, 50%)
  const rad = (angleDeg - 90) * (Math.PI / 180);
  const left = 50 + radiusPercent * Math.cos(rad);
  const top = 50 + radiusPercent * Math.sin(rad);

  return (
    <button
      type="button"
      className={`orbit-marker-btn ${isActive ? 'orbit-marker-btn--active' : ''} ${isStale ? 'orbit-marker-btn--stale' : ''}`}
      style={{ left: `${left}%`, top: `${top}%` }}
      onClick={onClick}
      aria-expanded={isActive}
      aria-label={label}
    >
      <span className="orbit-marker-dot" />
      <span className="orbit-marker-label">{label}</span>
    </button>
  );
}
