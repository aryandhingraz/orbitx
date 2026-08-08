import '../styles/components/instrumentGauge.css';

export function InstrumentGauge({
  label,
  value,
  unit,
  status = 'nominal',
  trend = null,
  isStale = false,
}) {
  const trendGlyph = { up: '▲', down: '▼', flat: '▬' }[trend] ?? '';

  return (
    <div
      className={`instrument-gauge instrument-gauge--${status} ${isStale ? 'instrument-gauge--stale' : ''}`}
    >
      <span className="instrument-gauge__label">{label}</span>
      <div className="instrument-gauge__value-wrap">
        <span className="instrument-gauge__value">
          {value ?? '—'}
          {unit && <span className="instrument-gauge__unit">{unit}</span>}
        </span>
        {trend && <span className="instrument-gauge__trend">{trendGlyph}</span>}
      </div>
      {isStale && <span style={{ fontSize: '9px', color: 'var(--brass)' }}>● LAST KNOWN GOOD</span>}
    </div>
  );
}
