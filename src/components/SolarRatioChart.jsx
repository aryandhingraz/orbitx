import { useRef, useEffect } from 'react';
import '../styles/components/canvasChart.css';

export function SolarRatioChart({ dayLengthSec = 45180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    const totalDaySec = 86400;
    const dayFraction = Math.max(0.1, Math.min(0.9, dayLengthSec / totalDaySec));
    const dayAngle = dayFraction * Math.PI * 2;

    // Background Circle (Night)
    ctx.strokeStyle = '#141A2E';
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Daylight Arc (Brass)
    ctx.strokeStyle = '#C9A227';
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + dayAngle);
    ctx.stroke();

    // Center Text
    const dayHours = (dayLengthSec / 3600).toFixed(1);
    const nightHours = ((86400 - dayLengthSec) / 3600).toFixed(1);

    ctx.fillStyle = '#ECE6D6';
    ctx.font = '700 32px Space Grotesk';
    ctx.textAlign = 'center';
    ctx.fillText(`${dayHours} hrs`, centerX, centerY - 5);

    ctx.fillStyle = '#A9A38F';
    ctx.font = '20px IBM Plex Mono';
    ctx.fillText(`Daylight / ${nightHours}h Night`, centerX, centerY + 30);
  }, [dayLengthSec]);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">Solar Daylight Ratio</h2>
        <span className="chart-card__subtitle">Solar Terminator Hours</span>
      </div>
      <div className="chart-canvas-container">
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
