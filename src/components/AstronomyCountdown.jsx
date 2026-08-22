import { useState, useEffect } from 'react';

export function AstronomyCountdown({ sunrise, sunset, moonPhaseName }) {
  const [timeLeft, setTimeLeft] = useState({ label: 'Next Solar Horizon Event', text: '--:--:--' });

  useEffect(() => {
    function tick() {
      const now = new Date();

      if (!sunrise || !sunset) {
        setTimeLeft({ label: 'Solar Horizon Event', text: '06:12:00 (Estimated)' });
        return;
      }

      const sunriseTime = new Date(sunrise);
      const sunsetTime = new Date(sunset);

      let targetTime;
      let targetLabel;

      if (now < sunriseTime) {
        targetTime = sunriseTime;
        targetLabel = 'Sunrise Countdown';
      } else if (now < sunsetTime) {
        targetTime = sunsetTime;
        targetLabel = 'Sunset Countdown';
      } else {
        // Next day sunrise
        targetTime = new Date(sunriseTime.getTime() + 24 * 60 * 60 * 1000);
        targetLabel = 'Tomorrow Sunrise';
      }

      const diffMs = Math.max(0, targetTime - now);
      const hours = Math.floor(diffMs / (1000 * 60 * 60)).toString().padStart(2, '0');
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000).toString().padStart(2, '0');

      setTimeLeft({ label: targetLabel, text: `${hours}h ${mins}m ${secs}s` });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sunrise, sunset]);

  return (
    <div className="data-widget-card" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
        <div>
          <span className="instrument-gauge__label">{timeLeft.label}</span>
          <span className="mono-num" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-heading-md)', fontWeight: 700, color: 'var(--color-accent-teal)', display: 'block', marginTop: '2px' }}>
            {timeLeft.text}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="instrument-gauge__label">Lunar Phase</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption-md)', fontWeight: 500, color: 'var(--color-ink)', display: 'block', marginTop: '2px' }}>
            {moonPhaseName || 'Synodic Moon'}
          </span>
        </div>
      </div>
    </div>
  );
}
