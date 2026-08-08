import { useRef, useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { playTelemetryPing } from '../utils/soundSynthesizer.js';
import '../styles/components/canvasChart.css';

export function AqiTrendChart({ hourlyAqi = [] }) {
  const canvasRef = useRef(null);
  const { soundEnabled } = useSettings();

  const [activeIndex, setActiveIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const data = hourlyAqi.length ? hourlyAqi : [20, 25, 30, 45, 50, 60, 55, 40, 35, 30, 28, 25, 22, 28, 35, 48, 52, 65, 58, 42, 36, 30, 26, 22];

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

    const maxVal = Math.max(...data, 100);
    const getY = (val) => padding + chartH - (val / maxVal) * chartH;
    const getX = (idx) => padding + (chartW / (data.length - 1)) * idx;

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
      const x = getX(i);
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
      const x = getX(i);
      const y = getY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Hour ticks
    data.forEach((_, i) => {
      if (i % 4 === 0) {
        const x = getX(i);
        ctx.fillStyle = '#A9A38F';
        ctx.font = '20px IBM Plex Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`${i}:00`, x, height - 15);
      }
    });

    // INTERACTIVE SCRUBBER CROSSHAIR & TOOLTIP
    if (activeIndex !== null && activeIndex >= 0 && activeIndex < data.length) {
      const aqiVal = data[activeIndex];
      const x = getX(activeIndex);
      const y = getY(aqiVal);

      // Vertical Scrubber Line
      ctx.strokeStyle = 'rgba(95, 191, 169, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point Dot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5FBFA9';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Tooltip Card
      const boxW = 240;
      const boxH = 80;
      let boxX = x + 20;
      if (boxX + boxW > width - 20) boxX = x - boxW - 20;
      const boxY = padding + 10;

      ctx.fillStyle = 'rgba(20, 26, 46, 0.95)';
      ctx.strokeStyle = '#5FBFA9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      let categoryStr = 'Good';
      if (aqiVal > 50 && aqiVal <= 100) categoryStr = 'Moderate';
      else if (aqiVal > 100) categoryStr = 'Unhealthy';

      ctx.fillStyle = '#5FBFA9';
      ctx.font = '700 20px Space Grotesk';
      ctx.textAlign = 'left';
      ctx.fillText(`Time: ${activeIndex}:00`, boxX + 16, boxY + 30);

      ctx.fillStyle = '#ECE6D6';
      ctx.font = '20px IBM Plex Mono';
      ctx.fillText(`AQI: ${aqiVal} (${categoryStr})`, boxX + 16, boxY + 60);
    }
  }, [data, activeIndex]);

  function handlePointerMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const normX = (clientX / rect.width) * canvas.width;

    const padding = 60;
    const chartW = canvas.width - padding * 2;
    const rawIdx = Math.round(((normX - padding) / chartW) * (data.length - 1));
    const idx = Math.max(0, Math.min(data.length - 1, rawIdx));

    if (idx !== activeIndex) {
      setActiveIndex(idx);
      playTelemetryPing(soundEnabled);
    }
  }

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2 className="chart-card__title">24-Hour Air Quality Curve</h2>
          <span className="chart-card__subtitle">👆 Drag cursor / touch across graph to track AQI</span>
        </div>
        {activeIndex !== null && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--verdigris)' }}>
            {activeIndex}:00 → {data[activeIndex]} AQI
          </span>
        )}
      </div>
      <div className="chart-canvas-container">
        <canvas
          ref={canvasRef}
          className="chart-canvas"
          style={{ cursor: 'crosshair' }}
          onMouseDown={(e) => { setIsDragging(true); handlePointerMove(e); }}
          onMouseMove={(e) => { if (isDragging || e.buttons === 1) handlePointerMove(e); }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => { setIsDragging(false); setActiveIndex(null); }}
          onTouchStart={(e) => { setIsDragging(true); handlePointerMove(e); }}
          onTouchMove={(e) => { handlePointerMove(e); }}
          onTouchEnd={() => { setIsDragging(false); setActiveIndex(null); }}
        />
      </div>
    </div>
  );
}
