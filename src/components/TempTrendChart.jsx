import { useRef, useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { playTelemetryPing } from '../utils/soundSynthesizer.js';
import '../styles/components/canvasChart.css';

export function TempTrendChart({ dailyData = [], unit = '°C' }) {
  const canvasRef = useRef(null);
  const { soundEnabled } = useSettings();

  const [activeIndex, setActiveIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    if (!dailyData || dailyData.length === 0) {
      ctx.fillStyle = '#A9A38F';
      ctx.font = '24px IBM Plex Mono';
      ctx.fillText('Telemetry data pending...', 40, height / 2);
      return;
    }

    const padding = 70;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const maxTemps = dailyData.map((d) => d.maxTemp);
    const minTemps = dailyData.map((d) => d.minTemp);

    const maxVal = Math.max(...maxTemps, 40) + 2;
    const minVal = Math.min(...minTemps, 0) - 2;

    // Draw Grid Lines & Labels
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.12)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      const val = Math.round(maxVal - ((maxVal - minVal) / 4) * i);
      ctx.fillStyle = '#A9A38F';
      ctx.font = '20px IBM Plex Mono';
      ctx.fillText(`${val}${unit}`, 15, y + 6);
    }

    const getX = (idx) => padding + (chartW / (dailyData.length - 1)) * idx;
    const getY = (val) => padding + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    // Gradient Area under Max Temp Curve
    const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
    grad.addColorStop(0, 'rgba(201, 162, 39, 0.35)');
    grad.addColorStop(1, 'rgba(201, 162, 39, 0.0)');

    ctx.beginPath();
    dailyData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.maxTemp);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(getX(dailyData.length - 1), height - padding);
    ctx.lineTo(getX(0), height - padding);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Max Temp Curve (Brass)
    ctx.beginPath();
    ctx.strokeStyle = '#C9A227';
    ctx.lineWidth = 4;
    dailyData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.maxTemp);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Min Temp Curve (Verdigris Dashed)
    ctx.beginPath();
    ctx.strokeStyle = '#5FBFA9';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    dailyData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.minTemp);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Data Point Dots
    dailyData.forEach((d, i) => {
      const x = getX(i);
      const yMax = getY(d.maxTemp);
      const isCurrent = activeIndex === i;

      ctx.fillStyle = isCurrent ? '#FFFFFF' : '#C9A227';
      ctx.beginPath();
      ctx.arc(x, yMax, isCurrent ? 10 : 6, 0, Math.PI * 2);
      ctx.fill();

      const dayLabel = new Date(d.time).toLocaleDateString([], { weekday: 'short' });
      ctx.fillStyle = isCurrent ? '#C9A227' : '#ECE6D6';
      ctx.font = isCurrent ? '700 24px Space Grotesk' : '22px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(dayLabel, x, height - 15);
    });

    // INTERACTIVE SCRUBBER CROSSHAIR & FLOATING TOOLTIP
    if (activeIndex !== null && activeIndex >= 0 && activeIndex < dailyData.length) {
      const target = dailyData[activeIndex];
      const x = getX(activeIndex);
      const yMax = getY(target.maxTemp);
      const yMin = getY(target.minTemp);

      // Vertical Scrubber Line
      ctx.strokeStyle = 'rgba(201, 162, 39, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      // Min dot highlight
      ctx.fillStyle = '#5FBFA9';
      ctx.beginPath();
      ctx.arc(x, yMin, 8, 0, Math.PI * 2);
      ctx.fill();

      // Tooltip Card Box
      const boxW = 260;
      const boxH = 100;
      let boxX = x + 20;
      if (boxX + boxW > width - 20) boxX = x - boxW - 20;
      const boxY = padding + 10;

      ctx.fillStyle = 'rgba(20, 26, 46, 0.95)';
      ctx.strokeStyle = '#C9A227';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      // Tooltip Text Content
      const dateStr = new Date(target.time).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
      ctx.fillStyle = '#C9A227';
      ctx.font = '700 20px Space Grotesk';
      ctx.textAlign = 'left';
      ctx.fillText(dateStr, boxX + 16, boxY + 30);

      ctx.fillStyle = '#ECE6D6';
      ctx.font = '20px IBM Plex Mono';
      ctx.fillText(`Max: ${target.maxTemp}${unit}`, boxX + 16, boxY + 60);

      ctx.fillStyle = '#5FBFA9';
      ctx.fillText(`Min: ${target.minTemp}${unit}`, boxX + 16, boxY + 86);
    }
  }, [dailyData, unit, activeIndex]);

  // Pointer Drag & Hover Tracking Handlers
  function handlePointerMove(e) {
    if (!dailyData || dailyData.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const normX = (clientX / rect.width) * canvas.width;

    const padding = 70;
    const chartW = canvas.width - padding * 2;
    const rawIdx = Math.round(((normX - padding) / chartW) * (dailyData.length - 1));
    const idx = Math.max(0, Math.min(dailyData.length - 1, rawIdx));

    if (idx !== activeIndex) {
      setActiveIndex(idx);
      playTelemetryPing(soundEnabled);
    }
  }

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2 className="chart-card__title">7-Day Temperature Trend</h2>
          <span className="chart-card__subtitle">👆 Drag cursor / touch across graph to track data points</span>
        </div>
        {activeIndex !== null && dailyData[activeIndex] && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--brass)' }}>
            TRACKING: {dailyData[activeIndex].maxTemp}{unit} / {dailyData[activeIndex].minTemp}{unit}
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
