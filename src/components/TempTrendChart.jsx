import { useRef, useEffect } from 'react';
import '../styles/components/canvasChart.css';

export function TempTrendChart({ dailyData = [], unit = '°C' }) {
  const canvasRef = useRef(null);

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

    const padding = 60;
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
      ctx.fillText(`${val}${unit}`, 10, y + 6);
    }

    // Helper X mapping
    const getX = (idx) => padding + (chartW / (dailyData.length - 1)) * idx;
    // Helper Y mapping
    const getY = (val) => padding + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    // Draw Gradient Area under Max Temp Curve
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

    // Draw Max Temp Curve
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

    // Draw Min Temp Curve
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

    // Draw Data Points & Date Labels
    dailyData.forEach((d, i) => {
      const x = getX(i);
      const yMax = getY(d.maxTemp);

      // Max dot
      ctx.fillStyle = '#C9A227';
      ctx.beginPath();
      ctx.arc(x, yMax, 6, 0, Math.PI * 2);
      ctx.fill();

      // Date label
      const dayLabel = new Date(d.time).toLocaleDateString([], { weekday: 'short' });
      ctx.fillStyle = '#ECE6D6';
      ctx.font = '22px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(dayLabel, x, height - 15);
    });
  }, [dailyData, unit]);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">7-Day Temperature Trend</h2>
        <span className="chart-card__subtitle">Max (Brass) vs Min (Verdigris)</span>
      </div>
      <div className="chart-canvas-container">
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
