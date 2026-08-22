import { useRef, useEffect } from 'react';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

export function TrackingMap({ issLat = 28.5, issLon = -84.2, issAlt = 418, issVel = 27580 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0A0D18';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(202, 202, 203, 0.12)';
    ctx.lineWidth = 1.5;

    for (let lat = -80; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let lon = -180; lon < 180; lon += 30) {
      const x = ((lon + 180) / 360) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(10, 114, 129, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(10, 114, 129, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();

    for (let x = 0; x <= width; x += 4) {
      const lon = (x / width) * 360 - 180;
      const lat = 51.6 * Math.sin(((lon - issLon) * Math.PI) / 180);
      const y = ((90 - lat) / 180) * height;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    const px = ((issLon + 180) / 360) * width;
    const py = ((90 - issLat) / 180) * height;

    ctx.strokeStyle = COLOR_TOKENS.accentTeal.hexStr;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = COLOR_TOKENS.accentTeal.hexStr;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLOR_TOKENS.ink.hexStr;
    ctx.strokeStyle = COLOR_TOKENS.hairline.hexStr;
    ctx.lineWidth = 1;
    ctx.fillRect(px + 14, py - 26, 180, 52);
    ctx.strokeRect(px + 14, py - 26, 180, 52);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Inter';
    ctx.fillText(`ISS (NORAD 25544)`, px + 22, py - 8);

    ctx.fillStyle = COLOR_TOKENS.mute.hexStr;
    ctx.font = '14px IBM Plex Mono';
    ctx.fillText(`${issLat.toFixed(1)}°, ${issLon.toFixed(1)}° | ${issAlt}km`, px + 22, py + 14);
  }, [issLat, issLon, issAlt, issVel]);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2 className="chart-card__title">Live 2D ISS Tracking Map (Equirectangular)</h2>
          <span className="chart-card__subtitle">5-Second Live Satellite Coordinates & Orbital Path</span>
        </div>
        <span className="badge-promo" style={{ color: 'var(--color-accent-teal)', borderColor: 'var(--color-accent-teal)' }}>
          ● LIVE ORBITAL TRACK
        </span>
      </div>
      <div className="chart-canvas-container" style={{ height: '320px' }}>
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
