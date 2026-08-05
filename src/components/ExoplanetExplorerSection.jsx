import React, { useState, useEffect, useRef } from 'react';
import { Globe, Sparkles, Orbit, Compass, Search, Filter, ShieldAlert, Thermometer, Layers, RefreshCw, Info, ExternalLink, Zap } from 'lucide-react';
import { playBeep } from '../utils/audioSynthesizer';

const EXOPLANET_DATA = [
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    system: "TRAPPIST-1 System",
    type: "Terrestrial (Habitable Zone)",
    category: "habitable",
    distLy: 39.46,
    discYear: 2017,
    mass: "0.692 M⊕",
    radius: "0.92 R⊕",
    starType: "M-Dwarf (Red Ultra-Cool)",
    esi: 0.85,
    tempK: 246,
    tempC: -27,
    periodDays: 6.1,
    desc: "Located in the habitable zone of TRAPPIST-1, this Earth-sized world may harbor liquid water oceans under a stable atmosphere, shielded from extreme stellar flare events.",
    atmosphere: "Nitrogen-rich / CO2 trace",
    colors: { primary: "#38bdf8", secondary: "#1e3a8a", core: "#0284c7", glow: "rgba(56, 189, 248, 0.6)" },
    features: ["Confirmed Liquid Water Potential", "Earth-Like Density", "Tidally Locked Moderate Terminator"]
  },
  {
    id: "kepler-186f",
    name: "Kepler-186f",
    system: "Kepler-186 System",
    type: "Super-Earth Candidate",
    category: "habitable",
    distLy: 582,
    discYear: 2014,
    mass: "1.71 M⊕",
    radius: "1.17 R⊕",
    starType: "M-Dwarf Star",
    esi: 0.64,
    tempK: 188,
    tempC: -85,
    periodDays: 129.9,
    desc: "The first validated Earth-sized exoplanet orbiting within the habitable zone of a cool M-dwarf star, receiving roughly one-third of the stellar flux that Earth gets from the Sun.",
    atmosphere: "Dense Carbonic Shield",
    colors: { primary: "#a855f7", secondary: "#3b0764", core: "#7e22ce", glow: "rgba(168, 85, 247, 0.6)" },
    features: ["First Earth-Sized HZ Discovery", "Crystalline Polar Ice Caps", "Red Sunset Sky Spectrum"]
  },
  {
    id: "proxima-b",
    name: "Proxima Centauri b",
    system: "Alpha Centauri System",
    type: "Terrestrial Exoplanet",
    category: "habitable",
    distLy: 4.24,
    discYear: 2016,
    mass: "1.17 M⊕",
    radius: "1.03 R⊕",
    starType: "Red Dwarf Flare Star",
    esi: 0.87,
    tempK: 234,
    tempC: -39,
    periodDays: 11.2,
    desc: "Our closest known exoplanet neighbor. Orbits in the habitable zone of Proxima Centauri, experiencing strong X-ray stellar winds requiring magnetic magnetosphere shielding.",
    atmosphere: "Magnetosphere Protected",
    colors: { primary: "#34d399", secondary: "#064e3b", core: "#059669", glow: "rgba(52, 211, 153, 0.6)" },
    features: ["Nearest Exoplanet Target", "Strong Auroral Emissions", "Target for Breakthrough Starshot"]
  },
  {
    id: "k2-18b",
    name: "K2-18 b",
    system: "K2-18 System",
    type: "Hycean Water-World",
    category: "hycean",
    distLy: 124,
    discYear: 2015,
    mass: "8.63 M⊕",
    radius: "2.61 R⊕",
    starType: "Red Dwarf Star",
    esi: 0.73,
    tempK: 250,
    tempC: -23,
    periodDays: 32.9,
    desc: "A Hycean world with a hydrogen-rich atmosphere over a global liquid ocean. JWST observations confirmed atmospheric methane and carbon dioxide with potential dimethyl sulfide signals.",
    atmosphere: "Hydrogen / Methane / CO2",
    colors: { primary: "#06b6d4", secondary: "#164e63", core: "#0891b2", glow: "rgba(6, 182, 212, 0.6)" },
    features: ["JWST Methane & CO2 Detection", "Global Ocean Surface Shell", "Potential Biosignature Target"]
  },
  {
    id: "hd-209458b",
    name: "HD 209458 b (Osiris)",
    system: "Pegasus Constellation",
    type: "Hot Jupiter Gas Giant",
    category: "gasgiant",
    distLy: 159,
    discYear: 1999,
    mass: "0.69 MJ",
    radius: "1.38 RJ",
    starType: "G0V Yellow Sun-like",
    esi: 0.05,
    tempK: 1400,
    tempC: 1127,
    periodDays: 3.5,
    desc: "A blazing gas giant orbiting extremely close to its star. Heat drives an evaporating comet-like tail of carbon and oxygen trailing thousands of kilometers behind the planet.",
    atmosphere: "Evaporating Sodium & Water Vapor",
    colors: { primary: "#fbbf24", secondary: "#78350f", core: "#d97706", glow: "rgba(251, 191, 36, 0.6)" },
    features: ["First Atmospheric Spectroscopy", "Evaporating Gas Tail", "Extreme Supersonic Jet Winds"]
  },
  {
    id: "55-cancri-e",
    name: "55 Cancri e (Janssen)",
    system: "55 Cancri System",
    type: "Lava World Super-Earth",
    category: "lava",
    distLy: 41,
    discYear: 2004,
    mass: "7.99 M⊕",
    radius: "1.87 R⊕",
    starType: "G8V Sun-like Star",
    esi: 0.08,
    tempK: 2573,
    tempC: 2300,
    periodDays: 0.74,
    desc: "An ultra-short-period lava world covered in molten silicate oceans on its dayside. JWST spectral measurements revealed a thick carbon monoxide or carbon dioxide atmosphere.",
    atmosphere: "Molten Silicate / Heavy CO Vapor",
    colors: { primary: "#f43f5e", secondary: "#881337", core: "#e11d48", glow: "rgba(244, 63, 94, 0.6)" },
    features: ["Molten Magma Surface", "Sub-Day Orbit (17.7 Hours)", "Carbon-Rich Interior Core"]
  }
];

export default function ExoplanetExplorerSection({ showToast }) {
  const [selectedExo, setSelectedExo] = useState(EXOPLANET_DATA[0]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isWireframe, setIsWireframe] = useState(false);
  const [orbitSpeed, setOrbitSpeed] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const canvasRef = useRef(null);

  // 3D Animated Exoplanet Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let rotationAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width * 0.32;

      // Outer Atmosphere Glow Ring
      const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.35);
      glowGrad.addColorStop(0, selectedExo.colors.glow);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Planet Base Sphere Gradient
      const planetGrad = ctx.createRadialGradient(
        centerX - radius * 0.35, 
        centerY - radius * 0.35, 
        radius * 0.1, 
        centerX, 
        centerY, 
        radius
      );
      planetGrad.addColorStop(0, selectedExo.colors.primary);
      planetGrad.addColorStop(0.6, selectedExo.colors.core);
      planetGrad.addColorStop(1, selectedExo.colors.secondary);

      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Surface Terrain & Atmosphere Band Animation
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      if (isWireframe) {
        // Wireframe Grid Overlay
        ctx.strokeStyle = selectedExo.colors.primary;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.5;

        // Longitude Lines
        for (let i = -radius; i <= radius; i += 18) {
          const shift = (rotationAngle * 25) % 36;
          ctx.beginPath();
          ctx.ellipse(centerX + ((i + shift) % (radius * 2) - radius), centerY, radius * 0.4, radius, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Latitude Lines
        for (let j = -radius; j <= radius; j += 20) {
          ctx.beginPath();
          ctx.moveTo(centerX - radius, centerY + j);
          ctx.lineTo(centerX + radius, centerY + j);
          ctx.stroke();
        }
      } else {
        // Dynamic Surface Features & Storm Swirls
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#ffffff';

        for (let b = 0; b < 5; b++) {
          const bandY = centerY + Math.sin(rotationAngle + b) * (radius * 0.6);
          const bandWidth = radius * (0.8 + Math.cos(b) * 0.4);
          ctx.beginPath();
          ctx.ellipse(centerX, bandY, bandWidth, radius * 0.15, rotationAngle * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Dark Surface Continents / Lava Cracks
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = selectedExo.colors.secondary;
        const offset = (rotationAngle * 40) % (radius * 2);

        ctx.beginPath();
        ctx.arc(centerX - radius + offset, centerY - 15, radius * 0.45, 0, Math.PI * 2);
        ctx.arc(centerX + radius * 0.4 - offset, centerY + 25, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Terminator Night Shadow Overlay
      const shadowGrad = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(0.65, 'rgba(3, 7, 18, 0.4)');
      shadowGrad.addColorStop(1, 'rgba(3, 7, 18, 0.94)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Specular High Light Pulse
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.4, centerY - radius * 0.4, radius * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting Star Dust Rings
      ctx.strokeStyle = selectedExo.colors.primary;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.4, radius * 0.45, -Math.PI / 8, 0, Math.PI * 2);
      ctx.stroke();

      rotationAngle += 0.008 * orbitSpeed;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedExo, isWireframe, orbitSpeed]);

  const filteredExoplanets = EXOPLANET_DATA.filter(exo => {
    const matchesCat = filterCategory === 'all' || exo.category === filterCategory;
    const matchesSearch = !searchQuery.trim() || 
      exo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      exo.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exo.system.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="exoplanet-explorer" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 mb-3 animate-pulse">
          <Orbit className="w-3.5 h-3.5" /> NASA EXOPLANET ARCHIVE TELEMETRY
        </span>
        <h2 className="text-3xl sm:text-4xl font-orbitron font-black gradient-text-cyan mb-3">
          🪐 3D Interactive Exoplanet Explorer
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Render, orbit, and analyze extra-solar planetary worlds discovered by NASA Kepler, Spitzer, and the James Webb Space Telescope.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 3D Orbiter & Controls */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Status Header */}
          <div className="flex items-center justify-between gap-4 mb-4 z-10 font-orbitron text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-ping"></span>
              <span className="font-bold text-slate-100">{selectedExo.name}</span>
              <span className="text-slate-400">({selectedExo.system})</span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-white/10 border border-white/10 text-neon-cyan font-bold">
              {selectedExo.distLy} LIGHT-YEARS
            </span>
          </div>

          {/* Interactive 3D Canvas Box */}
          <div className="relative w-full aspect-square max-h-[380px] my-4 mx-auto flex items-center justify-center">
            <canvas 
              ref={canvasRef} 
              width={380} 
              height={380} 
              className="w-full h-full max-w-[380px] max-h-[380px] drop-shadow-[0_0_25px_rgba(56,189,248,0.3)] cursor-grab active:cursor-grabbing"
            />

            {/* Orbit Hud Elements */}
            <div className="absolute top-2 left-2 p-2 rounded bg-black/60 backdrop-blur-md border border-white/10 font-orbitron text-[10px] space-y-1">
              <div className="text-slate-400">STELLAR SPECTRUM: <span className="text-neon-cyan font-bold">{selectedExo.starType}</span></div>
              <div className="text-slate-400">ORBITAL PERIOD: <span className="text-neon-green font-bold">{selectedExo.periodDays} Days</span></div>
            </div>

            <div className="absolute bottom-2 right-2 p-2 rounded bg-black/60 backdrop-blur-md border border-white/10 font-orbitron text-[10px] text-right space-y-1">
              <div className="text-slate-400">DISCOVERY YEAR: <span className="text-amber-400 font-bold">{selectedExo.discYear}</span></div>
              <div className="text-slate-400">SURFACE TEMP: <span className="text-rose-400 font-bold">{selectedExo.tempC}°C ({selectedExo.tempK} K)</span></div>
            </div>
          </div>

          {/* Canvas Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 font-orbitron text-xs z-10">
            <div className="flex items-center gap-2">
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
                onClick={() => { playBeep(700, 0.08); setOrbitSpeed(prev => prev === 1 ? 2.5 : prev === 2.5 ? 0.4 : 1); }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                SPEED: {orbitSpeed === 1 ? '1x' : orbitSpeed === 2.5 ? '2.5x' : '0.4x'}
              </button>
            </div>

            <button 
              onClick={() => { playBeep(880, 0.12); setShowModal(true); }}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-bold flex items-center gap-1.5 hover:shadow-glow-cyan transition cursor-pointer"
            >
              <Info className="w-4 h-4" /> Deep Telemetry Analysis
            </button>
          </div>
        </div>

        {/* Right Column: Exoplanet Metrics & Selector List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Exoplanet Quick Specs */}
          <div className="glass-card p-6 font-orbitron space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">SELECTED TARGET</span>
                <h3 className="text-xl font-extrabold text-slate-100">{selectedExo.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-neon-purple/20 border border-neon-purple/40 text-neon-purple text-xs font-bold">
                {selectedExo.type}
              </span>
            </div>

            <p className="font-inter text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
              {selectedExo.desc}
            </p>

            {/* Earth Similarity Index Gauge */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">EARTH SIMILARITY INDEX (ESI)</span>
                <span className="font-bold text-neon-cyan">{(selectedExo.esi * 100).toFixed(0)}% MATCH</span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-green rounded-full transition-all duration-700 shadow-glow-cyan"
                  style={{ width: `${selectedExo.esi * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Spec Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block mb-0.5">MASS</span>
                <span className="font-bold text-neon-cyan">{selectedExo.mass}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block mb-0.5">RADIUS</span>
                <span className="font-bold text-neon-green">{selectedExo.radius}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block mb-0.5">ATMOSPHERE</span>
                <span className="font-bold text-amber-300 truncate block">{selectedExo.atmosphere}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block mb-0.5">SURFACE TEMP</span>
                <span className="font-bold text-rose-400">{selectedExo.tempC}°C</span>
              </div>
            </div>
          </div>

          {/* Exoplanet Catalog Filters & Selection List */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-orbitron font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-neon-cyan" /> Exoplanet Targets ({filteredExoplanets.length})
              </h4>

              {/* Search Bar */}
              <div className="relative max-w-[160px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-lg pl-8 pr-2 py-1 text-xs font-orbitron text-slate-100 focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 font-orbitron text-[9px]">
              {[
                { id: 'all', label: 'ALL TARGETS' },
                { id: 'habitable', label: '🌱 HABITABLE ZONE' },
                { id: 'hycean', label: '🌊 HYCEAN WORLDS' },
                { id: 'gasgiant', label: '🔥 HOT JUPITERS' },
                { id: 'lava', label: '🌋 LAVA WORLDS' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { playBeep(500, 0.05); setFilterCategory(tab.id); }}
                  className={`px-2 py-1 rounded transition cursor-pointer ${
                    filterCategory === tab.id
                      ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Target Selection Buttons List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
              {filteredExoplanets.map(exo => {
                const isSelected = selectedExo.id === exo.id;
                return (
                  <div
                    key={exo.id}
                    onClick={() => {
                      playBeep(640, 0.08);
                      setSelectedExo(exo);
                      if (showToast) showToast(`🪐 EXOPLANET TELEMETRY SWITCHED: ${exo.name}`);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between font-orbitron text-xs ${
                      isSelected 
                        ? 'bg-neon-cyan/15 border-neon-cyan text-slate-100 shadow-glow-cyan' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: exo.colors.primary }}></span>
                      <div>
                        <span className="font-bold block">{exo.name}</span>
                        <span className="text-[10px] text-slate-400 font-inter">{exo.system} • {exo.distLy} ly</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${isSelected ? 'bg-neon-cyan text-black' : 'bg-white/10 text-slate-400'}`}>
                      ESI {(exo.esi * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Deep Telemetry Analysis Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full p-6 relative font-orbitron border border-neon-cyan/50 shadow-glow-cyan animate-scale-up">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <span className="px-2.5 py-1 rounded bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 text-xs font-bold mb-3 inline-block">
              DEEP SPACE TELEMETRY DOSSIER
            </span>

            <h3 className="text-2xl font-black text-slate-100 mb-1">{selectedExo.name}</h3>
            <p className="text-xs text-slate-400 font-inter mb-4">{selectedExo.system} • Discovered in {selectedExo.discYear}</p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-inter text-xs text-slate-300 mb-4 leading-relaxed">
              {selectedExo.desc}
            </div>

            <h4 className="text-xs font-bold text-neon-green mb-2">KEY SCIENTIFIC CHARACTERISTICS</h4>
            <ul className="space-y-1.5 text-xs font-inter text-slate-300 mb-6">
              {selectedExo.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-neon-cyan shrink-0" /> {feat}
                </li>
              ))}
            </ul>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  playBeep(880, 0.15);
                  if (showToast) showToast(`📡 EXOPLANET DOSSIER BOOKMARKED: ${selectedExo.name}`);
                  setShowModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-glow-cyan"
              >
                <Zap className="w-4 h-4" /> Bookmark Telemetry Report
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
