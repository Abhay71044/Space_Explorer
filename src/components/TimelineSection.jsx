import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Play, Pause, ChevronLeft, ChevronRight, Maximize2, ShieldCheck, Globe, Calendar, Award, ExternalLink } from 'lucide-react';
import { playBeep } from '../utils/audioSynthesizer';

const TIMELINE_DATA = [
  { 
    year: "1969", 
    title: "Apollo 11 Crewed Moon Landing", 
    agency: "NASA (USA)", 
    vehicle: "Saturn V / Eagle LM",
    target: "Sea of Tranquility, Moon",
    desc: "Astronaut Neil Armstrong and Buzz Aldrin complete human history's first lunar landing, returning 21.5 kg of lunar surface rocks to Earth.",
    achievement: "First Human Footsteps on Moon",
    img: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80" 
  },
  { 
    year: "1977", 
    title: "Voyager 1 Interstellar Mission", 
    agency: "NASA JPL", 
    vehicle: "Titan IIIE Centaur",
    target: "Jupiter, Saturn & Interstellar Space",
    desc: "Voyager 1 launches carrying the Golden Record. It maps Jupiter and Saturn moons before becoming the first human craft to enter interstellar space in 2012.",
    achievement: "Farthest Human Spacecraft (24B+ km)",
    img: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80" 
  },
  { 
    year: "1990", 
    title: "Hubble Space Telescope Deployment", 
    agency: "NASA / ESA", 
    vehicle: "Space Shuttle Discovery (STS-31)",
    target: "Low Earth Orbit (540 km)",
    desc: "Deployed into Earth orbit, Hubble revolutionizes astronomy with deep-field observations of distant galaxies, expanding our measurement of cosmic expansion.",
    achievement: "1.5M+ Deep Space Observations",
    img: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80" 
  },
  { 
    year: "2012", 
    title: "Curiosity Mars Sky-Crane Touchdown", 
    agency: "NASA JPL", 
    vehicle: "Atlas V 541 / Sky Crane",
    target: "Gale Crater, Mars",
    desc: "Curiosity touches down using a rocket-powered sky-crane, uncovering ancient stream beds and organic carbon molecules on the Martian surface.",
    achievement: "Decade of Active Mars Rover Operations",
    img: "https://images.unsplash.com/photo-1614728423169-3f65fd722b7e?auto=format&fit=crop&w=1200&q=80" 
  },
  { 
    year: "2021", 
    title: "JWST Space Telescope Launch", 
    agency: "NASA / ESA / CSA", 
    vehicle: "Ariane 5 Rocket",
    target: "Sun-Earth L2 Lagrange Point (1.5M km)",
    desc: "The James Webb Space Telescope launches its 6.5-meter gold mirror and 5-layer sunshield, capturing infrared light from stars formed 13.5 billion years ago.",
    achievement: "Earliest Infrared Stellar Spectroscopy",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80" 
  },
  { 
    year: "2023", 
    title: "Chandrayaan-3 Lunar South Pole", 
    agency: "ISRO (India)", 
    vehicle: "LVM3-M4 Launch Vehicle",
    target: "Lunar South Pole (69.37° S)",
    desc: "ISRO successfully lands the Vikram lander and Pragyan rover near the Moon's South Pole, confirming elemental sulfur and mapping polar regolith temperatures.",
    achievement: "First Touchdown at Lunar South Pole",
    img: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=1200&q=80" 
  },
  { 
    year: "2026", 
    title: "Artemis Crewed Orbit & Gateway Ops", 
    agency: "NASA & Global Partners", 
    vehicle: "SLS Block 1 / Orion Spacecraft",
    target: "Lunar Distant Retrograde Orbit",
    desc: "Crewed missions map polar water ice deposits, prepare surface landing habitats, and assemble the Lunar Gateway orbital space station for sustainable exploration.",
    achievement: "Paving Path for Crewed Lunar Base",
    img: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80" 
  },
  { 
    year: "2028", 
    title: "Europa Clipper Subsurface Ocean Probe", 
    agency: "NASA / ESA", 
    vehicle: "Falcon Heavy / Ion Thrusters",
    target: "Jupiter Moon Europa Orbit",
    desc: "Robotic flagship probe conducts 49 close flybys of Europa to analyze its subsurface ocean, ice shell thickness, and astrobiological habitability.",
    achievement: "Subsurface Alien Ocean Reconnaissance",
    img: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=1200&q=80" 
  }
];

export default function TimelineSection() {
  const [activeIndex, setActiveIndex] = useState(4); // Default to JWST
  const [isPlaying, setIsPlaying] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const timerRef = useRef(null);

  const currentItem = TIMELINE_DATA[activeIndex];

  const handleNext = () => {
    playBeep(550, 0.08);
    setActiveIndex((prev) => (prev + 1) % TIMELINE_DATA.length);
  };

  const handlePrev = () => {
    playBeep(550, 0.08);
    setActiveIndex((prev) => (prev - 1 + TIMELINE_DATA.length) % TIMELINE_DATA.length);
  };

  const toggleAutoPlay = () => {
    playBeep(600, 0.1);
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % TIMELINE_DATA.length);
      }, 4000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const progressPercent = ((activeIndex) / (TIMELINE_DATA.length - 1)) * 100;

  return (
    <section id="history-timeline" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 mb-3">
          <Rocket className="w-3.5 h-3.5" /> HUMAN SPACE EXPLORATION MILESTONES
        </span>
        <h2 className="text-3xl sm:text-4xl font-orbitron font-black gradient-text-cyan mb-3">
          🚀 Chronology of Discovery
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          An interactive timeline spanning the achievements of international space flight, from lunar landings to deep space spectroscopy.
        </p>
      </div>

      <div className="glass-card p-6 md:p-8 relative">
        {/* Header Controls */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 font-orbitron text-xs text-slate-300">
            <span className="px-2.5 py-1 rounded bg-white/10 border border-white/10 text-neon-cyan font-bold">
              NODE {activeIndex + 1} OF {TIMELINE_DATA.length}
            </span>
            <span className="hidden sm:inline text-slate-400">Use ← → arrow keys to navigate</span>
          </div>

          <div className="flex items-center gap-2 font-orbitron text-xs">
            <button 
              onClick={toggleAutoPlay}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 font-bold cursor-pointer ${
                isPlaying 
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-glow-rose' 
                  : 'bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30 shadow-glow-cyan'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'PAUSE CYCLE' : 'AUTO CYCLE'}
            </button>

            <button 
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition cursor-pointer"
              title="Previous Mission"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition cursor-pointer"
              title="Next Mission"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Connected Progress Line Timeline Bar */}
        <div className="relative mb-10 pt-2 pb-4">
          {/* Background Bar */}
          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-white/10 rounded-full z-0"></div>
          {/* Active Filled Progress Line */}
          <div 
            className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-full z-0 transition-all duration-500 shadow-glow-cyan"
            style={{ width: `calc(${progressPercent}% * 0.94)` }}
          ></div>

          {/* Stepper Buttons */}
          <div className="relative z-10 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar px-2">
            {TIMELINE_DATA.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button 
                  key={item.year}
                  onClick={() => { playBeep(660, 0.08); setActiveIndex(idx); }}
                  className={`flex flex-col items-center flex-shrink-0 px-3 py-1.5 rounded-xl transition duration-300 cursor-pointer ${
                    isActive 
                      ? 'bg-neon-cyan text-black font-black scale-110 shadow-glow-cyan' 
                      : 'bg-black/80 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <span className="font-orbitron text-xs sm:text-sm tracking-wider">{item.year}</span>
                  <span className={`w-2 h-2 rounded-full mt-1 ${isActive ? 'bg-black' : 'bg-neon-cyan'}`}></span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Mission Drawer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4 font-orbitron">
            <div className="flex items-center gap-3">
              <span className="font-black text-4xl sm:text-5xl text-neon-cyan tracking-tight">
                {currentItem.year}
              </span>
              <span className="px-2.5 py-1 rounded bg-neon-purple/20 border border-neon-purple/40 text-neon-purple text-xs font-bold">
                {currentItem.agency}
              </span>
            </div>

            <h3 className="font-bold text-xl sm:text-3xl text-slate-100 leading-snug">
              {currentItem.title}
            </h3>

            <p className="font-inter text-sm sm:text-base text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
              {currentItem.desc}
            </p>

            {/* Mission Telemetry Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block mb-0.5">LAUNCH VEHICLE</span>
                <span className="font-bold text-neon-cyan truncate block">{currentItem.vehicle}</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block mb-0.5">DESTINATION</span>
                <span className="font-bold text-neon-green truncate block">{currentItem.target}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block mb-0.5">KEY ACHIEVEMENT</span>
                <span className="font-bold text-amber-300 truncate block">{currentItem.achievement}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden bg-black/80 border border-white/10 shadow-glow-cyan group">
              <img 
                src={currentItem.img} 
                alt={currentItem.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80";
                }}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 cursor-pointer" 
                onClick={() => setLightboxImg(currentItem.img)}
              />
              <button
                onClick={() => setLightboxImg(currentItem.img)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Expand HD Imagery"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for HD Imagery */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setLightboxImg(null)}
              className="absolute -top-10 right-0 text-slate-300 hover:text-white font-orbitron font-bold text-sm bg-white/10 px-3 py-1 rounded-md transition cursor-pointer"
            >
              ✕ Close HD View
            </button>
            <img 
              src={lightboxImg} 
              alt="Mission HD Imagery" 
              className="w-full max-h-[80vh] object-contain rounded-xl border border-neon-cyan/40 shadow-glow-cyan"
            />
          </div>
        </div>
      )}
    </section>
  );
}
