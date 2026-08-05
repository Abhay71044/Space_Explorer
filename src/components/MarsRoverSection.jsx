import React, { useState, useEffect } from 'react';
import { Camera, Satellite, AlertTriangle, Maximize2, Download } from 'lucide-react';
import { fetchMarsPhotos } from '../utils/nasaApi';
import { playBeep } from '../utils/audioSynthesizer';
import { downloadImage } from '../utils/downloadHelper';

export default function MarsRoverSection({ onOpenModal, showToast, incrementSignalCount }) {
  const [rover, setRover] = useState('curiosity');
  const [camera, setCamera] = useState('all');
  const [sol, setSol] = useState(1000);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFetchPhotos = async (isInitial = false) => {
    if (!isInitial) playBeep(440, 0.1);
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await fetchMarsPhotos(rover, sol, camera);
      setPhotos(data.slice(0, 12));
      if (data.length > 0) {
        if (!isInitial && incrementSignalCount) incrementSignalCount();
        if (!isInitial && showToast) {
          showToast(`🛰 RECEIVED ${Math.min(data.length, 12)} MARTIAN PICTURES`);
        }
      }
    } catch (err) {
      console.warn("Mars telemetry fetch notice:", err);
      if (showToast) showToast("⚠️ SURFACE TRANSMISSION LINK ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchPhotos(true);
  }, []);

  return (
    <section id="mars-rover" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron font-semibold bg-neon-orange/10 text-neon-orange border border-neon-orange/30 mb-3">
          <Camera className="w-3.5 h-3.5" /> SURFACE OPERATIONS TELEMETRY
        </span>
        <h2 className="text-3xl sm:text-4xl font-orbitron font-black text-rose-500 mb-3">
          🔴 Mars Rover Reconnaissance
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Explore physical landscape images of the red planet captured by NASA rovers, categorized by camera systems and Martian Sols.
        </p>
      </div>

      {/* Controls Dashboard */}
      <div className="glass-card p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-orbitron text-slate-400 mb-1">ROVER UNIT</label>
            <select 
              value={rover}
              onChange={(e) => setRover(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs font-orbitron text-slate-100 focus:outline-none focus:border-neon-cyan cursor-pointer"
            >
              <option value="curiosity">CURIOSITY</option>
              <option value="opportunity">OPPORTUNITY</option>
              <option value="spirit">SPIRIT</option>
              <option value="perseverance">PERSEVERANCE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-orbitron text-slate-400 mb-1">IMAGING TELEMETRY</label>
            <select 
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs font-orbitron text-slate-100 focus:outline-none focus:border-neon-cyan cursor-pointer"
            >
              <option value="all">ALL CAMERAS</option>
              <option value="fhaz">FHAZ (Front Hazard Avoidance)</option>
              <option value="rhaz">RHAZ (Rear Hazard Avoidance)</option>
              <option value="mast">MAST (Mast Camera)</option>
              <option value="chemcam">CHEMCAM (Chemistry & Camera)</option>
              <option value="mahli">MAHLI (Mars Hand Lens Imager)</option>
              <option value="mardi">MARDI (Mars Descent Imager)</option>
              <option value="navcam">NAVCAM (Navigation Camera)</option>
              <option value="pancam">PANCAM (Panoramic Camera)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-orbitron text-slate-400 mb-1">MARTIAN SOL (1 - 4000)</label>
            <input 
              type="number" 
              value={sol}
              min="1"
              max="4000"
              onChange={(e) => setSol(parseInt(e.target.value) || 1)}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs font-orbitron text-slate-100 focus:outline-none focus:border-neon-cyan"
            />
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => handleFetchPhotos(false)}
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-orbitron text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Satellite className="w-4 h-4" /> {loading ? 'Fetching...' : 'Fetch Rover Signal'}
            </button>
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card aspect-square skeleton-loader rounded-xl"></div>
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="glass-card overflow-hidden group hover:-translate-y-1 transition duration-300">
              <div className="relative aspect-square overflow-hidden bg-black">
                <img 
                  src={photo.img_src} 
                  alt="Mars Surface" 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500 cursor-pointer"
                  onClick={() => onOpenModal(photo.img_src)}
                />
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <button 
                    onClick={(e) => { e.stopPropagation(); downloadImage(photo.img_src, `Mars_${photo.rover.name}_Sol${photo.sol || 1000}_${photo.id}.jpg`, showToast); }}
                    className="p-1.5 rounded-md bg-black/70 hover:bg-neon-cyan text-white hover:text-black border border-white/20 transition cursor-pointer"
                    title="Direct Download HD"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onOpenModal(photo.img_src)}
                    className="p-1.5 rounded-md bg-black/70 hover:bg-white text-white hover:text-black border border-white/20 transition cursor-pointer"
                    title="Expand Preview"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 font-orbitron flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 capitalize">{photo.rover.name} Unit</h4>
                  <p className="text-[10px] text-slate-400 truncate">{photo.camera.full_name}</p>
                  <p className="text-[10px] text-neon-cyan mt-0.5">Earth Date: {photo.earth_date}</p>
                </div>
                <button 
                  onClick={() => downloadImage(photo.img_src, `Mars_${photo.rover.name}_Sol${photo.sol || 1000}_${photo.id}.jpg`, showToast)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-neon-cyan hover:text-black text-slate-300 transition cursor-pointer"
                  title="Direct Download HD Image"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="glass-card p-12 text-center font-orbitron">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce" />
          <p className="text-sm text-slate-300">TRANSMISSION TIMEOUT: NO CAPTURED PHOTOGRAPHS AT THIS SOL COORDINATE.</p>
        </div>
      ) : (
        <div className="glass-card p-12 text-center font-orbitron text-slate-400">
          <Satellite className="w-10 h-10 text-neon-cyan mx-auto mb-3 animate-pulse" />
          <p className="text-xs">SYSTEM READY. CHOOSE SOL COORDINATES & INITIATE SCAN.</p>
        </div>
      )}
    </section>
  );
}
