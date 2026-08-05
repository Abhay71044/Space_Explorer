import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Moon, Sun, Menu, X, Rocket, Orbit, Globe, Sparkles } from 'lucide-react';
import { playBeep, setMuteState, getMuteState } from '../utils/audioSynthesizer';

export default function Navbar({ activeView, setActiveView, isDark, toggleTheme, showToast }) {
  const [isMuted, setIsMuted] = useState(getMuteState());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    setMuteState(nextState);
    showToast(nextState ? "🔇 AMBIENT SOUND MUTED" : "🔊 AMBIENT CODES ACTIVE");
  };

  const navItems = [
    { id: 'apod', label: 'APOD' },
    { id: 'mars-rover', label: 'Mars Rover' },
    { id: 'earth', label: 'Earth EPIC' },
    { id: 'space-control', label: 'Control Center' },
    { id: 'cosmic-watch', label: 'Watch Desk' },
    { id: 'solar-system', label: 'Solar System 3D' },
    { id: 'exoplanet-explorer', label: 'Exoplanets 3D' },
    { id: 'history-timeline', label: 'Timeline' },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'py-2.5 bg-space-bg/90 backdrop-blur-xl border-b border-neon-cyan/20 shadow-lg' : 'py-4 bg-space-bg/60 backdrop-blur-md border-b border-white/5'}`}>
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 font-orbitron">
        {/* Brand Logo & Status */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => { setActiveView('space'); playBeep(500); window.scrollTo({top:0, behavior:'smooth'}); }}
            className="flex items-center gap-2 cursor-pointer font-extrabold text-lg sm:text-xl tracking-wider group"
          >
            <span className="text-xl group-hover:rotate-12 transition-transform">🚀</span>
            <span className="gradient-text-cyan">COSMA</span>
          </div>

          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] text-neon-green bg-neon-green/10 border border-neon-green/30">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping"></span> D-NET: ONLINE
          </span>
        </div>

        {/* Desktop Links (when in space view) */}
        {activeView === 'space' ? (
          <ul className="hidden lg:flex items-center gap-5 text-xs font-semibold">
            {navItems.map((item) => (
              <li key={item.id}>
                <a 
                  href={`#${item.id}`}
                  onClick={() => playBeep(400, 0.05)}
                  className="text-slate-300 hover:text-neon-cyan transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => { setActiveView('space'); playBeep(600); }}
              className="text-xs text-slate-300 hover:text-neon-cyan transition flex items-center gap-1.5"
            >
              ← Back to Main Operations
            </button>
          </div>
        )}

        {/* Right Controls: Unified Mode Switcher & Toggles */}
        <div className="flex items-center gap-2">
          {/* Compact View Switcher Segmented Pill */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-black/60 border border-white/10 text-[10px] font-bold">
            <button 
              onClick={() => { setActiveView('space'); playBeep(600); }}
              className={`px-2.5 py-1 rounded-lg transition ${activeView === 'space' ? 'bg-neon-cyan text-black shadow-glow-cyan' : 'text-slate-400 hover:text-white'}`}
            >
              🚀 Space
            </button>
            <button 
              onClick={() => { setActiveView('solarsystem'); playBeep(600); }}
              className={`px-2.5 py-1 rounded-lg transition ${activeView === 'solarsystem' ? 'bg-amber-400 text-black shadow-glow-amber' : 'text-slate-400 hover:text-white'}`}
            >
              🪐 Solar 3D
            </button>
            <button 
              onClick={() => { setActiveView('earth'); playBeep(600); }}
              className={`px-2.5 py-1 rounded-lg transition ${activeView === 'earth' ? 'bg-neon-green text-black shadow-glow-green' : 'text-slate-400 hover:text-white'}`}
            >
              🌍 Earth
            </button>
          </div>

          {/* Sound Toggle */}
          <button 
            onClick={handleSoundToggle} 
            title="Toggle Sound" 
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-neon-cyan/40 text-slate-200 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-neon-cyan" />}
          </button>
          
          {/* Light/Dark Theme Toggle */}
          <button 
            onClick={() => { toggleTheme(); playBeep(600); }} 
            title="Toggle Light/Dark Theme" 
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-neon-purple/40 text-slate-200 transition cursor-pointer"
          >
            {isDark ? <Moon className="w-4 h-4 text-neon-purple" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-space-bg/95 backdrop-blur-xl border-b border-neon-cyan/20 px-6 py-6 font-orbitron text-xs space-y-3.5">
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-black/60 border border-white/10 text-center font-bold mb-4">
            <button 
              onClick={() => { setActiveView('space'); setMobileOpen(false); }}
              className={`py-1.5 rounded-lg ${activeView === 'space' ? 'bg-neon-cyan text-black' : 'text-slate-400'}`}
            >
              🚀 Space
            </button>
            <button 
              onClick={() => { setActiveView('solarsystem'); setMobileOpen(false); }}
              className={`py-1.5 rounded-lg ${activeView === 'solarsystem' ? 'bg-amber-400 text-black' : 'text-slate-400'}`}
            >
              🪐 Solar 3D
            </button>
            <button 
              onClick={() => { setActiveView('earth'); setMobileOpen(false); }}
              className={`py-1.5 rounded-lg ${activeView === 'earth' ? 'bg-neon-green text-black' : 'text-slate-400'}`}
            >
              🌍 Earth
            </button>
          </div>

          {activeView === 'space' && navItems.map((item) => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              onClick={() => setMobileOpen(false)}
              className="block text-slate-200 hover:text-neon-cyan py-1"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
