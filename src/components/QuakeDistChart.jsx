import { useRef, useEffect } from 'react';
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

    // Group quakes by magnitude bucket: <2.5, 2.5-4.0, 4.0-5.5, >=5.5
    const buckets = [
      { label: '<2.5 M', count: 0, color: '#5FBFA9' },
      { label: '2.5-4.0 M', count: 0, color: '#C9A227' },
      { label: '4.0-5.5 M', count: 0, color: '#E28743' },
      { label: '≥5.5 M', count: 0, color: '#E2604F' },
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

      // Bar Fill
      ctx.fillStyle = b.color;
      ctx.fillRect(x, y, barW, barH);

      // Value label on top
      ctx.fillStyle = '#ECE6D6';
      ctx.font = '22px IBM Plex Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`${b.count}`, x + barW / 2, y - 10);

      // Bucket label below
      ctx.fillStyle = '#A9A38F';
      ctx.font = '20px Space Grotesk';
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
