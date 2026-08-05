import React, { useState, useEffect } from 'react';
import { Globe, Flame, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Wind, Mountain, Snowflake, ShieldAlert, MapPin, ExternalLink, Download } from 'lucide-react';
import { fetchEpicEarthData, fetchEonetEvents } from '../utils/nasaApi';
import { playBeep } from '../utils/audioSynthesizer';
import { downloadImage } from '../utils/downloadHelper';

export default function EarthEpicSection({ showToast, incrementSignalCount }) {
  const [epicFrames, setEpicFrames] = useState([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [epicImage, setEpicImage] = useState('https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg');
  const [epicDate, setEpicDate] = useState('Latest Natural EPIC Image');
  const [epicCoords, setEpicCoords] = useState('Lat: 10.5°, Lon: 175.1°');
  const [loadingEpic, setLoadingEpic] = useState(false);

  const [climateEvents, setClimateEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadEpicData = async () => {
    setLoadingEpic(true);
    try {
      const data = await fetchEpicEarthData();
      if (data && data.length > 0) {
        setEpicFrames(data);
        setFrameIdx(0);
        updateEpicDisplay(data[0]);
        if (incrementSignalCount) incrementSignalCount();
        if (showToast) showToast("🌎 EARTH EPIC TELEMETRY SYNCED");
      }
    } catch (e) {
      if (showToast) showToast("⚠️ EPIC SATELLITE UNRESPONSIVE");
    } finally {
      setLoadingEpic(false);
    }
  };

  const updateEpicDisplay = (frame) => {
    if (!frame) return;
    const dateStr = frame.date ? frame.date.split(' ')[0] : '2026-08-02';
    const imgUrl = frame.image
      ? `https://epic.gsfc.nasa.gov/archive/natural/${dateStr.replace(/-/g, '/')}/jpg/${frame.image}.jpg`
      : 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg';

    setEpicImage(imgUrl);
    setEpicDate(`EPIC Frame: ${frame.date || 'Live Snapshot'}`);
    if (frame.centroid_coordinates) {
      setEpicCoords(`Lat: ${frame.centroid_coordinates.lat.toFixed(1)}°, Lon: ${frame.centroid_coordinates.lon.toFixed(1)}°`);
    }
  };

  const handleNextFrame = () => {
    if (epicFrames.length === 0) return;
    playBeep(520, 0.08);
    const nextIdx = (frameIdx + 1) % epicFrames.length;
    setFrameIdx(nextIdx);
    updateEpicDisplay(epicFrames[nextIdx]);
  };

  const handlePrevFrame = () => {
    if (epicFrames.length === 0) return;
    playBeep(520, 0.08);
    const prevIdx = (frameIdx - 1 + epicFrames.length) % epicFrames.length;
    setFrameIdx(prevIdx);
    updateEpicDisplay(epicFrames[prevIdx]);
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const events = await fetchEonetEvents();
      setClimateEvents(events || []);
    } catch (err) {
      console.warn("EONET load error:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEpicData();
    loadEvents();
  }, []);

  const getCategoryMeta = (catId = '', title = '') => {
    const text = (catId + ' ' + title).toLowerCase();
    if (text.includes('wildfire') || text.includes('fire')) {
      return { label: 'WILDFIRE', icon: Flame, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    }
    if (text.includes('storm') || text.includes('cyclone') || text.includes('typhoon')) {
      return { label: 'CYCLONE', icon: Wind, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
    }
    if (text.includes('volcano') || text.includes('eruption')) {
      return { label: 'VOLCANO', icon: Mountain, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
    if (text.includes('ice') || text.includes('snow') || text.includes('glacier')) {
      return { label: 'POLAR ICE', icon: Snowflake, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
    return { label: 'HAZARD', icon: ShieldAlert, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
  };

  const filteredEvents = climateEvents.filter(ev => {
    if (activeCategory === 'all') return true;
    const cat = ev.categories?.[0]?.id?.toLowerCase() || '';
    const title = ev.title?.toLowerCase() || '';
    if (activeCategory === 'wildfires') return cat.includes('wildfire') || title.includes('fire');
    if (activeCategory === 'storms') return cat.includes('storm') || title.includes('cyclone') || title.includes('typhoon');
    if (activeCategory === 'volcanoes') return cat.includes('volcano') || title.includes('volc');
    if (activeCategory === 'ice') return cat.includes('ice') || title.includes('ice') || title.includes('glacier');
    return true;
  });

  return (
    <section id="earth" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron font-semibold bg-neon-green/10 text-neon-green border border-neon-green/30 mb-3">
          <Globe className="w-3.5 h-3.5" /> PLANETARY VANTAGE FEED
        </span>
        <h2 className="text-3xl sm:text-4xl font-orbitron font-black text-emerald-400 mb-3">
          🌍 Earth EPIC Globe & Climate
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          View real-time color images of Earth captured from 1.5 million km by the DSCOVR satellite, and track active global climate events from NASA EONET.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* EPIC Image Card */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-[10px] font-orbitron text-neon-cyan tracking-wider">
                DSCOVR EPIC SATELLITE FEED
              </span>
              {epicFrames.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-orbitron text-[10px]">
                  Frame {frameIdx + 1} / {epicFrames.length}
                </span>
              )}
            </div>

            <div className="relative aspect-square rounded-xl overflow-hidden bg-black/80 mb-6 border border-white/10 group">
              {loadingEpic ? (
                <div className="skeleton-loader w-full h-full flex flex-col items-center justify-center font-orbitron text-xs text-neon-green gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  DOWNLINKING EPIC TELEMETRY...
                </div>
              ) : (
                <img 
                  src={epicImage} 
                  alt="Earth EPIC" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                  onError={(e) => {
                    e.target.src = 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg';
                  }}
                />
              )}

              {/* Controls overlay on top of EPIC Image */}
              {epicFrames.length > 1 && (
                <div className="absolute inset-x-3 bottom-3 flex justify-between items-center bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10">
                  <button 
                    onClick={handlePrevFrame}
                    className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="Previous Frame"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-orbitron text-[10px] text-slate-200 truncate max-w-[180px]">
                    {epicCoords}
                  </span>
                  <button 
                    onClick={handleNextFrame}
                    className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="Next Frame"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="font-orbitron">
              <h3 className="text-base font-bold text-slate-100 mb-1">{epicDate}</h3>
              <p className="text-xs text-slate-400 mb-4">POSITION: L1 Lagrangian Point (1.5 Million KM Distance)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { playBeep(440); loadEpicData(); }}
              disabled={loadingEpic}
              className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingEpic ? 'animate-spin' : ''}`} /> Sync Frames
            </button>
            <button 
              onClick={() => downloadImage(epicImage, `Earth_EPIC_${frameIdx + 1}.jpg`, showToast)}
              className="py-2.5 px-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30 font-orbitron text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download HD
            </button>
          </div>
        </div>

        {/* Climate Explorer Card */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-orbitron font-bold text-base text-slate-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" /> Planetary Climate Monitor
              </h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-orbitron text-[10px] font-semibold">
                NASA EONET ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-inter">
              Real-time thermal anomalies, wildfires, tropical storms, and volcanic plumes monitored by orbital satellite constellations:
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 mb-4 font-orbitron text-[10px]">
              {[
                { id: 'all', label: '🌐 ALL HAZARDS' },
                { id: 'wildfires', label: '🔥 WILDFIRES' },
                { id: 'storms', label: '🌀 STORMS' },
                { id: 'volcanoes', label: '🌋 VOLCANOES' },
                { id: 'ice', label: '❄️ POLAR ICE' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { playBeep(500, 0.05); setActiveCategory(cat.id); }}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer border ${
                    activeCategory === cat.id
                      ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan font-bold shadow-glow-cyan'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Event List */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 mb-4 scrollbar-thin">
              {loadingEvents ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 skeleton-loader h-14"></div>
                ))
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((ev) => {
                  const catTitle = ev.categories?.[0]?.title || 'Hazard';
                  const catId = ev.categories?.[0]?.id || '';
                  const meta = getCategoryMeta(catId, catTitle);
                  const Icon = meta.icon;
                  const coords = ev.geometry?.[0]?.coordinates;
                  const dateStr = ev.geometry?.[0]?.date ? new Date(ev.geometry[0].date).toLocaleDateString() : 'Active Signal';
                  const magVal = ev.geometry?.[0]?.magnitudeValue;
                  const magUnit = ev.geometry?.[0]?.magnitudeUnit;

                  return (
                    <div 
                      key={ev.id} 
                      onClick={() => { playBeep(600, 0.08); setSelectedEvent(ev); }}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-cyan/40 transition flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <div className="flex items-start gap-2.5 pr-2">
                        <span className={`p-1.5 rounded-md ${meta.color} shrink-0 mt-0.5`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-200 group-hover:text-neon-cyan transition leading-snug">
                            {ev.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-400 mt-1">
                            {coords && (
                              <span className="flex items-center gap-1 font-orbitron">
                                <MapPin className="w-2.5 h-2.5 text-neon-cyan" />
                                {coords[1]?.toFixed(1)}°, {coords[0]?.toFixed(1)}°
                              </span>
                            )}
                            {magVal && (
                              <span className="font-orbitron text-amber-300 font-semibold">
                                {magVal.toLocaleString()} {magUnit}
                              </span>
                            )}
                            <span className="text-slate-500 font-inter">{dateStr}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-orbitron font-bold border shrink-0 ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center font-orbitron text-xs text-slate-400 bg-white/5 rounded-lg border border-white/5">
                  <ShieldAlert className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  No active telemetry signals in this category.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-inter text-xs">
            <div className="flex items-center justify-between gap-2 font-orbitron text-neon-green text-[11px] font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> VITAL PLANETARY METRIC
              </span>
              <span className="text-[10px] text-emerald-400">NASA GSFC LINK</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Global Surface Temperature: +1.15°C anomaly against baseline. Antarctic ice sheet loss average: 150 billion metric tons per year.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Detail Modal for Selected Event */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative font-orbitron border border-neon-cyan/40 shadow-glow-cyan animate-scale-up">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            >
              ✕
            </button>

            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
              SATELLITE HAZARD DETAILED TELEMETRY
            </span>

            <h3 className="text-lg font-bold text-slate-100 mb-2">{selectedEvent.title}</h3>

            {selectedEvent.description && (
              <p className="text-xs font-inter text-slate-300 mb-4 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                {selectedEvent.description}
              </p>
            )}

            <div className="space-y-2 text-xs text-slate-300 mb-6 bg-black/40 p-3 rounded-lg border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">EVENT ID:</span>
                <span className="font-bold text-neon-cyan">{selectedEvent.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CATEGORY:</span>
                <span className="font-bold text-slate-200">{selectedEvent.categories?.[0]?.title}</span>
              </div>
              {selectedEvent.geometry?.[0]?.coordinates && (
                <div className="flex justify-between">
                  <span className="text-slate-400">COORDINATES:</span>
                  <span className="font-bold text-emerald-400">
                    {selectedEvent.geometry[0].coordinates[1]}°, {selectedEvent.geometry[0].coordinates[0]}°
                  </span>
                </div>
              )}
              {selectedEvent.geometry?.[0]?.magnitudeValue && (
                <div className="flex justify-between">
                  <span className="text-slate-400">MAGNITUDE READING:</span>
                  <span className="font-bold text-rose-400">
                    {selectedEvent.geometry[0].magnitudeValue} {selectedEvent.geometry[0].magnitudeUnit}
                  </span>
                </div>
              )}
              {selectedEvent.sources?.[0] && (
                <div className="flex justify-between">
                  <span className="text-slate-400">DATA SOURCE:</span>
                  <span className="font-bold text-slate-200">{selectedEvent.sources[0].id}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {selectedEvent.sources?.[0]?.url && (
                <a 
                  href={selectedEvent.sources[0].url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-lg bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/40 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open NASA Source
                </a>
              )}
              <button 
                onClick={() => setSelectedEvent(null)}
                className="py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
