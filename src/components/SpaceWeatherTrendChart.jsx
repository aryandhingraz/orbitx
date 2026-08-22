import { useRef, useEffect } from 'react';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

export function SpaceWeatherTrendChart({ kHistory = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    const data = kHistory.length > 0 ? kHistory : [2, 2, 3, 2, 4, 5, 4, 3, 2, 3, 2, 2];

    const padding = 60;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const maxVal = 9;
    const minVal = 0;

    ctx.strokeStyle = 'rgba(202, 202, 203, 0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 3; i++) {
      const y = padding + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      const kpLabel = Math.round(9 - (9 / 3) * i);
      ctx.fillStyle = COLOR_TOKENS.mute.hexStr;
      ctx.font = '20px IBM Plex Mono';
      ctx.fillText(`Kp ${kpLabel}`, 10, y + 6);
    }

    const getX = (idx) => padding + (chartW / (data.length - 1)) * idx;
    const getY = (val) => padding + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    data.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      const color = val >= 5 ? COLOR_TOKENS.sale.hexStr : val >= 4 ? COLOR_TOKENS.info.hexStr : COLOR_TOKENS.success.hexStr;

      ctx.fillStyle = color;
      ctx.fillRect(x - 12, y, 24, height - padding - y);

      ctx.fillStyle = COLOR_TOKENS.ink.hexStr;
      ctx.font = 'bold 16px IBM Plex Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`Kp${val}`, x, y - 8);
    });
  }, [kHistory]);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2 className="chart-card__title">24-Hour Planetary K-Index Profile</h2>
          <span className="chart-card__subtitle">Geomagnetic Activity Index (NOAA SWPC Scale Kp 0-9)</span>
        </div>
      </div>
      <div className="chart-canvas-container" style={{ height: '260px' }}>
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
