import { useRef, useEffect, useState } from 'react';
import '../styles/components/instrumentGauge.css';

export function InstrumentGauge({
  label,
  value,
  unit,
  status = 'nominal',
  trend = null,
  isStale = false,
}) {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevValueRef = useRef(value);

  // Real-time flash effect when value updates (§4)
  useEffect(() => {
    if (prevValueRef.current !== undefined && prevValueRef.current !== value) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 300);
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value]);

  const trendGlyph = { up: '▲', down: '▼', flat: '▬' }[trend] ?? '';
  const displayValue = value ?? '—';
  const fullText = `${label}: ${displayValue} ${unit || ''}`;

  return (
    <div
      className={`instrument-gauge instrument-gauge--${status} ${isStale ? 'instrument-gauge--stale' : ''} ${isFlashing ? 'instrument-gauge--flash' : ''}`}
      title={fullText}
    >
      <span className="instrument-gauge__label text-truncate" title={label}>{label}</span>
      <div className="instrument-gauge__value-wrap min-w-0">
        <span className="instrument-gauge__value text-truncate">
          {displayValue}
          {unit && <span className="instrument-gauge__unit"> {unit}</span>}
        </span>
        {trend && <span className="instrument-gauge__trend">{trendGlyph}</span>}
      </div>
      {isStale && (
        <div className="instrument-gauge__stale-tag">
          <span className="swatch-dot swatch-dot--info"></span>
          <span>LAST KNOWN GOOD</span>
        </div>
      )}
    </div>
  );
}
