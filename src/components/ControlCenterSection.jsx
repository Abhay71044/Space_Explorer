import React, { useState, useEffect, useRef } from 'react';
import { Radio, Satellite, ShieldAlert, Clock, Sun, ExternalLink, Zap, Info } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLiveIssPosition, fetchAsteroidRadarData } from '../utils/nasaApi';
import { playBeep } from '../utils/audioSynthesizer';

export default function ControlCenterSection() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // ISS State
  const [issData, setIssData] = useState({
    velocity: '27,560 km/h',
    altitude: '420.2 km',
    coordinates: '51.5° N, 0.12° E',
    lat: 51.5,
    lon: 0.12,
    visibility: 'Daylight'
  });

  // Asteroids State
  const [asteroids, setAsteroids] = useState([]);
  const [loadingAsteroids, setLoadingAsteroids] = useState(true);
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);

  // Countdown State
  const [countdown, setCountdown] = useState('00d : 00h : 00m : 00s');

  // Space Weather State
  const [kpValue, setKpValue] = useState(2.34);
  const [solarWind, setSolarWind] = useState(412);
  const [sunspots, setSunspots] = useState(68);
  const [auroraChance, setAuroraChance] = useState(26);

  // ISS Location & Leaflet Sync Loop
  useEffect(() => {
    const updateIss = async () => {
      try {
        const data = await fetchLiveIssPosition();
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const lat = parseFloat(data.latitude);
          const lon = parseFloat(data.longitude);
          const vel = Number(parseFloat(data.velocity).toFixed(0)).toLocaleString();
          const alt = parseFloat(data.altitude).toFixed(1);

          setIssData({
            velocity: `${vel} km/h`,
            altitude: `${alt} km`,
            coordinates: `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`,
            lat,
            lon,
            visibility: data.visibility || 'Daylight'
          });

          // Pan map & move marker
          if (mapInstanceRef.current && markerRef.current) {
            const newLatLng = [lat, lon];
            markerRef.current.setLatLng(newLatLng);
            mapInstanceRef.current.panTo(newLatLng, { animate: true, duration: 1 });
          }
        }
      } catch (e) {
        console.warn("ISS live feed notice:", e);
      }
    };

    updateIss();
    const interval = setInterval(updateIss, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [issData.lat || 20, issData.lon || 0],
        zoom: 3,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd'
      }).addTo(map);

      // Custom pulsing satellite icon
      const customIcon = L.divIcon({
        html: `
          <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:#00f2fe; opacity:0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width:20px; height:20px; border-radius:50%; background:#00f2fe; color:#000; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px #00f2fe;">🛰️</div>
          </div>
        `,
        className: 'custom-iss-leaflet-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([issData.lat || 20, issData.lon || 0], { icon: customIcon }).addTo(map);
      marker.bindPopup('<b style="font-family:Orbitron;color:#00f2fe;">ISS Space Station</b><br/>Orbiting at 27,600 km/h');

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } catch (err) {
      console.warn("Leaflet map init notice:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Asteroid Radar Fetch
  useEffect(() => {
    setLoadingAsteroids(true);
    fetchAsteroidRadarData()
      .then(data => {
        setAsteroids(data ? data.slice(0, 4) : []);
      })
      .catch(() => {})
      .finally(() => setLoadingAsteroids(false));
  }, []);

  // Launch Window Countdown Loop
  useEffect(() => {
    const targetDate = new Date('2026-08-15T14:30:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff <= 0) {
        setCountdown('LAUNCH UNDERWAY 🚀');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${days.toString().padStart(2, '0')}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Space Weather KP Dial Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const kp = (Math.random() * 3 + 1.2).toFixed(2);
      setKpValue(kp);
      setSolarWind(Math.floor(Math.random() * 150 + 380));
      setSunspots(Math.floor(Math.random() * 20 + 55));
      setAuroraChance(Math.floor((kp / 9) * 100));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const strokeDashoffset = 251.2 - (251.2 * (kpValue / 9));

  return (
    <section id="space-control" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 mb-3">
          <Radio className="w-3.5 h-3.5" /> MULTI-AGENCY ORBITAL TRACKERS
        </span>
        <h2 className="text-3xl sm:text-4xl font-orbitron font-black gradient-text-cyan mb-3">
          📡 Deep Space Control Center
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Live coordinates and status metrics for spacecraft orbits, upcoming launch logs, active asteroid paths, and solar space weather events.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ISS Telemetry Widget */}
        <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-orbitron font-bold text-base text-slate-100 flex items-center gap-2">
                <Satellite className="w-5 h-5 text-neon-cyan animate-pulse" /> LIVE ISS ORBITAL TELEMETRY
              </h3>
              <span className="px-2.5 py-1 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-orbitron text-[10px] tracking-wider animate-pulse">
                UPDATES EVERY 5S
              </span>
            </div>

            {/* Interactive Leaflet ISS Map Container */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-72 rounded-xl overflow-hidden mb-4 bg-slate-950 border border-white/10 relative z-0"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-orbitron text-center">
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="block text-[10px] text-slate-400">VELOCITY</span>
              <span className="text-xs sm:text-sm font-bold text-neon-cyan">{issData.velocity}</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="block text-[10px] text-slate-400">ALTITUDE</span>
              <span className="text-xs sm:text-sm font-bold text-neon-purple">{issData.altitude}</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="block text-[10px] text-slate-400">COORDINATES</span>
              <span className="text-xs sm:text-sm font-bold text-neon-green">{issData.coordinates}</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="block text-[10px] text-slate-400">ORBIT PASS</span>
              <span className="text-xs sm:text-sm font-bold text-amber-400">{issData.visibility}</span>
            </div>
          </div>
        </div>

        {/* Near-Earth Object Asteroid Tracker Widget */}
        <div className="lg:col-span-4 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-orbitron font-bold text-sm text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> NEAR-EARTH OBJECT DETECTOR
              </h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-orbitron text-[10px] font-semibold">
                NASA NeoWS
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-inter">Closest orbital fly-bys logged today:</p>

            <div className="space-y-3">
              {loadingAsteroids ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 skeleton-loader h-12"></div>
                ))
              ) : asteroids.length > 0 ? (
                asteroids.map((neo) => {
                  const kmDist = parseFloat(neo.close_approach_data?.[0]?.miss_distance?.kilometers || "295000");
                  const millionKm = (kmDist / 1000000).toFixed(2);
                  const isHazard = neo.is_potentially_hazardous_asteroid;
                  const nameClean = neo.name ? neo.name.replace(/[()]/g, '') : 'Asteroid NEO';

                  return (
                    <div 
                      key={neo.id} 
                      onClick={() => { playBeep(600, 0.08); setSelectedAsteroid(neo); }}
                      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <div>
                        <h4 className="font-bold font-orbitron text-slate-200 group-hover:text-amber-300 transition truncate max-w-[170px]">
                          {nameClean}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-orbitron">
                          Dist: <span className="text-neon-cyan font-bold">{millionKm}M km</span>
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-orbitron font-bold border ${isHazard ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                        {isHazard ? '🚨 HAZARD' : 'SAFE'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 font-orbitron bg-white/5 rounded-lg border border-white/5">
                  Scanning radar feeds...
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-white/5 border border-white/10 font-orbitron text-[10px] text-slate-400 flex items-center justify-between">
            <span>RADAR STATUS: S-BAND MONITORED</span>
            <span className="text-neon-green font-bold">100% ONLINE</span>
          </div>
        </div>

        {/* Launch Window Countdown Widget */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-orbitron font-bold text-sm text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-green animate-pulse" /> LAUNCH WINDOW COUNTDOWN
              </h3>
              <span className="px-2 py-0.5 rounded bg-neon-green/10 text-neon-green font-orbitron text-[10px]">UPCOMING FLIGHT</span>
            </div>

            <div className="p-5 rounded-xl bg-black/60 border border-neon-green/30 text-center mb-4 shadow-inner">
              <span className="font-orbitron font-black text-2xl sm:text-4xl text-neon-green tracking-wider block mb-2 font-mono">
                {countdown}
              </span>
              <h4 className="font-orbitron font-bold text-sm text-slate-200">Falcon 9 Block 5 | Starlink Payload</h4>
              <p className="text-xs text-slate-400 mt-0.5">Vandenberg SFB, California — SLC-4E</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 font-orbitron text-center text-[10px]">
            <div className="p-2 rounded bg-white/5 border border-white/5">
              <span className="text-slate-400 block">PROVIDER</span>
              <span className="text-slate-200 font-bold">SPACEX</span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/5">
              <span className="text-slate-400 block">TRAJECTORY</span>
              <span className="text-neon-cyan font-bold">LEO 53.0°</span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/5">
              <span className="text-slate-400 block">RECOVERY</span>
              <span className="text-neon-green font-bold">ASOG DRONESHIP</span>
            </div>
          </div>
        </div>

        {/* Space Weather Monitor Widget */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-orbitron font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> SPACE WEATHER MONITOR
              </h3>
              <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-orbitron text-[10px]">DONKI TELEMETRY</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-2">
              {/* SVG Dial Gauge */}
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#00f2fe" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" 
                    className="transition-all duration-700" 
                  />
                </svg>
                <div className="absolute text-center font-orbitron">
                  <span className="block font-black text-xl text-neon-cyan">{kpValue}</span>
                  <span className="text-[10px] text-slate-400">KP INDEX</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 font-orbitron text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>SOLAR WIND</span>
                    <span className="text-neon-cyan font-bold">{solarWind} km/s</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-neon-cyan h-full transition-all duration-500" style={{ width: `${(solarWind / 800) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>SUNSPOT COUNT</span>
                    <span className="text-neon-purple font-bold">{sunspots} Units</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-neon-purple h-full transition-all duration-500" style={{ width: `${(sunspots / 150) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>AURORA CHANCE</span>
                    <span className="text-neon-green font-bold">{auroraChance}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-neon-green h-full transition-all duration-500" style={{ width: `${auroraChance}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Detail Modal for Selected Asteroid */}
      {selectedAsteroid && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative font-orbitron border border-amber-400/40 shadow-glow-amber animate-scale-up">
            <button 
              onClick={() => setSelectedAsteroid(null)}
              className="absolute top-4 right-4 p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
              ASTEROID RADAR TELEMETRY
            </span>

            <h3 className="text-lg font-bold text-slate-100 mb-2">{selectedAsteroid.name}</h3>

            <div className="space-y-2.5 text-xs text-slate-300 mb-6 bg-black/40 p-4 rounded-lg border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">POTENTIAL HAZARD:</span>
                <span className={`font-bold ${selectedAsteroid.is_potentially_hazardous_asteroid ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedAsteroid.is_potentially_hazardous_asteroid ? 'YES — POTENTIALLY HAZARDOUS' : 'NO — SAFE PASSAGE'}
                </span>
              </div>
              {selectedAsteroid.estimated_diameter?.kilometers?.estimated_diameter_max && (
                <div className="flex justify-between">
                  <span className="text-slate-400">ESTIMATED DIAMETER:</span>
                  <span className="font-bold text-amber-300">
                    {(selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000).toFixed(0)} Meters
                  </span>
                </div>
              )}
              {selectedAsteroid.close_approach_data?.[0]?.miss_distance?.kilometers && (
                <div className="flex justify-between">
                  <span className="text-slate-400">MISS DISTANCE:</span>
                  <span className="font-bold text-neon-cyan">
                    {(parseFloat(selectedAsteroid.close_approach_data[0].miss_distance.kilometers) / 1000000).toFixed(2)} Million KM
                  </span>
                </div>
              )}
              {selectedAsteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour && (
                <div className="flex justify-between">
                  <span className="text-slate-400">RELATIVE VELOCITY:</span>
                  <span className="font-bold text-neon-green">
                    {Number(parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_hour).toFixed(0)).toLocaleString()} km/h
                  </span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedAsteroid(null)}
              className="w-full py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              Close Telemetry
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
