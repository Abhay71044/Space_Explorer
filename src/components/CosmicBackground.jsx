import React, { useEffect, useRef } from 'react';

export default function CosmicBackground({ isDark }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    let mouseX = 0;
    let mouseY = 0;

    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        sign: 1
      });
    }

    const meteors = [];
    const resetMeteor = (idx) => {
      meteors[idx] = {
        x: Math.random() * w * 0.8 + w * 0.2,
        y: -100,
        len: Math.random() * 100 + 50,
        speed: Math.random() * 12 + 6,
        thickness: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        cooldown: Math.floor(Math.random() * 300) + 100
      };
    };

    for (let i = 0; i < 2; i++) {
      resetMeteor(i);
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - w / 2) * 0.05;
      mouseY = (e.clientY - h / 2) * 0.05;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let animId;
    const render = () => {
      if (!isDark) {
        // Light mode background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, w, h);

        const nebulaGrad = ctx.createRadialGradient(
          w / 2 + mouseX, h / 2 + mouseY, 10,
          w / 2, h / 2, Math.max(w, h)
        );
        nebulaGrad.addColorStop(0, 'rgba(224, 242, 254, 0.8)');
        nebulaGrad.addColorStop(0.4, 'rgba(241, 245, 249, 0.6)');
        nebulaGrad.addColorStop(1, 'rgba(248, 250, 252, 1)');
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#2563eb';
        stars.forEach((s) => {
          s.opacity += s.twinkleSpeed * s.sign;
          if (s.opacity >= 1 || s.opacity <= 0.15) s.sign *= -1;

          let px = s.x - mouseX * 0.3;
          let py = s.y - mouseY * 0.3;
          if (px < 0) px = w;
          if (px > w) px = 0;
          if (py < 0) py = h;
          if (py > h) py = 0;

          ctx.globalAlpha = s.opacity * 0.5;
          ctx.beginPath();
          ctx.arc(px, py, s.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      } else {
        // Dark mode cosmic background
        ctx.fillStyle = '#020205';
        ctx.fillRect(0, 0, w, h);

        const nebulaGrad = ctx.createRadialGradient(
          w / 2 + mouseX, h / 2 + mouseY, 10,
          w / 2, h / 2, Math.max(w, h)
        );
        nebulaGrad.addColorStop(0, 'rgba(10, 10, 30, 0.6)');
        nebulaGrad.addColorStop(0.3, 'rgba(8, 5, 20, 0.4)');
        nebulaGrad.addColorStop(1, 'rgba(2, 2, 5, 1)');
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#ffffff';
        stars.forEach((s) => {
          s.opacity += s.twinkleSpeed * s.sign;
          if (s.opacity >= 1 || s.opacity <= 0.1) s.sign *= -1;

          let px = s.x - mouseX * 0.3;
          let py = s.y - mouseY * 0.3;
          if (px < 0) px = w;
          if (px > w) px = 0;
          if (py < 0) py = h;
          if (py > h) py = 0;

          ctx.globalAlpha = s.opacity;
          ctx.beginPath();
          ctx.arc(px, py, s.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        meteors.forEach((m, idx) => {
          if (m.cooldown > 0) {
            m.cooldown--;
            return;
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${m.opacity})`;
          ctx.lineWidth = m.thickness;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.len, m.y + m.len);
          ctx.stroke();

          m.x -= m.speed;
          m.y += m.speed;

          if (m.y > h + 100 || m.x < -100) {
            resetMeteor(idx);
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
