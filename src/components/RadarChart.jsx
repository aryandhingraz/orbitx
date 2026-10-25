import { useRef, useEffect } from 'react';
import { RADAR_CITY_COLORS, COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

export function RadarChart({ citiesData = [] }) {
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
    const radius = Math.min(width, height) / 2 - 60;

    const axes = ['Temp', 'Air Quality', 'Wind Speed', 'Pressure', 'Humidity'];
    const totalAxes = axes.length;

    for (let r = 1; r <= 4; r++) {
      const curR = (radius / 4) * r;
      ctx.strokeStyle = 'rgba(202, 202, 203, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = (i / totalAxes) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + curR * Math.cos(angle);
        const y = centerY + curR * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    axes.forEach((label, i) => {
      const angle = (i / totalAxes) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.strokeStyle = 'rgba(202, 202, 203, 0.25)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      const labelX = Math.max(50, Math.min(width - 50, centerX + (radius + 28) * Math.cos(angle)));
      const labelY = Math.max(20, Math.min(height - 20, centerY + (radius + 28) * Math.sin(angle)));
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '600 18px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, labelX, labelY);
    });

    citiesData.forEach((city, cityIdx) => {
      const colorToken = RADAR_CITY_COLORS[cityIdx % RADAR_CITY_COLORS.length];
      const hex = colorToken?.hexStr || '#2DD4BF';
      const values = city.normalizedValues || [0.5, 0.5, 0.5, 0.5, 0.5];

      ctx.beginPath();
      values.forEach((val, i) => {
        const angle = (i / totalAxes) * Math.PI * 2 - Math.PI / 2;
        const r = radius * Math.max(0.1, Math.min(1, val));
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      ctx.fillStyle = `${hex}33`;
      ctx.fill();

      ctx.strokeStyle = hex;
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }, [citiesData]);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">Multi-Metric Comparative Radar</h2>
        <span className="chart-card__subtitle">Real Normalized Telemetry Polygon</span>
      </div>
      <div className="chart-canvas-container" style={{ height: '260px' }}>
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
