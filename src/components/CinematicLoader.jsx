import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Sparkles } from 'lucide-react';
import { playRocketLaunchRumble } from '../utils/audioSynthesizer';

const STATUS_MESSAGES = [
  "Initializing Deep Space Network Protocol...",
  "Aligning Orbital Telemetry with Lagrange L1...",
  "Decrypting NASA EPIC Spectral Data Cores...",
  "Calculating Real-Time ISS & Solar Coordinates...",
  "Establishing Quantum Communication Link..."
];

export default function CinematicLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Warp-speed starfield animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const stars = Array.from({ length: 120 }, () => ({
      x: (Math.random() - 0.5) * w,
      y: (Math.random() - 0.5) * h,
      z: Math.random() * w,
      size: Math.random() * 2 + 1
    }));

    let animId;
    const render = () => {
      ctx.fillStyle = "#020208";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      stars.forEach(star => {
        star.z -= 4;
        if (star.z <= 0) {
          star.z = w;
          star.x = (Math.random() - 0.5) * w;
          star.y = (Math.random() - 0.5) * h;
        }

        const k = 250 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= w && py >= 0 && py <= h) {
          const alpha = 1 - star.z / w;
          const r = star.size * k * 0.4;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, r), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#00f2fe";
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(render);
    };
    render();

    // Progress timer
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 12) + 6;
        if (next >= 100) {
          clearInterval(interval);
          playRocketLaunchRumble();
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        setStatusIdx(Math.min(Math.floor(next / 20), STATUS_MESSAGES.length - 1));
        return next;
      });
    }, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      cancelAnimationFrame(animId);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020208] flex flex-col items-center justify-center p-6 text-center font-orbitron overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Perfectly Centered Orbit Core & 3D Spinning Blue Earth */}
      <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
        {/* Ambient Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl animate-pulse"></div>

        {/* Pulsing Outer Ping Ring */}
        <div className="absolute w-36 h-36 rounded-full border border-neon-cyan/40 animate-ping"></div>

        {/* Rotating Outer Telemetry Ring */}
        <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-neon-cyan/50 animate-[spin_10s_linear_infinite]"></div>

        {/* Counter-Rotating Inner Telemetry Ring */}
        <div className="absolute w-28 h-28 rounded-full border border-dashed border-neon-purple/70 animate-[spin_6s_linear_infinite_reverse]"></div>

        {/* Dead-Centered 3D Rotating Blue Earth Sphere */}
        <div className="relative w-24 h-24 rounded-full border-2 border-neon-cyan/90 p-0.5 flex items-center justify-center bg-black shadow-glow-cyan overflow-hidden z-10">
          <div className="w-full h-full rounded-full overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,242,254,0.8)]">
            <img 
              src="https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg" 
              alt="3D Spinning Earth" 
              className="w-full h-full object-cover rounded-full animate-[spin_14s_linear_infinite] scale-125"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=500&q=80';
              }}
            />
            {/* Real Atmosphere Blue Glow Overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/40 via-transparent to-blue-600/60 pointer-events-none border border-cyan-300/40"></div>
          </div>
        </div>
      </div>

      {/* Title Header */}
      <div className="relative z-10 max-w-lg mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 mb-3 tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> DEEP SPACE TELEMETRY SYSTEM
        </div>
        <h1 className="text-xl sm:text-2xl font-black gradient-text-cyan tracking-wider">
          COSMA SPACE EXPLORER
        </h1>
      </div>

      {/* Progress Bar Container */}
      <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium">Uplink Status</span>
          <span className="text-neon-cyan font-bold font-mono">{progress}%</span>
        </div>

        <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-neon-cyan via-blue-500 to-neon-purple rounded-full transition-all duration-200 shadow-glow-cyan"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-300 mt-3 h-4 truncate">
          {STATUS_MESSAGES[statusIdx]}
        </p>
      </div>

      {/* Quick Skip Button */}
      <button 
        onClick={() => { playRocketLaunchRumble(); onComplete(); }}
        className="relative z-10 text-[11px] text-slate-400 hover:text-neon-cyan flex items-center gap-1 mt-2 transition cursor-pointer"
      >
        <FastForward className="w-3.5 h-3.5" /> Skip Launch Telemetry
      </button>
    </div>
  );
}
