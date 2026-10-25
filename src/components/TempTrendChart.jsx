import { useRef, useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { playTelemetryPing } from '../utils/soundSynthesizer.js';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
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
      ctx.fillStyle = COLOR_TOKENS.mute.hexStr;
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
      ctx.fillText(`${val}${unit}`, 15, y + 6);
    }

    const getX = (idx) => padding + (chartW / (dailyData.length - 1)) * idx;
    const getY = (val) => padding + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    // Gradient Area under Max Temp Curve
    const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
    grad.addColorStop(0, 'rgba(211, 0, 5, 0.25)');
    grad.addColorStop(1, 'rgba(211, 0, 5, 0.0)');

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

    // Max Temp Curve (Sale Red)
    ctx.beginPath();
    ctx.strokeStyle = COLOR_TOKENS.sale.hexStr;
    ctx.lineWidth = 4;
    dailyData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.maxTemp);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Min Temp Curve (Info Blue Dashed)
    ctx.beginPath();
    ctx.strokeStyle = COLOR_TOKENS.info.hexStr;
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

      ctx.fillStyle = isCurrent ? '#FFFFFF' : COLOR_TOKENS.sale.hexStr;
      ctx.beginPath();
      ctx.arc(x, yMax, isCurrent ? 10 : 6, 0, Math.PI * 2);
      ctx.fill();

      const dayLabel = new Date(d.time).toLocaleDateString([], { weekday: 'short' });
      ctx.fillStyle = isCurrent ? COLOR_TOKENS.sale.hexStr : COLOR_TOKENS.ink.hexStr;
      ctx.font = isCurrent ? '700 24px Space Grotesk' : '22px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(dayLabel, x, height - 15);
    });

    // INTERACTIVE SCRUBBER CROSSHAIR & FLOATING TOOLTIP
    if (activeIndex !== null && activeIndex >= 0 && activeIndex < dailyData.length) {
      const target = dailyData[activeIndex];
      const x = getX(activeIndex);
      const yMin = getY(target.minTemp);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#60A5FA';
      ctx.beginPath();
      ctx.arc(x, yMin, 8, 0, Math.PI * 2);
      ctx.fill();

      const dateStr = new Date(target.time).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
      const maxStr = `Max Temp: ${target.maxTemp}${unit}`;
      const minStr = `Min Temp: ${target.minTemp}${unit}`;

      ctx.font = '700 20px Space Grotesk, sans-serif';
      const wDate = ctx.measureText(dateStr).width;
      ctx.font = '600 20px IBM Plex Mono, monospace';
      const wMax = ctx.measureText(maxStr).width;
      const wMin = ctx.measureText(minStr).width;

      const boxW = Math.max(wDate, wMax, wMin, 240) + 40;
      const boxH = 104;

      let boxX = x + 20;
      if (boxX + boxW > width - 16) {
        boxX = x - boxW - 20;
      }
      if (boxX < 16) boxX = 16;

      let boxY = padding + 10;
      if (boxY + boxH > height - 16) {
        boxY = height - boxH - 16;
      }

      ctx.fillStyle = 'rgba(10, 13, 24, 0.96)';
      ctx.strokeStyle = '#D30005';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = '700 20px Space Grotesk, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(dateStr, boxX + 18, boxY + 30);

      ctx.fillStyle = '#FCA5A5';
      ctx.font = '600 20px IBM Plex Mono, monospace';
      ctx.fillText(maxStr, boxX + 18, boxY + 60);

      ctx.fillStyle = '#93C5FD';
      ctx.font = '600 20px IBM Plex Mono, monospace';
      ctx.fillText(minStr, boxX + 18, boxY + 88);
    }
  }, [dailyData, unit, activeIndex]);

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
          <span className="chart-tracking-pill">
            <span className="chart-tracking-dot"></span>
            TRACKING: {dailyData[activeIndex].maxTemp}{unit} / {dailyData[activeIndex].minTemp}{unit}
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
