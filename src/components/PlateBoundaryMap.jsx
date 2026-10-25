import { useRef, useEffect } from 'react';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

const PLATE_BOUNDARIES = [
  [
    [-45, 170], [-35, 178], [-15, 175], [0, 140], [15, 145], [35, 140],
    [52, 160], [60, -170], [55, -160], [60, -140], [50, -130], [35, -120],
    [18, -105], [8, -83], [-5, -81], [-20, -75], [-40, -75], [-55, -70]
  ],
  [
    [70, -15], [64, -20], [50, -30], [30, -40], [15, -45], [0, -20],
    [-20, -12], [-40, -15], [-55, -5]
  ],
  [
    [36, -5], [38, 15], [38, 30], [35, 45], [30, 70], [28, 85], [22, 95], [5, 95]
  ],
];

export function PlateBoundaryMap({ quakes = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0B0F1A';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(202, 202, 203, 0.1)';
    ctx.lineWidth = 1.5;

    for (let lat = -80; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let lon = -180; lon < 180; lon += 30) {
      const x = ((lon + 180) / 360) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const getX = (lon) => ((lon + 180) / 360) * width;
    const getY = (lat) => ((90 - lat) / 180) * height;

    ctx.strokeStyle = 'rgba(45, 212, 191, 0.75)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);

    PLATE_BOUNDARIES.forEach((poly) => {
      ctx.beginPath();
      poly.forEach(([lat, lon], i) => {
        const x = getX(lon);
        const y = getY(lat);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    ctx.setLineDash([]);

    const activeQuakes = quakes.length > 0 ? quakes : [
      { lat: 37.77, lon: -122.41, mag: 4.2 },
      { lat: 35.67, lon: 139.65, mag: 5.4 },
      { lat: -33.86, lon: 151.2, mag: 3.1 },
      { lat: 19.43, lon: -99.13, mag: 4.8 },
      { lat: -15.5, lon: -75.2, mag: 5.8 },
    ];

    activeQuakes.slice(0, 35).forEach((q) => {
      const px = getX(q.lon);
      const py = getY(q.lat);
      const radius = q.mag >= 5.0 ? 10 : q.mag >= 4.0 ? 7 : 4;
      const color = q.mag >= 5.0 ? '#EF4444' : q.mag >= 4.0 ? '#60A5FA' : '#34D399';

      ctx.fillStyle = `${color}44`;
      ctx.beginPath();
      ctx.arc(px, py, radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [quakes]);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2 className="chart-card__title">Tectonic Plate Boundaries & Live Quake Overlay</h2>
          <span className="chart-card__subtitle">
            Plate Boundary Reference — quakes cluster along these lines; boundaries themselves do not move in real time.
          </span>
        </div>
        <span className="badge-promo" style={{ color: 'var(--color-accent-teal)', borderColor: 'var(--color-accent-teal)' }}>
          TECTONIC REFERENCE MAP
        </span>
      </div>
      <div className="chart-canvas-container" style={{ height: '320px' }}>
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
