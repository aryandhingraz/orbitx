import { useRef, useEffect } from 'react';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

export function QuakeDistChart({ quakes = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth * 2);
    const height = (canvas.height = canvas.parentElement.clientHeight * 2);

    ctx.clearRect(0, 0, width, height);

    const buckets = [
      { label: '<2.5 M', count: 0, color: COLOR_TOKENS.success.hexStr },
      { label: '2.5-4.0 M', count: 0, color: COLOR_TOKENS.accentTeal.hexStr },
      { label: '4.0-5.5 M', count: 0, color: COLOR_TOKENS.info.hexStr },
      { label: '≥5.5 M', count: 0, color: COLOR_TOKENS.sale.hexStr },
    ];

    quakes.forEach((q) => {
      const m = q.mag || 0;
      if (m < 2.5) buckets[0].count++;
      else if (m < 4.0) buckets[1].count++;
      else if (m < 5.5) buckets[2].count++;
      else buckets[3].count++;
    });

    const maxCount = Math.max(...buckets.map((b) => b.count), 5);
    const padding = 60;
    const barW = (width - padding * 2) / buckets.length - 40;

    buckets.forEach((b, i) => {
      const x = padding + i * (barW + 40) + 20;
      const barH = (b.count / maxCount) * (height - padding * 2);
      const y = height - padding - barH;

      ctx.fillStyle = b.color;
      ctx.fillRect(x, y, barW, barH);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = '600 22px IBM Plex Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${b.count}`, x + barW / 2, y - 10);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '600 20px Space Grotesk, sans-serif';
      ctx.fillText(b.label, x + barW / 2, height - 15);
    });
  }, [quakes]);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">24h Seismic Distribution</h2>
        <span className="chart-card__subtitle">USGS Earthquakes Feed</span>
      </div>
      <div className="chart-canvas-container">
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
