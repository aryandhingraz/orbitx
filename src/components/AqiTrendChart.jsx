import { useRef, useEffect } from 'react';
import '../styles/components/canvasChart.css';

export function AqiTrendChart({ hourlyAqi = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    const data = hourlyAqi.length ? hourlyAqi : [20, 25, 30, 45, 50, 60, 55, 40, 35, 30, 28, 25];

    const padding = 50;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const maxVal = Math.max(...data, 100);

    // Draw AQI Threshold Bands
    const getY = (val) => padding + chartH - (val / maxVal) * chartH;

    // Good band (0-50)
    ctx.fillStyle = 'rgba(95, 191, 169, 0.08)';
    ctx.fillRect(padding, getY(50), chartW, chartH - (getY(50) - padding));

    // Moderate band (51-100)
    ctx.fillStyle = 'rgba(201, 162, 39, 0.08)';
    ctx.fillRect(padding, getY(100), chartW, getY(50) - getY(100));

    // Area Curve
    const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
    grad.addColorStop(0, 'rgba(95, 191, 169, 0.4)');
    grad.addColorStop(1, 'rgba(95, 191, 169, 0.0)');

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding + (chartW / (data.length - 1)) * i;
      const y = getY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + chartW, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line Curve
    ctx.beginPath();
    ctx.strokeStyle = '#5FBFA9';
    ctx.lineWidth = 4;
    data.forEach((val, i) => {
      const x = padding + (chartW / (data.length - 1)) * i;
      const y = getY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Hour ticks
    data.forEach((_, i) => {
      if (i % 4 === 0) {
        const x = padding + (chartW / (data.length - 1)) * i;
        ctx.fillStyle = '#A9A38F';
        ctx.font = '20px IBM Plex Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`${i}:00`, x, height - 15);
      }
    });
  }, [hourlyAqi]);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">24-Hour Air Quality Curve</h2>
        <span className="chart-card__subtitle">US AQI Telemetry</span>
      </div>
      <div className="chart-canvas-container">
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
