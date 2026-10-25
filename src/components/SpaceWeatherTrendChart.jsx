import { useRef, useEffect, useState } from 'react';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

export function SpaceWeatherTrendChart({ kHistory = [] }) {
  const canvasRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  // Normalize data whether it's objects or raw numbers
  const rawList = Array.isArray(kHistory) && kHistory.length > 0 ? kHistory : [2, 2, 3, 2, 4, 3, 2, 2];
  const data = rawList.map((item, idx) => {
    if (typeof item === 'object' && item !== null) {
      return {
        kp: typeof item.kp === 'number' ? item.kp : parseFloat(item.kp) || 2,
        time: item.time || `${(idx * 3).toString().padStart(2, '0')}:00`,
        timeFull: item.timeFull || `${item.time || ''} UTC`,
      };
    }
    const kpVal = typeof item === 'number' ? item : parseFloat(item) || 2;
    return {
      kp: kpVal,
      time: `${(idx * 3).toString().padStart(2, '0')}:00`,
      timeFull: `${(idx * 3).toString().padStart(2, '0')}:00 UTC`,
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function render() {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.min(window.devicePixelRatio || 2, 2);
      const width = (canvas.width = parent.clientWidth * dpr);
      const height = (canvas.height = parent.clientHeight * dpr);

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);

      const paddingLeft = 60 * (dpr / 2);
      const paddingRight = 40 * (dpr / 2);
      const paddingTop = 40 * (dpr / 2);
      const paddingBottom = 50 * (dpr / 2);

      const chartW = width - paddingLeft - paddingRight;
      const chartH = height - paddingTop - paddingBottom;

      const maxKp = 9;

      // Draw Background Grid Lines (Kp 0, 3, 6, 9)
      ctx.strokeStyle = 'rgba(202, 202, 203, 0.15)';
      ctx.lineWidth = 1.5;
      for (let k = 0; k <= 3; k++) {
        const kpLevel = k * 3;
        const y = paddingTop + chartH - (kpLevel / maxKp) * chartH;

        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();

        ctx.fillStyle = COLOR_TOKENS.mute.hexStr;
        ctx.font = '600 16px IBM Plex Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`Kp ${kpLevel}`, paddingLeft - 10, y + 5);
      }

      // X-Axis Baseline
      ctx.strokeStyle = 'rgba(202, 202, 203, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, paddingTop + chartH);
      ctx.lineTo(width - paddingRight, paddingTop + chartH);
      ctx.stroke();

      const count = data.length;
      const slotW = chartW / count;
      const barW = Math.max(16, Math.min(slotW * 0.65, 48));

      // Draw Bars
      data.forEach((item, i) => {
        const x = paddingLeft + slotW * i + slotW / 2;
        const barH = Math.max(6, (item.kp / maxKp) * chartH);
        const y = paddingTop + chartH - barH;
        const isHovered = activeIndex === i;

        // Color based on NOAA SWPC scale
        let barColor = COLOR_TOKENS.successBright?.hexStr || '#1EAA52';
        if (item.kp >= 5) {
          barColor = COLOR_TOKENS.sale.hexStr || '#D30005';
        } else if (item.kp >= 4) {
          barColor = COLOR_TOKENS.info.hexStr || '#3B82F6';
        }

        ctx.fillStyle = barColor;
        ctx.beginPath();
        ctx.roundRect(x - barW / 2, y, barW, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Highlight stroke on active bar
        if (isHovered) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Value text above bar
        ctx.fillStyle = isHovered ? '#FFFFFF' : '#CBD5E1';
        ctx.font = isHovered ? '700 16px IBM Plex Mono, monospace' : '600 15px IBM Plex Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${item.kp}`, x, y - 8);

        // Time label below bar
        ctx.fillStyle = isHovered ? COLOR_TOKENS.accentTeal.hexStr : COLOR_TOKENS.mute.hexStr;
        ctx.font = isHovered ? '700 15px Space Grotesk, sans-serif' : '500 14px Space Grotesk, sans-serif';
        ctx.fillText(item.time, x, paddingTop + chartH + 24);
      });

      // Active Tooltip & Scrubber Line
      if (activeIndex !== null && activeIndex >= 0 && activeIndex < data.length) {
        const activeItem = data[activeIndex];
        const activeX = paddingLeft + slotW * activeIndex + slotW / 2;

        // Vertical Scrubber Guide
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(activeX, paddingTop);
        ctx.lineTo(activeX, paddingTop + chartH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Status description
        let statusStr = 'Quiet / Nominal';
        let statusColor = '#34D399';
        if (activeItem.kp >= 5) {
          statusStr = 'Geomagnetic Storm Alert';
          statusColor = '#F87171';
        } else if (activeItem.kp >= 4) {
          statusStr = 'Unsettled / Active';
          statusColor = '#60A5FA';
        }

        const timeStr = `Time: ${activeItem.timeFull || activeItem.time}`;
        const kpStr = `Planetary K-Index: Kp ${activeItem.kp}`;
        const descStr = `Status: ${statusStr}`;

        ctx.font = '700 18px Space Grotesk, sans-serif';
        const wTime = ctx.measureText(timeStr).width;
        ctx.font = '600 16px IBM Plex Mono, monospace';
        const wKp = ctx.measureText(kpStr).width;
        const wDesc = ctx.measureText(descStr).width;

        const boxW = Math.max(wTime, wKp, wDesc, 230) + 36;
        const boxH = 92;

        let boxX = activeX + 16;
        if (boxX + boxW > width - 16) {
          boxX = activeX - boxW - 16;
        }
        if (boxX < 16) boxX = 16;

        let boxY = paddingTop + 10;
        if (boxY + boxH > height - 16) {
          boxY = height - boxH - 16;
        }

        // Floating Tooltip Box
        ctx.fillStyle = 'rgba(10, 13, 24, 0.96)';
        ctx.strokeStyle = statusColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '700 18px Space Grotesk, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(timeStr, boxX + 16, boxY + 28);

        ctx.fillStyle = statusColor;
        ctx.font = '600 16px IBM Plex Mono, monospace';
        ctx.fillText(kpStr, boxX + 16, boxY + 54);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '500 15px IBM Plex Mono, monospace';
        ctx.fillText(descStr, boxX + 16, boxY + 78);
      }
    }

    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [data, activeIndex]);

  function handlePointerMove(e) {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;

    const paddingLeft = 30;
    const paddingRight = 20;
    const chartW = rect.width - paddingLeft - paddingRight;
    const slotW = chartW / data.length;

    const rawIdx = Math.floor((clientX - paddingLeft) / slotW);
    const idx = Math.max(0, Math.min(data.length - 1, rawIdx));
    setActiveIndex(idx);
  }

  const activeTarget = activeIndex !== null && data[activeIndex] ? data[activeIndex] : null;

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h2 className="chart-card__title">24-Hour Planetary K-Index Profile</h2>
          <span className="chart-card__subtitle">
            👆 Drag cursor or touch bars to inspect 3-hour geomagnetic Kp readings (NOAA SWPC)
          </span>
        </div>
        {activeTarget && (
          <span className="chart-tracking-pill">
            <span
              className="chart-tracking-dot"
              style={{
                backgroundColor:
                  activeTarget.kp >= 5
                    ? 'var(--color-sale)'
                    : activeTarget.kp >= 4
                    ? 'var(--color-info)'
                    : 'var(--color-success-bright)',
              }}
            ></span>
            TRACKING: {activeTarget.time} → Kp {activeTarget.kp}{' '}
            {activeTarget.kp >= 5 ? '(Storm Alert)' : activeTarget.kp >= 4 ? '(Active)' : '(Nominal)'}
          </span>
        )}
      </div>
      <div className="chart-canvas-container" style={{ height: '270px' }}>
        <canvas
          ref={canvasRef}
          className="chart-canvas"
          style={{ cursor: 'crosshair' }}
          onMouseMove={handlePointerMove}
          onMouseLeave={() => setActiveIndex(null)}
          onTouchStart={(e) => handlePointerMove(e)}
          onTouchMove={(e) => handlePointerMove(e)}
          onTouchEnd={() => setActiveIndex(null)}
        />
      </div>
    </div>
  );
}
