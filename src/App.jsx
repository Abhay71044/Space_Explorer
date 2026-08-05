import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CosmicBackground from './components/CosmicBackground';
import HeroGlobeCanvas from './components/HeroGlobeCanvas';
import ApodSection from './components/ApodSection';
import MarsRoverSection from './components/MarsRoverSection';
import EarthEpicSection from './components/EarthEpicSection';
import ControlCenterSection from './components/ControlCenterSection';
import CelestialWatchSection from './components/CelestialWatchSection';
import TimelineSection from './components/TimelineSection';
import ExoplanetExplorerSection from './components/ExoplanetExplorerSection';
import SolarSystem3DView from './components/SolarSystem3DView';
import EarthWondersView from './components/EarthWondersView';
import TarsChatbot from './components/TarsChatbot';
import ImageModal from './components/ImageModal';
import CinematicLoader from './components/CinematicLoader';
import { Rocket, Satellite, Server, Database, Expand, ArrowUp, Github, Linkedin, Instagram, ShieldCheck, Heart } from 'lucide-react';
import { playBeep } from './utils/audioSynthesizer';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('space'); // 'space' or 'earth'
  const [isDark, setIsDark] = useState(true);
  const [signalCount, setSignalCount] = useState(12450);
  const [modalImage, setModalImage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    playBeep(880, 0.15);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('light', isDark);
    showToast(!isDark ? "🌙 DEEP COSMIC DARK MODE" : "☀️ LIGHT TELEMETRY MODE");
  };

  return (
    <div className="relative min-h-screen">
      {/* Cinematic Loader */}
      {loading && <CinematicLoader onComplete={() => setLoading(false)} />}

      {/* Background Starfield Canvas */}
      <CosmicBackground isDark={isDark} />

      {/* Navbar */}
      <Navbar 
        activeView={activeView}
        setActiveView={setActiveView}
        isDark={isDark}
        toggleTheme={toggleTheme}
        showToast={showToast}
      />

      {/* View 1: COSMA NASA Space Explorer */}
      {activeView === 'space' ? (
        <main className="relative z-10">
          {/* Hero Section */}
          <section id="hero" className="min-h-screen pt-32 pb-20 flex items-center justify-center max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-orbitron font-semibold bg-neon-blue/10 text-neon-blue border border-neon-blue/30 animate-pulse">
                  <ShieldCheck className="w-4 h-4" /> Mission Operations Center
                </span>

                <h1 className="text-4xl sm:text-6xl font-orbitron font-black leading-tight tracking-tight">
                  Explore the <br />
                  <span className="gradient-text-cyan">Infinite Cosmos</span>
                </h1>

                <p className="text-slate-400 font-inter text-base sm:text-lg max-w-xl">
                  Connecting to live NASA telemetries, Mars reconnaissance rovers, real-time ISS orbital trackers, and deep space observations.
                </p>

                {/* Hero Stats */}
                <div className="glass-card p-4 grid grid-cols-3 gap-4 text-center max-w-lg font-orbitron">
                  <div>
                    <span className="block text-lg sm:text-xl font-black text-neon-cyan">{signalCount.toLocaleString()}+</span>
                    <span className="text-[10px] sm:text-xs text-slate-400">Photos Tele-metered</span>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="block text-lg sm:text-xl font-black text-neon-purple">27,600 km/h</span>
                    <span className="text-[10px] sm:text-xs text-slate-400">ISS Speed</span>
                  </div>
                  <div>
                    <span className="block text-lg sm:text-xl font-black text-neon-green">04 Passed</span>
                    <span className="text-[10px] sm:text-xs text-slate-400">Asteroids Today</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <a href="#apod">
                    <button 
                      onClick={() => playBeep(600)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-orbitron font-bold text-xs sm:text-sm flex items-center gap-2 hover:shadow-glow-cyan transition duration-300"
                    >
                      <Rocket className="w-4 h-4" /> Launch Exploration
                    </button>
                  </a>
                  <button 
                    onClick={() => { setActiveView('earth'); playBeep(600); }}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-orbitron font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2 transition duration-300"
                  >
                    <Satellite className="w-4 h-4" /> 🌍 Earth Wonders
                  </button>
                </div>
              </div>

              {/* Interactive 3D Canvas Globe */}
              <div className="lg:col-span-5">
                <HeroGlobeCanvas />
              </div>
            </div>
          </section>

          {/* Quick Stats Grid */}
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-orbitron">
              <div className="glass-card p-6 text-center hover:-translate-y-1 transition">
                <span className="w-10 h-10 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center mx-auto mb-3 text-lg font-bold">📷</span>
                <h2 className="text-xl font-bold text-slate-100">{signalCount} Signals</h2>
                <p className="text-xs text-slate-400 mt-1 font-inter">Telemetry Signals Captured</p>
              </div>

              <div className="glass-card p-6 text-center hover:-translate-y-1 transition">
                <span className="w-10 h-10 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center mx-auto mb-3 text-lg font-bold">🖥</span>
                <h2 className="text-xl font-bold text-slate-100">06 Live</h2>
                <p className="text-xs text-slate-400 mt-1 font-inter">Scientific Data Pipelines</p>
              </div>

              <div className="glass-card p-6 text-center hover:-translate-y-1 transition">
                <span className="w-10 h-10 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center mx-auto mb-3 text-lg font-bold">💾</span>
                <h2 className="text-xl font-bold text-slate-100">EPIC & NeoWS</h2>
                <p className="text-xs text-slate-400 mt-1 font-inter">Active Space Feeds</p>
              </div>

              <div className="glass-card p-6 text-center hover:-translate-y-1 transition">
                <span className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-3 text-lg font-bold">🔬</span>
                <h2 className="text-xl font-bold text-slate-100">Lossless HD</h2>
                <p className="text-xs text-slate-400 mt-1 font-inter">Spectral Resolution</p>
              </div>
            </div>
          </section>

          {/* Sections */}
          <ApodSection 
            onOpenModal={(url) => setModalImage(url)} 
            showToast={showToast} 
            incrementSignalCount={() => setSignalCount(prev => prev + 1)}
          />

          <MarsRoverSection 
            onOpenModal={(url) => setModalImage(url)} 
            showToast={showToast}
            incrementSignalCount={() => setSignalCount(prev => prev + 1)}
          />

          <EarthEpicSection 
            showToast={showToast} 
            incrementSignalCount={() => setSignalCount(prev => prev + 1)}
          />

          <ControlCenterSection />

          <CelestialWatchSection showToast={showToast} />

          <section id="solar-system">
            <SolarSystem3DView showToast={showToast} />
          </section>

          <ExoplanetExplorerSection showToast={showToast} />

          <TimelineSection />
        </main>
      ) : activeView === 'solarsystem' ? (
        /* View 3: Solar System 3D Orrery & Planet Inspector */
        <main className="relative z-10">
          <SolarSystem3DView showToast={showToast} />
        </main>
      ) : (
        /* View 2: Earth Wonders Nature Gallery */
        <EarthWondersView 
          onOpenModal={(url) => setModalImage(url)} 
          showToast={showToast} 
        />
      )}

      {/* Onboard AI Chatbot (T.A.R.S.) */}
      <TarsChatbot />

      {/* Lightbox Modal */}
      <ImageModal 
        imageUrl={modalImage} 
        onClose={() => setModalImage(null)} 
        showToast={showToast} 
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-xl bg-space-bg border border-neon-cyan/40 text-neon-cyan font-orbitron text-xs font-bold shadow-glow-cyan animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Scroll To Top Button */}
      {showScrollTop && (
        <button 
          onClick={() => { playBeep(600); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="fixed bottom-24 right-6 z-40 p-3 rounded-full bg-space-bg border border-white/20 hover:border-neon-cyan text-neon-cyan shadow-lg transition"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-space-bg/80 backdrop-blur-md pt-10 pb-8 font-inter text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
          <div className="max-w-xl">
            <div className="font-orbitron font-extrabold text-base text-slate-100 mb-2 flex items-center gap-2">
              🚀 COSMA EXPLORER
            </div>
            <p className="leading-relaxed text-slate-400">
              A premium web gateway to explore real-time telemetry from NASA space operations, Mars research stations, ISS flight coordinates, and planetary weather networks.
            </p>
          </div>

          <div className="md:text-right font-orbitron">
            <h4 className="font-bold text-xs text-slate-300 mb-1 tracking-wider">MISSION COMMANDER</h4>
            <p className="font-extrabold text-sm text-neon-cyan mb-0.5">👨‍💻 Abhay Singh</p>
            <p className="text-[11px] text-slate-400 font-inter mb-3">B.Tech CSE (AI)</p>

            <div className="flex items-center md:justify-end gap-3 text-slate-300">
              <a href="https://github.com/Abhay71044" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-neon-cyan/50 hover:text-neon-cyan transition cursor-pointer" title="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/abhay-singh-894044292" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-neon-cyan/50 hover:text-neon-cyan transition cursor-pointer" title="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-neon-cyan/50 hover:text-neon-cyan transition cursor-pointer" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 font-orbitron text-[10px]">
          <p>DESIGN & CODE BY ABHAY SINGH © 2026. ALL RIGHTS RESERVED.</p>
          <p>POWERED BY NASA JPL, EONET, & UNSPLASH API TELEMETRIES.</p>
        </div>
      </footer>
    </div>
  );
}
