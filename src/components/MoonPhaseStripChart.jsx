import { useRef, useEffect } from 'react';
import { getMoonPhase } from '../utils/moonPhase.js';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

export function MoonPhaseStripChart() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    const today = new Date();
    const days = Array.from({ length: 8 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return { date: d, phase: getMoonPhase(d) };
    });

    const stepX = width / days.length;

    days.forEach((item, i) => {
      const centerX = stepX * i + stepX / 2;
      const centerY = height / 2 - 15;
      const radius = 28;

      // Dark Moon Disc Base
      ctx.fillStyle = COLOR_TOKENS.softCloud.hexStr;
      ctx.strokeStyle = COLOR_TOKENS.hairline.hexStr;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Illuminated Crescent / Gibbous Shape (Accent Teal)
      const illum = item.phase.illuminationPercent / 100;
      ctx.fillStyle = COLOR_TOKENS.accentTeal.hexStr;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2, illum > 0.5);
      ctx.ellipse(centerX, centerY, Math.abs(radius * (1 - 2 * illum)), radius, 0, Math.PI / 2, -Math.PI / 2, illum < 0.5);
      ctx.fill();

      // Date & Phase Label
      const dayStr = i === 0 ? 'Today' : item.date.toLocaleDateString([], { weekday: 'short' });
      ctx.fillStyle = COLOR_TOKENS.ink.hexStr;
      ctx.font = '20px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(dayStr, centerX, height - 35);

      ctx.fillStyle = COLOR_TOKENS.mute.hexStr;
      ctx.font = '16px IBM Plex Mono';
      ctx.fillText(`${item.phase.illuminationPercent}%`, centerX, height - 12);
    });
  }, []);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">8-Day Lunar Phase Strip</h2>
        <span className="chart-card__subtitle">Synodic Cycle Telemetry</span>
      </div>
      <div className="chart-canvas-container">
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
