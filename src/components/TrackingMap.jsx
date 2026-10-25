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

    // Glowing ISS marker
    ctx.strokeStyle = '#2DD4BF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(px, py, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#2DD4BF';
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fill();

    // Telemetry text strings
    const titleStr = 'ISS (NORAD 25544) • LIVE';
    const latStr = `${Math.abs(issLat).toFixed(2)}°${issLat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(issLon).toFixed(2)}°${issLon >= 0 ? 'E' : 'W'}`;
    const telemStr = `${latStr}, ${lonStr} • Alt: ${issAlt}km • Vel: ${issVel.toLocaleString()}km/h`;

    ctx.font = '700 22px Space Grotesk, sans-serif';
    const wTitle = ctx.measureText(titleStr).width;
    ctx.font = '600 20px IBM Plex Mono, monospace';
    const wTelem = ctx.measureText(telemStr).width;

    const boxW = Math.max(wTitle, wTelem) + 36;
    const boxH = 80;

    let boxX = px + 24;
    if (boxX + boxW > width - 16) {
      boxX = px - boxW - 24;
    }
    if (boxX < 16) boxX = 16;

    let boxY = py - boxH / 2;
    if (boxY < 16) boxY = 16;
    if (boxY + boxH > height - 16) boxY = height - boxH - 16;

    // Rounded background box with high contrast
    ctx.fillStyle = 'rgba(10, 13, 24, 0.96)';
    ctx.strokeStyle = '#2DD4BF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 22px Space Grotesk, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(titleStr, boxX + 18, boxY + 30);

    ctx.fillStyle = '#2DD4BF';
    ctx.font = '600 20px IBM Plex Mono, monospace';
    ctx.fillText(telemStr, boxX + 18, boxY + 62);
  }, [issLat, issLon, issAlt, issVel]);

  const latDisplay = `${Math.abs(issLat).toFixed(2)}°${issLat >= 0 ? 'N' : 'S'}`;
  const lonDisplay = `${Math.abs(issLon).toFixed(2)}°${issLon >= 0 ? 'E' : 'W'}`;

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2 className="chart-card__title">Live 2D ISS Tracking Map (Equirectangular)</h2>
          <span className="chart-card__subtitle">5-Second Live Satellite Coordinates & Orbital Path</span>
        </div>
        <span className="chart-tracking-pill">
          <span className="chart-tracking-dot"></span>
          TRACKING: {latDisplay}, {lonDisplay} | {issAlt}km
        </span>
      </div>
      <div className="chart-canvas-container" style={{ height: '320px' }}>
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
