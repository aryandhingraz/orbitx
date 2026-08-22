import { useRef, useEffect, useState } from 'react';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

export function HumidityTrendChart({ hourlyHumidity = [] }) {
  const canvasRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    const data = hourlyHumidity.length > 0 ? hourlyHumidity : [65, 68, 70, 72, 75, 74, 70, 65, 60, 55, 50, 48, 52, 55, 58, 62, 65, 68, 70, 72, 74, 72, 68, 65];

    const padding = 70;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const maxVal = 100;
    const minVal = 0;

    ctx.strokeStyle = 'rgba(202, 202, 203, 0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      const val = Math.round(maxVal - (100 / 4) * i);
      ctx.fillStyle = COLOR_TOKENS.mute.hexStr;
      ctx.font = '20px IBM Plex Mono';
      ctx.fillText(`${val}%`, 15, y + 6);
    }

    const getX = (idx) => padding + (chartW / (data.length - 1)) * idx;
    const getY = (val) => padding + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
    grad.addColorStop(0, 'rgba(17, 81, 255, 0.35)');
    grad.addColorStop(1, 'rgba(17, 81, 255, 0.0)');

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(getX(data.length - 1), height - padding);
    ctx.lineTo(getX(0), height - padding);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = COLOR_TOKENS.info.hexStr;
    ctx.lineWidth = 4;
    data.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    if (activeIndex !== null && activeIndex >= 0 && activeIndex < data.length) {
      const sx = getX(activeIndex);
      const sy = getY(data[activeIndex]);

      ctx.strokeStyle = COLOR_TOKENS.accentTeal.hexStr;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sx, padding);
      ctx.lineTo(sx, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_TOKENS.accentTeal.hexStr;
      ctx.fill();
    }
  }, [hourlyHumidity, activeIndex]);

  function handlePointerMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = 35;
    const chartW = rect.width - padding * 2;
    const count = hourlyHumidity.length || 24;
    const idx = Math.max(0, Math.min(count - 1, Math.round(((x - padding) / chartW) * (count - 1))));
    setActiveIndex(idx);
  }

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2 className="chart-card__title">24-Hour Relative Humidity Telemetry</h2>
          <span className="chart-card__subtitle">👆 Drag cursor / touch across graph to inspect hourly humidity %</span>
        </div>
        {activeIndex !== null && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption-md)', color: 'var(--color-info)', fontWeight: 600 }}>
            {activeIndex}:00 → {hourlyHumidity[activeIndex] || 65}% RH
          </span>
        )}
      </div>
      <div className="chart-canvas-container">
        <canvas
          ref={canvasRef}
          className="chart-canvas"
          style={{ cursor: 'crosshair' }}
          onMouseMove={handlePointerMove}
          onMouseLeave={() => setActiveIndex(null)}
        />
      </div>
    </div>
  );
}
