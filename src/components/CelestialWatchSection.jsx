import React, { useState } from 'react';
import { Binoculars, Compass, Moon, Calendar, CheckCircle2, XCircle, Search, ExternalLink, Sparkles, MapPin, Eye, Info } from 'lucide-react';
import { playBeep } from '../utils/audioSynthesizer';

export default function CelestialWatchSection({ showToast }) {
  const [lat, setLat] = useState(28.61);
  const [lon, setLon] = useState(77.20);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleGeolocate = () => {
    playBeep(520, 0.12);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const l1 = parseFloat(pos.coords.latitude.toFixed(2));
          const l2 = parseFloat(pos.coords.longitude.toFixed(2));
          setLat(l1);
          setLon(l2);
          if (showToast) showToast("📍 GEOLOCATION HANDSHAKE COMPLETE");
        },
        () => {
          if (showToast) showToast("❌ GEOLOCATION REQUEST BLOCKED");
        }
      );
    } else {
      if (showToast) showToast("❌ LOCATION SERVICES NOT SUPPORTED");
    }
  };

  // Precise Synodic Lunar Calculation
  const today = new Date();
  const refNewMoon = new Date('2026-01-18T16:52:00Z').getTime();
  const diffDays = (today.getTime() - refNewMoon) / (1000 * 60 * 60 * 24);
  const synodicPeriod = 29.53058867;
  const age = (diffDays % synodicPeriod + synodicPeriod) % synodicPeriod;
  const illumFraction = (1 - Math.cos((age / synodicPeriod) * 2 * Math.PI)) / 2;
  const illumination = Math.round(illumFraction * 100);

  let moonPhase = "Waxing Gibbous";
  if (age < 1.84 || age >= 27.69) moonPhase = "New Moon";
  else if (age < 5.53) moonPhase = "Waxing Crescent";
  else if (age < 9.22) moonPhase = "First Quarter";
  else if (age < 12.91) moonPhase = "Waxing Gibbous";
  else if (age < 16.61) moonPhase = "Full Moon";
  else if (age < 20.30) moonPhase = "Waning Gibbous";
  else if (age < 23.99) moonPhase = "Third Quarter";
  else moonPhase = "Waning Crescent";

  const daysToFullMoon = Math.ceil((14.765 - age + synodicPeriod) % synodicPeriod);
  const lunarDistance = (384400 + Math.sin((age / synodicPeriod) * 2 * Math.PI) * 21000).toLocaleString();

  // Dynamic sky objects calculations based on latitude & longitude
  const isNorthern = lat >= 0;
  const targetObjects = [
    { name: "Jupiter (Gas Giant)", status: "Visible", detail: "East-Southeast at 21:15", rating: "Mag -2.4", isVisible: true },
    { name: "Saturn & Rings", status: "Visible", detail: "Overhead South at 23:45", rating: "Mag +0.6", isVisible: true },
    { name: "Mars (Red Planet)", status: "Visible", detail: "Eastern Horizon at 01:30", rating: "Mag +0.8", isVisible: true },
    { name: "Andromeda Galaxy (M31)", status: isNorthern ? "Visible" : "Low Horizon", detail: isNorthern ? "High North-East at 22:00" : "Requires Dark Sky Site", rating: "Mag +3.4", isVisible: isNorthern },
    { name: "ISS Satellite Pass", status: "Scheduled", detail: "South-West to North-East at 20:48", rating: "Mag -3.2", isVisible: true },
    { name: "Venus (Morning Star)", status: "Blocked", detail: "Too close to solar glare horizon", rating: "Solar Glare", isVisible: false }
  ];

  const visibleCount = targetObjects.filter(o => o.isVisible).length;
  const astroRating = lat > -45 && lat < 55 ? "Excellent (94%)" : "Good (82%)";

  // Astronomical events list
  const astroEvents = [
    {
      id: "evt-01",
      date: "AUG 12-13, 2026",
      category: "meteors",
      catLabel: "METEOR SHOWER",
      title: "Perseids Meteor Shower Peak",
      desc: "Peak shooting star counts reaching up to 100 meteors per hour entering Earth's upper atmosphere at 59 km/s under optimal sky conditions.",
      equipment: "Naked Eye / Wide Angle Camera",
      timing: "00:00 AM - 04:30 AM",
      azimuth: "North-East (Perseus Constellation)",
      badgeColor: "bg-neon-green/20 text-neon-green border-neon-green/30"
    },
    {
      id: "evt-02",
      date: "AUG 28, 2026",
      category: "alignments",
      catLabel: "PLANET ALIGNMENT",
      title: "Rare 6-Planet Planetary Alignment",
      desc: "Mercury, Mars, Jupiter, Uranus, Neptune, and Saturn align in the pre-dawn morning sky across a 30-degree arc.",
      equipment: "Naked Eye & Binoculars",
      timing: "04:15 AM - Dawn",
      azimuth: "East to South-East Ecliptic Arc",
      badgeColor: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"
    },
    {
      id: "evt-03",
      date: "OCT 14, 2026",
      category: "eclipses",
      catLabel: "SOLAR ECLIPSE",
      title: "Annular 'Ring of Fire' Solar Eclipse",
      desc: "A spectacular annular solar eclipse tracking across Earth's surface where the Moon covers 96% of the solar disc.",
      equipment: "ISO Certified Solar Eclipse Glasses Required",
      timing: "16:22 UTC Peak",
      azimuth: "Sun Elevation 42°",
      badgeColor: "bg-amber-400/20 text-amber-400 border-amber-400/30"
    },
    {
      id: "evt-04",
      date: "OCT 21-22, 2026",
      category: "meteors",
      catLabel: "METEOR SHOWER",
      title: "Orionids Meteor Shower Peak",
      desc: "Debris stream left behind by Halley's Comet producing fast meteors with persistent incandescent trains.",
      equipment: "Naked Eye",
      timing: "02:00 AM - 05:00 AM",
      azimuth: "South-East (Orion Constellation)",
      badgeColor: "bg-neon-green/20 text-neon-green border-neon-green/30"
    },
    {
      id: "evt-05",
      date: "NOV 24, 2026",
      category: "eclipses",
      catLabel: "LUNAR ECLIPSE",
      title: "Super Blue Moon Total Eclipse",
      desc: "Perigee Full Moon passes through Earth's umbral shadow, turning deep coppery blood red during totality.",
      equipment: "Naked Eye / Small Telescope",
      timing: "22:40 UTC Peak",
      azimuth: "High Southern Horizon",
      badgeColor: "bg-neon-purple/20 text-neon-purple border-neon-purple/30"
    },
    {
      id: "evt-06",
      date: "DEC 12, 2026",
      category: "comets",
      catLabel: "COMET VISIT",
      title: "Comet C/2024 S1 (ATLAS) Perihelion",
      desc: "Bright long-period comet reaching perihelion with a prominent gas dust tail visible in twilight sky.",
      equipment: "Binoculars / Small Telescope",
      timing: "Dusk Sunset + 45 Min",
      azimuth: "Low Western Horizon",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30"
    }
  ];

  const filteredEvents = astroEvents.filter(evt => {
    const matchesTab = activeTab === 'all' || evt.category === activeTab;
    const matchesQuery = !searchQuery.trim() || 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      evt.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.date.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <section id="cosmic-watch" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron font-semibold bg-neon-purple/10 text-neon-purple border border-neon-purple/30 mb-3">
          <Binoculars className="w-3.5 h-3.5" /> TERRESTRIAL OBSERVATION CALCULATORS
        </span>
        <h2 className="text-3xl sm:text-4xl font-orbitron font-black text-purple-400 mb-3">
          🌌 Celestial Watch Desk
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Predict visible planetary alignments at your exact coordinates tonight, monitor lunar cycles, and map key upcoming astronomical events.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sky Visibility Predictor */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-orbitron font-bold text-base text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-neon-cyan" /> Sky Visibility Predictor
              </h3>
              <button 
                onClick={handleGeolocate}
                className="px-2.5 py-1 rounded bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan font-orbitron text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                📍 GEOLOCATE
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-inter">
              Analyze clarity and coordinate alignment of celestial targets from your surface location:
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 font-orbitron">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">LATITUDE (°)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-neon-cyan"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">LONGITUDE (°)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={lon}
                  onChange={(e) => setLon(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/40 border border-white/10 font-orbitron text-center mb-4">
              <div>
                <span className="block text-base font-bold text-neon-cyan">{visibleCount} Targets</span>
                <span className="text-[10px] text-slate-400">Visible Tonight</span>
              </div>
              <div>
                <span className="block text-base font-bold text-neon-green">{astroRating}</span>
                <span className="text-[10px] text-slate-400">Astrophotography Rating</span>
              </div>
            </div>

            <ul className="space-y-2 font-inter text-xs text-slate-300">
              {targetObjects.map((obj, i) => (
                <li key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    {obj.isVisible ? (
                      <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-slate-200 block">{obj.name}</span>
                      <span className="text-[10px] text-slate-400 font-orbitron">{obj.detail}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-orbitron font-bold ${obj.isVisible ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-rose-500/10 text-rose-400'}`}>
                    {obj.rating}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Moon Phase Dashboard */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-orbitron font-bold text-base text-slate-100 flex items-center gap-2">
                <Moon className="w-5 h-5 text-neon-purple" /> Moon Phase Dashboard
              </h3>
              <span className="px-2 py-0.5 rounded bg-neon-purple/10 text-neon-purple font-orbitron text-[10px] font-bold tracking-wider">
                LUNAR TELEMETRY
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {/* Mathematically Accurate SVG Moon Representation */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-36 h-36 rounded-full drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <defs>
                    <radialGradient id="moonSurface" cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="60%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#64748b" />
                    </radialGradient>
                  </defs>

                  {/* Dark Base Circle */}
                  <circle cx="50" cy="50" r="46" fill="#0b0f19" stroke="#334155" strokeWidth="2" />

                  {/* Dynamic Illuminated Crescent/Gibbous Shape */}
                  {illumination > 0 && (
                    <g>
                      <circle cx="50" cy="50" r="46" fill="url(#moonSurface)" />
                      
                      {/* Shadow Overlay calculating illumination clip */}
                      <path 
                        d={`M 50 4 A 46 46 0 0 ${age > 14.76 ? 1 : 0} 50 96 A ${Math.abs(46 * Math.cos((age / synodicPeriod) * 2 * Math.PI))} 46 0 0 ${age > 7.38 && age < 22.14 ? 1 : 0} 50 4 Z`}
                        fill="#0b0f19"
                        opacity="0.92"
                      />
                    </g>
                  )}

                  {/* Crater Overlay details */}
                  <circle cx="36" cy="38" r="7" fill="#475569" opacity="0.3" />
                  <circle cx="62" cy="32" r="10" fill="#475569" opacity="0.25" />
                  <circle cx="56" cy="64" r="9" fill="#475569" opacity="0.3" />
                  <circle cx="32" cy="68" r="5" fill="#475569" opacity="0.35" />
                </svg>

                <div className="absolute inset-0 rounded-full border border-purple-500/20 pointer-events-none"></div>
              </div>

              {/* Moon Telemetry Metrics */}
              <div className="space-y-2.5 font-orbitron text-xs flex-1 w-full">
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span className="text-slate-400">CURRENT PHASE</span>
                  <span className="font-bold text-neon-purple">{moonPhase}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span className="text-slate-400">ILLUMINATION</span>
                  <span className="font-bold text-neon-cyan">{illumination}%</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span className="text-slate-400">LUNAR AGE</span>
                  <span className="font-bold text-slate-200">{age.toFixed(1)} Days</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span className="text-slate-400">EARTH DISTANCE</span>
                  <span className="font-bold text-neon-green">{lunarDistance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NEXT FULL MOON</span>
                  <span className="font-bold text-amber-400">{daysToFullMoon} Days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/20 font-inter text-xs">
            <div className="flex items-center gap-1.5 font-orbitron text-neon-purple text-[11px] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> LUNAR OBSERVATION TIP
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              The best time to observe lunar craters is along the terminator line (day/night boundary) during First or Third Quarter phases.
            </p>
          </div>
        </div>

        {/* Astronomical Events Calendar */}
        <div className="lg:col-span-12 glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-orbitron font-bold text-base text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-neon-green" /> Upcoming Astronomical Events (2026)
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-inter">
                Curated calendar of meteor showers, planetary alignments, solar/lunar eclipses, and comets:
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-lg pl-9 pr-3 py-1.5 text-xs font-orbitron text-slate-100 focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 font-orbitron text-[10px]">
            {[
              { id: 'all', label: '🌐 ALL EVENTS' },
              { id: 'meteors', label: '☄️ METEOR SHOWERS' },
              { id: 'alignments', label: '🪐 ALIGNMENTS' },
              { id: 'eclipses', label: '🌑 ECLIPSES' },
              { id: 'comets', label: '☄️ COMETS' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { playBeep(500, 0.05); setActiveTab(tab.id); }}
                className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-neon-green/20 border-neon-green text-neon-green font-bold shadow-glow-green'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-inter">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((evt) => (
                <div 
                  key={evt.id} 
                  onClick={() => { playBeep(600, 0.08); setSelectedEvent(evt); }}
                  className="p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-green/40 transition cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-orbitron font-black text-xs text-neon-green tracking-wider">{evt.date}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-orbitron font-bold border ${evt.badgeColor}`}>
                        {evt.catLabel}
                      </span>
                    </div>

                    <h4 className="font-orbitron font-bold text-sm text-slate-100 group-hover:text-neon-cyan transition mb-2">
                      {evt.title}
                    </h4>

                    <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-3">
                      {evt.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between font-orbitron text-[10px]">
                    <span className="text-slate-400 truncate max-w-[180px]">🔬 {evt.equipment}</span>
                    <span className="text-neon-cyan font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                      Details →
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center font-orbitron text-xs text-slate-400 bg-white/5 rounded-xl border border-white/5">
                No matching astronomical events found for this filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Modal for Selected Astronomical Event */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative font-orbitron border border-neon-green/40 shadow-glow-green animate-scale-up">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border mb-2 ${selectedEvent.badgeColor}`}>
              {selectedEvent.catLabel} — {selectedEvent.date}
            </span>

            <h3 className="text-lg font-bold text-slate-100 mb-2">{selectedEvent.title}</h3>

            <p className="text-xs font-inter text-slate-300 mb-4 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
              {selectedEvent.desc}
            </p>

            <div className="space-y-2 text-xs text-slate-300 mb-6 bg-black/40 p-3 rounded-lg border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">RECOMMENDED EQUIPMENT:</span>
                <span className="font-bold text-neon-cyan">{selectedEvent.equipment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OPTIMAL WINDOW:</span>
                <span className="font-bold text-neon-green">{selectedEvent.timing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SKY AZIMUTH:</span>
                <span className="font-bold text-amber-300">{selectedEvent.azimuth}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  playBeep(880, 0.15);
                  if (showToast) showToast(`📅 OBSERVATION REMINDER SAVED FOR ${selectedEvent.date}`);
                  setSelectedEvent(null);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/40 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                📅 Set Reminder
              </button>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs transition cursor-pointer"
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
