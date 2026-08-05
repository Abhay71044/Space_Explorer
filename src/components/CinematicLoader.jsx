import React, { useState, useEffect, useRef } from 'react';
import { FastForward } from 'lucide-react';
import { playRocketLaunchRumble } from '../utils/audioSynthesizer';

const STATUS_MESSAGES = [
  "Establishing link with Deep Space Network...",
  "Aligning telemetry antennas with Lagrange L1...",
  "Querying EPIC spectral imaging cores...",
  "Caching planetary orbital trajectories...",
  "Establishing encrypted chatbot uplink..."
];

export default function CinematicLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Particle Canvas Animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 2,
        speed: Math.random() * 2 + 1
      });
    }

    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(2, 2, 5, 0.15)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        p.y += p.speed;
        if (p.y > h) {
          p.y = 0;
          p.x = Math.random() * w;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    // Progress timer
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          clearInterval(interval);
          playRocketLaunchRumble();
          setTimeout(() => onComplete(), 600);
          return 100;
        }
        setStatusIdx(Math.min(Math.floor(next / 20), STATUS_MESSAGES.length - 1));
        return next;
      });
    }, 180);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#020205] flex flex-col items-center justify-center p-6 text-center font-orbitron">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Logo Glow Ring */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-neon-cyan/20 blur-xl animate-ping"></div>
        <img 
          src="./Assets/logo_512.webp" 
          alt="COSMA Logo" 
          className="w-20 h-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain" 
        />
      </div>

      <h2 className="text-sm sm:text-base font-bold text-neon-cyan tracking-widest mb-3 animate-pulse">
        CONNECTING TO NASA DEEP SPACE NETWORK
      </h2>

      {/* Progress Bar */}
      <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden mb-4 border border-neon-cyan/30">
        <div 
          className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-200"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="text-xs text-slate-400 font-inter mb-8">{STATUS_MESSAGES[statusIdx]}</p>

      <button 
        onClick={onComplete}
        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-bold flex items-center gap-2 transition"
      >
        Skip Transmission <FastForward className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
