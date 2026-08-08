import { useRef, useEffect } from 'react';
import '../styles/components/canvasChart.css';

export function SeismicScatterChart({ quakes = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    const padding = 60;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    // Draw Axes
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#A9A38F';
    ctx.font = '20px IBM Plex Mono';
    ctx.textAlign = 'center';
    ctx.fillText('Magnitude (M 0 .. 8)', width / 2, height - 15);

    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Depth (0 .. 300 km)', 0, 0);
    ctx.restore();

    if (!quakes || quakes.length === 0) {
      ctx.fillStyle = '#A9A38F';
      ctx.font = '22px IBM Plex Mono';
      ctx.fillText('Awaiting seismic telemetry...', width / 2, height / 2);
      return;
    }

    // Scatter Dots: Mag (X axis 0..8) vs Depth (Y axis 0..300 km)
    quakes.forEach((q) => {
      const mag = Math.min(8, Math.max(0, q.mag || 1));
      const depth = Math.min(300, Math.max(0, q.coordinates?.[2] || 10));

      const x = padding + (mag / 8) * chartW;
      const y = padding + (depth / 300) * chartH;
      const radius = Math.max(4, mag * 2.5);

      // Color coding by magnitude
      const color = mag >= 5.0 ? '#E2604F' : mag >= 3.5 ? '#C9A227' : '#5FBFA9';

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Soft glow ring
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, [quakes]);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">Seismic Energy & Depth Matrix</h2>
        <span className="chart-card__subtitle">Magnitude vs Depth (km)</span>
      </div>
      <div className="chart-canvas-container">
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
