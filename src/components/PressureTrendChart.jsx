import { useRef, useEffect, useState } from 'react';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

export function PressureTrendChart({ hourlyPressure = [] }) {
  const canvasRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    const data = hourlyPressure.length > 0 ? hourlyPressure : [1013, 1014, 1015, 1012, 1010, 1011, 1013, 1016, 1018, 1015, 1013, 1012, 1014, 1016, 1015, 1013, 1012, 1014, 1015, 1016, 1014, 1013, 1012, 1013];

    const padding = 70;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const maxVal = Math.max(...data, 1030) + 2;
    const minVal = Math.min(...data, 980) - 2;

    ctx.strokeStyle = 'rgba(202, 202, 203, 0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      const val = Math.round(maxVal - ((maxVal - minVal) / 4) * i);
      ctx.fillStyle = COLOR_TOKENS.mute.hexStr;
      ctx.font = '20px IBM Plex Mono';
      ctx.fillText(`${val}hPa`, 10, y + 6);
    }

    const getX = (idx) => padding + (chartW / (data.length - 1)) * idx;
    const getY = (val) => padding + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
    grad.addColorStop(0, 'rgba(10, 114, 129, 0.35)');
    grad.addColorStop(1, 'rgba(10, 114, 129, 0.0)');

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
    ctx.strokeStyle = COLOR_TOKENS.accentTeal.hexStr;
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

      ctx.strokeStyle = COLOR_TOKENS.info.hexStr;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sx, padding);
      ctx.lineTo(sx, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_TOKENS.info.hexStr;
      ctx.fill();

      // Floating in-canvas tooltip for pressure
      const timeStr = `Time: ${activeIndex.toString().padStart(2, '0')}:00`;
      const pressVal = data[activeIndex] || 1013;
      const pressStr = `Pressure: ${pressVal} hPa`;

      ctx.font = '700 20px Space Grotesk, sans-serif';
      const wTime = ctx.measureText(timeStr).width;
      ctx.font = '600 20px IBM Plex Mono, monospace';
      const wPress = ctx.measureText(pressStr).width;

      const boxW = Math.max(wTime, wPress, 200) + 36;
      const boxH = 80;

      let boxX = sx + 20;
      if (boxX + boxW > width - 16) {
        boxX = sx - boxW - 20;
      }
      if (boxX < 16) boxX = 16;

      let boxY = padding + 10;
      if (boxY + boxH > height - 16) {
        boxY = height - boxH - 16;
      }

      ctx.fillStyle = 'rgba(10, 13, 24, 0.96)';
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = '700 20px Space Grotesk, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(timeStr, boxX + 18, boxY + 30);

      ctx.fillStyle = '#93C5FD';
      ctx.font = '600 20px IBM Plex Mono, monospace';
      ctx.fillText(pressStr, boxX + 18, boxY + 60);
    }
  }, [hourlyPressure, activeIndex]);

  function handlePointerMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const padding = 35;
    const chartW = rect.width - padding * 2;
    const count = hourlyPressure.length || 24;
    const idx = Math.max(0, Math.min(count - 1, Math.round(((clientX - padding) / chartW) * (count - 1))));
    setActiveIndex(idx);
  }

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2 className="chart-card__title">24-Hour Atmospheric Pressure Trend</h2>
          <span className="chart-card__subtitle">👆 Drag cursor / touch across graph to inspect hourly hPa readout</span>
        </div>
        {activeIndex !== null && (
          <span className="chart-tracking-pill">
            <span className="chart-tracking-dot"></span>
            TRACKING: {activeIndex.toString().padStart(2, '0')}:00 → {hourlyPressure[activeIndex] || 1013} hPa
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
          onTouchStart={(e) => handlePointerMove(e)}
          onTouchMove={(e) => handlePointerMove(e)}
          onTouchEnd={() => setActiveIndex(null)}
        />
      </div>
    </div>
  );
}
