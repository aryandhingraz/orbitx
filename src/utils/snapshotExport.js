/**
 * Snapshot Export Utility (§14)
 * Renders telemetry entry onto an off-screen HTML5 canvas and triggers PNG download
 */
export function exportSnapshotAsImage(entry) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  // Background — Deep Navy Void
  ctx.fillStyle = '#0B0E1A';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Brass Border
  ctx.strokeStyle = '#C9A227';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Header Title
  ctx.fillStyle = '#C9A227';
  ctx.font = '700 28px Space Grotesk';
  ctx.fillText('ORBITX — TELEMETRY SNAPSHOT', 50, 70);

  // Timestamp & Location
  ctx.fillStyle = '#A9A38F';
  ctx.font = '16px IBM Plex Mono';
  ctx.fillText(`Timestamp: ${new Date(entry.timestamp).toLocaleString()}`, 50, 105);
  ctx.fillText(`Station: ${entry.location || 'Greenwich Observatory'}`, 50, 130);

  // Divider Line
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 150);
  ctx.lineTo(canvas.width - 50, 150);
  ctx.stroke();

  // Telemetry Grid Items
  let y = 190;
  ctx.font = '20px IBM Plex Mono';

  const metrics = [
    `Temperature: ${entry.temp ?? '—'}`,
    `Air Quality: ${entry.aqi ?? '—'} AQI`,
    `Seismic Count: ${entry.quakes ?? '—'} earthquakes (24h)`,
    `ISS Altitude: ${entry.issAltitude ?? '418'} km`,
    `ISS Speed: ${entry.issSpeed ?? '27580'} km/h`,
    `Moon Phase: ${entry.moonPhase ?? 'Full Moon'}`,
  ];

  metrics.forEach((text, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 50 : 420;
    const curY = y + row * 60;

    // Card Box Fill
    ctx.fillStyle = '#141A2E';
    ctx.fillRect(x, curY, 330, 48);
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.2)';
    ctx.strokeRect(x, curY, 330, 48);

    // Text Fill
    ctx.fillStyle = '#ECE6D6';
    ctx.fillText(text, x + 15, curY + 30);
  });

  // Footer Tag
  ctx.fillStyle = '#5FBFA9';
  ctx.font = '14px Space Grotesk';
  ctx.fillText('SYSTEM OK • BECSE Front End Engineering II', 50, canvas.height - 40);

  // Trigger Image Download
  const link = document.createElement('a');
  link.download = `orbitx-snapshot-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
