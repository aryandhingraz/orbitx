import { useRef, useEffect } from 'react';
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
    const radius = Math.min(width, height) / 2 - 50;

    const axes = ['Temp', 'Air Quality', 'Wind Speed', 'Pressure', 'Humidity'];
    const totalAxes = axes.length;
    const colors = ['#C9A227', '#5FBFA9', '#E28743', '#9B51E0'];

    // Draw Radar Web Concentric Rings
    for (let r = 1; r <= 4; r++) {
      const curR = (radius / 4) * r;
      ctx.strokeStyle = 'rgba(201, 162, 39, 0.12)';
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

    // Draw Axes Lines & Labels
    axes.forEach((label, i) => {
      const angle = (i / totalAxes) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.strokeStyle = 'rgba(201, 162, 39, 0.25)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      const labelX = centerX + (radius + 24) * Math.cos(angle);
      const labelY = centerY + (radius + 24) * Math.sin(angle);
      ctx.fillStyle = '#ECE6D6';
      ctx.font = '18px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(label, labelX, labelY);
    });

    // Draw Radar Polygons for Each Compared City
    citiesData.forEach((city, cityIdx) => {
      const color = colors[cityIdx % colors.length];
      const values = city.normalizedValues || [0.6, 0.4, 0.5, 0.7, 0.5];

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

      ctx.fillStyle = `${color}22`;
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }, [citiesData]);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">Multi-Metric Comparative Radar</h2>
        <span className="chart-card__subtitle">Normalized Telemetry Polygon</span>
      </div>
      <div className="chart-canvas-container" style={{ height: '260px' }}>
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
