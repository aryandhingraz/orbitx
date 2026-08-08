import { useRef, useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { playTelemetryPing } from '../utils/soundSynthesizer.js';
import '../styles/components/canvasChart.css';

export function SeismicScatterChart({ quakes = [] }) {
  const canvasRef = useRef(null);
  const { soundEnabled } = useSettings();

  const [activeQuake, setActiveQuake] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    const padding = 70;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    // Draw Axes
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#A9A38F';
    ctx.font = '20px IBM Plex Mono';
    ctx.textAlign = 'center';
    ctx.fillText('Magnitude (M 0 .. 8)', width / 2, height - 15);

    ctx.save();
    ctx.translate(25, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Depth (0 .. 300 km)', 0, 0);
    ctx.restore();

    if (!quakes || quakes.length === 0) {
      ctx.fillStyle = '#A9A38F';
      ctx.font = '22px IBM Plex Mono';
      ctx.fillText('Awaiting seismic telemetry...', width / 2, height / 2);
      return;
    }

    // Scatter Dots
    quakes.forEach((q) => {
      const mag = Math.min(8, Math.max(0, q.mag || 1));
      const depth = Math.min(300, Math.max(0, q.coordinates?.[2] || 10));

      const x = padding + (mag / 8) * chartW;
      const y = padding + (depth / 300) * chartH;
      const isSelected = activeQuake?.id === q.id;

      const radius = isSelected ? Math.max(8, mag * 3.5) : Math.max(4, mag * 2.5);
      const color = mag >= 5.0 ? '#E2604F' : mag >= 3.5 ? '#C9A227' : '#5FBFA9';

      ctx.fillStyle = isSelected ? '#FFFFFF' : color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing outer ring for active quake
      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.beginPath();
      ctx.arc(x, y, radius + (isSelected ? 6 : 3), 0, Math.PI * 2);
      ctx.stroke();
    });

    // Tooltip Card for Active Quake
    if (activeQuake) {
      const mag = Math.min(8, Math.max(0, activeQuake.mag || 1));
      const depth = Math.min(300, Math.max(0, activeQuake.coordinates?.[2] || 10));

      const x = padding + (mag / 8) * chartW;
      const boxW = 320;
      const boxH = 90;
      let boxX = x + 20;
      if (boxX + boxW > width - 20) boxX = x - boxW - 20;
      const boxY = padding + 10;

      ctx.fillStyle = 'rgba(20, 26, 46, 0.95)';
      ctx.strokeStyle = '#E2604F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#E2604F';
      ctx.font = '700 20px Space Grotesk';
      ctx.textAlign = 'left';
      ctx.fillText(`Magnitude M ${activeQuake.mag.toFixed(1)}`, boxX + 16, boxY + 30);

      ctx.fillStyle = '#ECE6D6';
      ctx.font = '18px IBM Plex Mono';
      ctx.fillText(`Location: ${activeQuake.place || 'Unknown'}`, boxX + 16, boxY + 56);
      ctx.fillText(`Depth: ${depth.toFixed(1)} km`, boxX + 16, boxY + 78);
    }
  }, [quakes, activeQuake]);

  function handlePointerMove(e) {
    if (!quakes || quakes.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const clientY = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    const normX = (clientX / rect.width) * canvas.width;
    const normY = (clientY / rect.height) * canvas.height;

    const padding = 70;
    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - padding * 2;

    // Find nearest quake dot
    let closest = null;
    let minDist = Infinity;

    quakes.forEach((q) => {
      const mag = Math.min(8, Math.max(0, q.mag || 1));
      const depth = Math.min(300, Math.max(0, q.coordinates?.[2] || 10));

      const qx = padding + (mag / 8) * chartW;
      const qy = padding + (depth / 300) * chartH;

      const dist = Math.hypot(normX - qx, normY - qy);
      if (dist < minDist) {
        minDist = dist;
        closest = q;
      }
    });

    if (minDist < 60 && closest?.id !== activeQuake?.id) {
      setActiveQuake(closest);
      playTelemetryPing(soundEnabled);
    }
  }

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2 className="chart-card__title">Seismic Energy & Depth Matrix</h2>
          <span className="chart-card__subtitle">👆 Move cursor / touch over dots to inspect epicenter details</span>
        </div>
        {activeQuake && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--signal)' }}>
            M {activeQuake.mag} • {activeQuake.place}
          </span>
        )}
      </div>
      <div className="chart-canvas-container">
        <canvas
          ref={canvasRef}
          className="chart-canvas"
          style={{ cursor: 'crosshair' }}
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onMouseLeave={() => setActiveQuake(null)}
        />
      </div>
    </div>
  );
}
