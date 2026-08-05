import React, { useEffect, useRef } from 'react';

export default function HeroGlobeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const size = (canvas.width = canvas.height = 420);
    const cx = size / 2;
    const cy = size / 2;
    const earthRadius = 110;
    let rotationAngle = 0;
    let moonAngle = 0;

    const continents = [
      [-50, -20, 30], [20, 10, 45], [-10, 30, 20], [60, -30, 15],
      [-70, 50, 25], [10, -50, 35], [50, 40, 20]
    ];

    let animId;
    const drawMoon = (x, y) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.arc(x + 3, y, 14, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
    };

    const drawGlobe = () => {
      ctx.clearRect(0, 0, size, size);

      // Satellite orbital path ellipse
      ctx.strokeStyle = 'rgba(79, 172, 254, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 190, 65, -Math.PI / 12, 0, Math.PI * 2);
      ctx.stroke();

      // 1. Atmosphere glowing ring
      const glowGrad = ctx.createRadialGradient(cx, cy, earthRadius - 10, cx, cy, earthRadius + 45);
      glowGrad.addColorStop(0, 'rgba(0, 242, 254, 0.35)');
      glowGrad.addColorStop(0.3, 'rgba(79, 172, 254, 0.18)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius + 45, 0, Math.PI * 2);
      ctx.fill();

      // 2. Earth base ocean sphere
      ctx.fillStyle = '#0c152b';
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ocean depth inner shadow
      const innerShadow = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, earthRadius);
      innerShadow.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      innerShadow.addColorStop(0.8, 'rgba(0, 0, 0, 0.7)');
      innerShadow.addColorStop(1, '#000000');
      ctx.fillStyle = innerShadow;
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw continents rotating
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
      ctx.clip();

      rotationAngle += 0.003;
      ctx.fillStyle = '#10b981';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#10b981';

      continents.forEach((c) => {
        const theta = (c[0] * Math.PI) / 180 + rotationAngle;
        const phi = (c[1] * Math.PI) / 180;

        const px = cx + earthRadius * Math.cos(phi) * Math.sin(theta);
        const py = cy + earthRadius * Math.sin(phi);
        const depth = Math.cos(phi) * Math.cos(theta);

        if (depth > 0) {
          ctx.globalAlpha = depth;
          ctx.beginPath();
          ctx.arc(px, py, c[2] * depth, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // 4. Moon orbiting Earth
      moonAngle += 0.007;
      const moonDistX = 170;
      const moonDistY = 45;
      const mx = cx + moonDistX * Math.cos(moonAngle);
      const my = cy + moonDistY * Math.sin(moonAngle);
      const moonZ = Math.sin(moonAngle);

      if (moonZ < 0) {
        drawMoon(mx, my);
      }

      // 5. Draw satellites rotating
      const satAngle = -moonAngle * 1.5;
      const sx = cx + 190 * Math.cos(satAngle);
      const sy = cy + 65 * Math.sin(satAngle);

      const rotatedSx = cx + (sx - cx) * Math.cos(-Math.PI / 12) - (sy - cy) * Math.sin(-Math.PI / 12);
      const rotatedSy = cy + (sx - cx) * Math.sin(-Math.PI / 12) + (sy - cy) * Math.cos(-Math.PI / 12);

      ctx.fillStyle = '#00f2fe';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f2fe';
      ctx.beginPath();
      ctx.arc(rotatedSx, rotatedSy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (moonZ >= 0) {
        drawMoon(mx, my);
      }

      animId = requestAnimationFrame(drawGlobe);
    };

    drawGlobe();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full flex justify-center items-center">
      <div className="absolute w-72 h-72 rounded-full bg-neon-cyan/10 blur-3xl -z-10 animate-pulse-slow"></div>
      <canvas ref={canvasRef} className="max-w-full h-auto drop-shadow-[0_0_35px_rgba(0,242,254,0.3)]" />
    </div>
  );
}
