import { useRef, useEffect } from 'react';
import '../styles/components/starfield.css';

export function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    ctx.clearRect(0, 0, width, height);

    // Draw 150 low-opacity brass and parchment star dots
    const numStars = 150;
    const colors = ['rgba(201, 162, 39, 0.4)', 'rgba(236, 230, 214, 0.3)', 'rgba(95, 191, 169, 0.25)'];

    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 1.2 + 0.4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  return <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />;
}
