import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Layers, Compass, Eye, Info, Sparkles, Orbit, ChevronLeft, ChevronRight, Zap, Sun } from 'lucide-react';
import { playBeep } from '../utils/audioSynthesizer';

const PLANETS_DATA = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet',
    distAU: 0.39,
    distKm: '57.9 Million km',
    periodDays: '88 Days',
    diameter: '4,879 km',
    tempC: '167°C (-180°C to 430°C)',
    moons: 0,
    colors: { primary: '#cbd5e1', secondary: '#475569', core: '#64748b', glow: 'rgba(203, 213, 225, 0.5)' },
    radiusRatio: 0.38,
    orbitRadius: 55,
    orbitSpeed: 0.04,
    fact: "Smallest planet in the solar system. Experiences extreme temperature swings from 430°C during the day to -180°C at night.",
    details: ["Cratered ancient surface", "No atmosphere, ultra-thin exosphere", "Dense iron core (85% of planet radius)"]
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet',
    distAU: 0.72,
    distKm: '108.2 Million km',
    periodDays: '225 Days',
    diameter: '12,104 km',
    tempC: '464°C (Runaway Greenhouse)',
    moons: 0,
    colors: { primary: '#fde047', secondary: '#a16207', core: '#ca8a04', glow: 'rgba(253, 224, 71, 0.5)' },
    radiusRatio: 0.95,
    orbitRadius: 90,
    orbitSpeed: 0.028,
    fact: "Hottest planet in the solar system due to a dense carbon dioxide atmosphere trapping heat. Rotates clockwise in retrograde.",
    details: ["Surface pressure 92x Earth", "Clouds of sulfuric acid", "Volcanic plains cover 80% of surface"]
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Terrestrial Planet (Home)',
    distAU: 1.00,
    distKm: '149.6 Million km',
    periodDays: '365.25 Days',
    diameter: '12,742 km',
    tempC: '15°C (-89°C to 58°C)',
    moons: 1,
    colors: { primary: '#38bdf8', secondary: '#15803d', core: '#1d4ed8', glow: 'rgba(56, 189, 248, 0.6)' },
    radiusRatio: 1.0,
    orbitRadius: 130,
    orbitSpeed: 0.02,
    fact: "Only known planet to harbor liquid water oceans and abundant biological life under a nitrogen-oxygen protective sky.",
    details: ["71% surface covered by oceans", "Protective magnetosphere shield", "One natural satellite: The Moon"]
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial Planet',
    distAU: 1.52,
    distKm: '227.9 Million km',
    periodDays: '687 Days',
    diameter: '6,779 km',
    tempC: '-65°C (-153°C to 20°C)',
    moons: 2,
    colors: { primary: '#ef4444', secondary: '#7f1d1d', core: '#b91c1c', glow: 'rgba(239, 68, 68, 0.5)' },
    radiusRatio: 0.53,
    orbitRadius: 175,
    orbitSpeed: 0.014,
    fact: "The Red Planet. Home to Olympus Mons, the largest volcano in the solar system, and Valles Marineris canyon system.",
    details: ["Iron oxide dust gives red hue", "Two moons: Phobos & Deimos", "Polar ice caps of water & frozen CO2"]
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant',
    distAU: 5.20,
    distKm: '778.5 Million km',
    periodDays: '11.86 Years',
    diameter: '139,822 km',
    tempC: '-110°C',
    moons: 95,
    colors: { primary: '#f97316', secondary: '#7c2d12', core: '#c2410c', glow: 'rgba(249, 115, 22, 0.5)' },
    radiusRatio: 2.2,
    orbitRadius: 230,
    orbitSpeed: 0.009,
    fact: "Largest planet in the solar system. Mass is more than twice that of all other planets combined, featuring the Great Red Spot storm.",
    details: ["Great Red Spot storm wider than Earth", "95 confirmed satellites (Galilean Moons)", "Faint ring system composed of dust"]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant (Ringed World)',
    distAU: 9.58,
    distKm: '1.43 Billion km',
    periodDays: '29.45 Years',
    diameter: '116,460 km',
    tempC: '-140°C',
    moons: 146,
    colors: { primary: '#fef08a', secondary: '#854d0e', core: '#eab308', glow: 'rgba(254, 240, 138, 0.5)' },
    radiusRatio: 1.8,
    orbitRadius: 285,
    orbitSpeed: 0.006,
    fact: "Famous for its expansive, bright ring system composed of billions of ice chunks and rocky debris.",
    details: ["Ring system extends 282,000 km", "Titan moon has liquid methane lakes", "Least dense planet (would float in water)"]
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'Ice Giant',
    distAU: 19.22,
    distKm: '2.87 Billion km',
    periodDays: '84 Years',
    diameter: '50,724 km',
    tempC: '-195°C',
    moons: 28,
    colors: { primary: '#22d3ee', secondary: '#164e63', core: '#0891b2', glow: 'rgba(34, 211, 238, 0.5)' },
    radiusRatio: 1.4,
    orbitRadius: 335,
    orbitSpeed: 0.004,
    fact: "An ice giant rotating on its side with an extreme axial tilt of 97.8 degrees, causing 42-year seasons of darkness.",
    details: ["Methane atmospheric blue hue", "Rotates nearly perpendicular to orbit", "13 faint planetary rings"]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'Ice Giant',
    distAU: 30.05,
    distKm: '4.50 Billion km',
    periodDays: '164.8 Years',
    diameter: '49,244 km',
    tempC: '-200°C',
    moons: 16,
    colors: { primary: '#3b82f6', secondary: '#1e3a8a', core: '#1d4ed8', glow: 'rgba(59, 130, 246, 0.5)' },
    radiusRatio: 1.35,
    orbitRadius: 380,
    orbitSpeed: 0.0028,
    fact: "The most distant major planet. Features the fastest supersonic winds in the solar system, reaching up to 2,100 km/h.",
    details: ["Supersonic wind speed of 2,100 km/h", "Triton moon has active nitrogen geysers", "Deep azure methane atmosphere"]
  }
];

export default function SolarSystem3DView({ showToast }) {
  const [viewMode, setViewMode] = useState('orrery'); // 'orrery' or 'inspector'
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS_DATA[2]); // Default Earth
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isWireframe, setIsWireframe] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const orreryCanvasRef = useRef(null);
  const planetCanvasRef = useRef(null);
  const anglesRef = useRef(PLANETS_DATA.map((_, i) => (i * Math.PI) / 4));

  // 1. Interactive Solar System Orrery Canvas Renderer
  useEffect(() => {
    if (viewMode !== 'orrery') return;
    const canvas = orreryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const renderOrrery = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Deep Space Canvas Background Gradient
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, canvas.width * 0.6);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#030712');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Central Sun Glow & Core
      const sunRadius = 26;
      const sunGlow = ctx.createRadialGradient(centerX, centerY, sunRadius * 0.4, centerX, centerY, sunRadius * 2.8);
      sunGlow.addColorStop(0, '#ffffff');
      sunGlow.addColorStop(0.3, '#fde047');
      sunGlow.addColorStop(0.7, '#f97316');
      sunGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Sun Core Body
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sun Pulsing Flare Rings
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius + 4 + Math.sin(Date.now() * 0.005) * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Orbit Lines & Planets
      PLANETS_DATA.forEach((p, idx) => {
        const orbitR = p.orbitRadius * (canvas.width / 900);
        
        // Draw Orbit Path Line
        ctx.strokeStyle = selectedPlanet.id === p.id ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = selectedPlanet.id === p.id ? 1.8 : 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, orbitR, orbitR * 0.72, -Math.PI / 12, 0, Math.PI * 2);
        ctx.stroke();

        // Calculate Planet Position along Orbit Ellipse
        if (isPlaying) {
          anglesRef.current[idx] += p.orbitSpeed * 0.4 * speedMultiplier;
        }
        const angle = anglesRef.current[idx];
        const tilt = -Math.PI / 12;

        const rawX = orbitR * Math.cos(angle);
        const rawY = (orbitR * 0.72) * Math.sin(angle);

        // Rotated Coordinates
        const px = centerX + (rawX * Math.cos(tilt) - rawY * Math.sin(tilt));
        const py = centerY + (rawX * Math.sin(tilt) + rawY * Math.cos(tilt));

        // Draw Saturn's Ring in Orrery
        if (p.id === 'saturn') {
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(px, py, 14, 6, Math.PI / 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw Planet Body
        const pRadius = Math.max(4, p.radiusRatio * 4.5);
        ctx.fillStyle = p.colors.primary;
        ctx.beginPath();
        ctx.arc(px, py, pRadius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight ring around selected planet
        if (selectedPlanet.id === p.id) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, pRadius + 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = selectedPlanet.id === p.id ? '#38bdf8' : '#94a3b8';
        ctx.font = '10px Orbitron';
        ctx.fillText(p.name, px + pRadius + 4, py + 3);
      });

      animationFrameId = requestAnimationFrame(renderOrrery);
    };

    renderOrrery();
    return () => cancelAnimationFrame(animationFrameId);
  }, [viewMode, selectedPlanet, isPlaying, speedMultiplier]);

  // 2. Individual 3D Planet Inspection Canvas Renderer
  useEffect(() => {
    if (viewMode !== 'inspector') return;
    const canvas = planetCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let rotationAngle = 0;

    const renderPlanet3D = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width * 0.32;

      // Atmosphere Glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.4);
      glowGrad.addColorStop(0, selectedPlanet.colors.glow);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Base Planet Sphere Gradient
      const planetGrad = ctx.createRadialGradient(
        centerX - radius * 0.35,
        centerY - radius * 0.35,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      planetGrad.addColorStop(0, selectedPlanet.colors.primary);
      planetGrad.addColorStop(0.6, selectedPlanet.colors.core);
      planetGrad.addColorStop(1, selectedPlanet.colors.secondary);

      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Saturn Rings in 3D Inspector
      if (selectedPlanet.id === 'saturn') {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 7);

        // Back Ring Segment
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.85, radius * 0.5, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // Planet Surface Texture Details / Wireframe
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      if (isWireframe) {
        ctx.strokeStyle = selectedPlanet.colors.primary;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.5;

        for (let i = -radius; i <= radius; i += 18) {
          const shift = (rotationAngle * 25) % 36;
          ctx.beginPath();
          ctx.ellipse(centerX + ((i + shift) % (radius * 2) - radius), centerY, radius * 0.4, radius, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        for (let j = -radius; j <= radius; j += 20) {
          ctx.beginPath();
          ctx.moveTo(centerX - radius, centerY + j);
          ctx.lineTo(centerX + radius, centerY + j);
          ctx.stroke();
        }
      } else {
        // Cloud belts for Jupiter/Saturn/Uranus/Neptune or surface continents for Earth/Mars/Venus
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#ffffff';

        for (let b = 0; b < 6; b++) {
          const bandY = centerY + Math.sin(rotationAngle + b) * (radius * 0.7);
          const bandWidth = radius * (0.8 + Math.cos(b) * 0.4);
          ctx.beginPath();
          ctx.ellipse(centerX, bandY, bandWidth, radius * 0.14, rotationAngle * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }

        // Great Red Spot for Jupiter
        if (selectedPlanet.id === 'jupiter') {
          const spotX = centerX + Math.cos(rotationAngle) * (radius * 0.5);
          const spotY = centerY + radius * 0.3;
          ctx.fillStyle = '#ef4444';
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.ellipse(spotX, spotY, 22, 14, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Dark Continents / Craters
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = selectedPlanet.colors.secondary;
        const offset = (rotationAngle * 35) % (radius * 2);

        ctx.beginPath();
        ctx.arc(centerX - radius + offset, centerY - 15, radius * 0.45, 0, Math.PI * 2);
        ctx.arc(centerX + radius * 0.4 - offset, centerY + 25, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Terminator Night Shadow Overlay
      const shadowGrad = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
      shadowGrad.addColorStop(0.65, 'rgba(3, 7, 18, 0.45)');
      shadowGrad.addColorStop(1, 'rgba(3, 7, 18, 0.92)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Saturn Front Ring Segment
      if (selectedPlanet.id === 'saturn') {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 7);

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.85, radius * 0.5, 0, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
      }

      // Specular Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.4, centerY - radius * 0.4, radius * 0.12, 0, Math.PI * 2);
      ctx.fill();

      rotationAngle += 0.008;
      animationFrameId = requestAnimationFrame(renderPlanet3D);
    };

    renderPlanet3D();
    return () => cancelAnimationFrame(animationFrameId);
  }, [viewMode, selectedPlanet, isWireframe]);

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 max-w-7xl mx-auto font-orbitron">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/30 mb-3 animate-pulse">
          <Sun className="w-3.5 h-3.5" /> HELIOCENTRIC SOLAR SYSTEM LAB
        </span>
        <h1 className="text-3xl sm:text-5xl font-black gradient-text-cyan mb-3">
          🪐 3D Solar System & Planet Orrery
        </h1>
        <p className="text-slate-400 font-inter text-sm sm:text-base">
          Watch all 8 planets revolve around the Sun in real-time or switch into 3D Inspection Mode to observe each planet individually.
        </p>
      </div>

      {/* View Switcher Tabs & Controls */}
      <div className="glass-card p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { playBeep(600, 0.08); setViewMode('orrery'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'orrery'
                ? 'bg-gradient-to-r from-neon-cyan to-neon-blue text-black shadow-glow-cyan'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Orbit className="w-4 h-4" /> 🌌 Solar System Orrery Mode
          </button>

          <button 
            onClick={() => { playBeep(600, 0.08); setViewMode('inspector'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'inspector'
                ? 'bg-gradient-to-r from-neon-purple to-neon-cyan text-white shadow-glow-purple'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Eye className="w-4 h-4" /> 🔎 Individual 3D Planet Inspector
          </button>
        </div>

        {/* Planet Select Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {PLANETS_DATA.map(planet => {
            const isSelected = selectedPlanet.id === planet.id;
            return (
              <button
                key={planet.id}
                onClick={() => {
                  playBeep(680, 0.08);
                  setSelectedPlanet(planet);
                  if (showToast) showToast(`🪐 TARGET ACQUIRED: ${planet.name.toUpperCase()}`);
                }}
                className={`px-3 py-1.5 rounded-lg border transition text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan font-bold shadow-glow-cyan'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: planet.colors.primary }}></span>
                {planet.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Canvas View Display */}
      {viewMode === 'orrery' ? (
        /* MODE 1: Solar System Orrery View */
        <div className="glass-card p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 mb-4 z-10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span className="font-bold text-slate-100">SUN (HELIOCENTRIC CENTER)</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => { playBeep(600, 0.08); setIsPlaying(!isPlaying); }}
                className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 font-bold cursor-pointer ${
                  isPlaying 
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                    : 'bg-neon-green/20 border-neon-green/40 text-neon-green'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'PAUSE ORBITS' : 'RESUME ORBITS'}
              </button>

              <button 
                onClick={() => { playBeep(700, 0.08); setSpeedMultiplier(prev => prev === 1 ? 3 : prev === 3 ? 8 : 1); }}
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> SPEED: {speedMultiplier}x
              </button>
            </div>
          </div>

          {/* Orrery 2D/3D Canvas */}
          <div className="relative w-full aspect-[16/9] max-h-[520px] rounded-xl overflow-hidden border border-white/10">
            <canvas 
              ref={orreryCanvasRef} 
              width={900} 
              height={500} 
              className="w-full h-full object-contain cursor-crosshair"
            />
          </div>

          {/* Planet Quick Strip Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
            {PLANETS_DATA.map(p => (
              <div 
                key={p.id}
                onClick={() => {
                  playBeep(640, 0.08);
                  setSelectedPlanet(p);
                  setViewMode('inspector');
                }}
                className={`p-3 rounded-xl border transition cursor-pointer text-center group ${
                  selectedPlanet.id === p.id 
                    ? 'bg-neon-cyan/20 border-neon-cyan text-slate-100 shadow-glow-cyan' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-black" style={{ backgroundColor: p.colors.primary }}>
                  {p.name[0]}
                </div>
                <span className="font-bold text-xs block group-hover:text-neon-cyan transition">{p.name}</span>
                <span className="text-[10px] text-slate-400 font-inter">{p.distAU} AU</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MODE 2: Individual Planet 3D Inspector View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 3D Planet Renderer Box */}
          <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-4 font-orbitron text-xs z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-ping"></span>
                <span className="font-bold text-slate-100">{selectedPlanet.name}</span>
                <span className="text-slate-400">({selectedPlanet.type})</span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-white/10 border border-white/10 text-neon-cyan font-bold">
                {selectedPlanet.distKm}
              </span>
            </div>

            <div className="relative w-full aspect-square max-h-[380px] my-4 mx-auto flex items-center justify-center">
              <canvas 
                ref={planetCanvasRef} 
                width={380} 
                height={380} 
                className="w-full h-full max-w-[380px] max-h-[380px] drop-shadow-[0_0_25px_rgba(56,189,248,0.3)] cursor-grab active:cursor-grabbing"
              />

              <div className="absolute top-2 left-2 p-2 rounded bg-black/60 backdrop-blur-md border border-white/10 font-orbitron text-[10px] space-y-1">
                <div className="text-slate-400">ORBIT RADIUS: <span className="text-neon-cyan font-bold">{selectedPlanet.distAU} AU</span></div>
                <div className="text-slate-400">ORBITAL PERIOD: <span className="text-neon-green font-bold">{selectedPlanet.periodDays}</span></div>
              </div>

              <div className="absolute bottom-2 right-2 p-2 rounded bg-black/60 backdrop-blur-md border border-white/10 font-orbitron text-[10px] text-right space-y-1">
                <div className="text-slate-400">PLANET DIAMETER: <span className="text-amber-400 font-bold">{selectedPlanet.diameter}</span></div>
                <div className="text-slate-400">KNOWN MOONS: <span className="text-neon-purple font-bold">{selectedPlanet.moons} Moons</span></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 font-orbitron text-xs z-10">
              <button 
                onClick={() => { playBeep(600, 0.08); setIsWireframe(!isWireframe); }}
                className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 font-bold cursor-pointer ${
                  isWireframe 
                    ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-glow-cyan' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {isWireframe ? 'SURFACE MESH' : 'TEXTURED SPHERE'}
              </button>

              <button 
                onClick={() => { playBeep(880, 0.12); setShowDetailModal(true); }}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-bold flex items-center gap-1.5 hover:shadow-glow-cyan transition cursor-pointer"
              >
                <Info className="w-4 h-4" /> Full Planetary Dossier
              </button>
            </div>
          </div>

          {/* Planet Specs Side Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">PLANETARY TELEMETRY</span>
                  <h3 className="text-2xl font-black text-slate-100">{selectedPlanet.name}</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-bold">
                  {selectedPlanet.type}
                </span>
              </div>

              <p className="font-inter text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                {selectedPlanet.fact}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">DISTANCE FROM SUN</span>
                  <span className="font-bold text-neon-cyan">{selectedPlanet.distAU} AU</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">ORBITAL TIME</span>
                  <span className="font-bold text-neon-green">{selectedPlanet.periodDays}</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">EQUATORIAL DIAMETER</span>
                  <span className="font-bold text-amber-300">{selectedPlanet.diameter}</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">NATURAL MOONS</span>
                  <span className="font-bold text-neon-purple">{selectedPlanet.moons} Moons</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-neon-green pt-2">SURFACE & ATMOSPHERE SPECS</h4>
              <ul className="space-y-1.5 text-xs font-inter text-slate-300">
                {selectedPlanet.details.map((d, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-neon-cyan shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Planetary Dossier Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative font-orbitron border border-neon-cyan/40 shadow-glow-cyan animate-scale-up">
            <button 
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <span className="px-2.5 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 text-xs font-bold mb-2 inline-block">
              PLANETARY DOSSIER — {selectedPlanet.name.toUpperCase()}
            </span>

            <h3 className="text-2xl font-black text-slate-100 mb-2">{selectedPlanet.name}</h3>

            <p className="text-xs font-inter text-slate-300 mb-4 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
              {selectedPlanet.fact}
            </p>

            <div className="space-y-2 text-xs text-slate-300 mb-6 bg-black/40 p-3 rounded-lg border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">SURFACE TEMPERATURE:</span>
                <span className="font-bold text-rose-400">{selectedPlanet.tempC}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ORBIT SPEED:</span>
                <span className="font-bold text-neon-green">{(selectedPlanet.orbitSpeed * 1000).toFixed(1)} km/s rel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PHYSICAL MOONS:</span>
                <span className="font-bold text-neon-purple">{selectedPlanet.moons} Moons</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  playBeep(880, 0.15);
                  if (showToast) showToast(`📡 PLANET DOSSIER BOOKMARKED: ${selectedPlanet.name.toUpperCase()}`);
                  setShowDetailModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-glow-cyan"
              >
                <Zap className="w-4 h-4" /> Save Planet Report
              </button>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
