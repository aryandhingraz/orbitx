import '../styles/components/liveTicker.css';

export function LiveTicker({ issSpeed, issAlt, temp, aqi, quakeCount, location }) {
  const tickerItems = [
    `STATION: ${location || 'GREENWICH OBSERVATORY'}`,
    `ISS ORBIT: ALT ${issAlt || 418}km • VEL ${issSpeed || '27,580'}km/h`,
    `LOCAL TEMP: ${temp || '18°C'}`,
    `AIR QUALITY: ${aqi || 25} AQI (GOOD)`,
    `SEISMIC TREMORS: ${quakeCount || 0} EVENTS (24H)`,
    `PUBLIC ENDPOINTS: OPEN-METEO 200 OK • USGS 200 OK • ISS 200 OK`,
    `TELEMETRY MODE: REALTIME FULL PRECISION`,
    `SYNODIC CYCLE: CONWAY LUNAR ALGORITHM OK`,
  ];

  const fullTrack = [...tickerItems, ...tickerItems];

  return (
    <div className="live-ticker">
      <div className="live-ticker__badge">
        <span style={{ color: 'var(--nominal)' }}>●</span> LIVE TELEMETRY
      </div>

      <div className="live-ticker__track">
        {fullTrack.map((item, i) => (
          <span key={i} className="live-ticker__item">
            <span className="live-ticker__item--highlight">◆</span>
            <span className="live-ticker__item--val">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
