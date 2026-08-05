import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Search, RefreshCw, Trash2, Heart, Download, Share2, Maximize2, Cpu } from 'lucide-react';
import { fetchApodData, CELESTIAL_DICTIONARY } from '../utils/nasaApi';
import { playBeep } from '../utils/audioSynthesizer';
import { downloadImage } from '../utils/downloadHelper';

export default function ApodSection({ onOpenModal, showToast, incrementSignalCount }) {
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchHistory, setSearchHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('searchHistory') || '[]');
  });
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  });
  const [cosmicFact, setCosmicFact] = useState('');

  const loadApod = async (dateStr = '') => {
    setLoading(true);
    try {
      const data = await fetchApodData(dateStr);
      setApodData(data);
      incrementSignalCount();

      // Determine cosmic fact
      const fullText = (data.title + ' ' + data.explanation).toLowerCase();
      let matchedFact = "Fact: Space is completely silent. Sound wave compressions need atmospheric particles to travel, leaving cosmic structures in absolute silence.";
      for (const key in CELESTIAL_DICTIONARY) {
        if (fullText.includes(key)) {
          matchedFact = `Fact Analysis: ${CELESTIAL_DICTIONARY[key]}`;
          break;
        }
      }
      setCosmicFact(matchedFact);
    } catch (err) {
      showToast("⚠️ API TELEMETRY HANDSHAKE FAILED");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApod();
  }, []);

  const handleSearch = (dateToScan = selectedDate) => {
    if (!dateToScan) {
      showToast("⚠️ SELECT SCAN TARGET DATE");
      return;
    }
    playBeep(440, 0.1);
    loadApod(dateToScan);

    if (!searchHistory.includes(dateToScan)) {
      const updated = [...searchHistory, dateToScan].slice(-5);
      setSearchHistory(updated);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
    }
  };

  const handleResetToday = () => {
    playBeep(440, 0.1);
    setSelectedDate('');
    loadApod('');
    showToast("🚀 TELEMETRY ALIGNED TO CURRENT DATE");
  };

  const toggleFavorite = () => {
    if (!apodData) return;
    const imgUrl = apodData.hdurl || apodData.url;
    let updated;
    if (favorites.includes(imgUrl)) {
      updated = favorites.filter(url => url !== imgUrl);
      showToast("💔 REMOVED FROM FAVORITES");
    } else {
      updated = [...favorites, imgUrl];
      showToast("❤️ ADDED TO FAVORITES LIST");
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const isFav = apodData && favorites.includes(apodData.hdurl || apodData.url);

  const handleShare = () => {
    if (!apodData) return;
    const url = apodData.hdurl || apodData.url;
    if (navigator.share) {
      navigator.share({ title: apodData.title, text: apodData.explanation, url })
        .then(() => showToast("📤 Uplink Shared!"))
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      showToast("📋 Uplink copied to clipboard!");
    }
  };

  return (
    <section id="apod" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> DAILY OBSERVATION FEED
        </span>
        <h2 className="text-3xl sm:text-4xl font-orbitron font-black gradient-text-cyan mb-3">
          🌌 Astronomy Picture of the Day
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Every 24 hours, NASA engineers and astrophysicists select a breathtaking snapshot of the cosmos. Query HD solar coordinates below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Media Box */}
        <div className="lg:col-span-7">
          <div className="glass-card p-4 relative overflow-hidden group">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black/60 flex items-center justify-center">
              {loading ? (
                <div className="skeleton-loader w-full h-full flex items-center justify-center">
                  <span className="font-orbitron text-xs text-neon-cyan animate-pulse">DOWNLINKING NASA TELEMETRY...</span>
                </div>
              ) : apodData?.media_type === 'image' ? (
                <img 
                  src={apodData.url} 
                  alt={apodData.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-950">
                  <span className="text-4xl mb-2">🎥</span>
                  <p className="font-orbitron text-neon-cyan text-sm mb-2">{apodData?.title}</p>
                  <p className="text-xs text-slate-400">Space Video Stream Detected. Click Fullscreen to View.</p>
                </div>
              )}

              <button 
                onClick={() => onOpenModal(apodData?.hdurl || apodData?.url)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20 hover:border-neon-cyan transition"
                title="Expand View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Details & Telemetry Info Box */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="glass-card p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-2.5 py-1 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-orbitron text-[10px] tracking-wider">
                  SIGNAL LOADED
                </span>
                <span className="font-orbitron text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {apodData?.date || '--/--/----'}
                </span>
              </div>

              <h3 className="font-orbitron font-bold text-lg sm:text-xl text-slate-100 mb-3">
                {loading ? 'Decrypting space telemetry...' : apodData?.title}
              </h3>

              <div className="max-h-48 overflow-y-auto pr-2 mb-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-inter">
                {loading ? 'Initiating secure socket handshake with planetary image databases. Fetching pixel arrays...' : apodData?.explanation}
              </div>

              {/* Onboard AI Cosmic Fact */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-6">
                <div className="flex items-center gap-2 text-neon-purple font-orbitron text-xs font-semibold mb-1">
                  <Cpu className="w-3.5 h-3.5" /> ONBOARD TELEMETRY ANALYZER
                </div>
                <p className="text-xs text-slate-300 font-inter">{cosmicFact}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={toggleFavorite}
                className={`py-2 px-3 rounded-lg font-orbitron text-xs font-bold flex items-center justify-center gap-1.5 transition ${isFav ? 'bg-neon-green text-black' : 'bg-rose-600/80 hover:bg-rose-600 text-white'}`}
              >
                <Heart className="w-3.5 h-3.5 fill-current" /> {isFav ? 'Saved' : 'Favorite'}
              </button>
              <button 
                onClick={() => downloadImage(apodData?.hdurl || apodData?.url, `NASA_APOD_${apodData?.date || 'HD'}.jpg`, showToast)}
                className="py-2 px-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30 font-orbitron text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Downlink
              </button>
              <button 
                onClick={handleShare}
                className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-orbitron text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Search Bar & Archival Log */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="w-full md:w-auto">
            <label className="block text-xs font-orbitron text-slate-400 mb-1">TARGET SOLAR DATE</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-black/60 border border-neon-cyan/30 rounded-lg px-3 py-2 text-sm font-orbitron text-slate-100 focus:outline-none focus:border-neon-cyan w-full md:w-64"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => handleSearch()}
              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-neon-cyan text-black font-orbitron text-xs font-bold flex items-center justify-center gap-2 hover:shadow-glow-cyan transition"
            >
              <Search className="w-4 h-4" /> Initiate Scan
            </button>
            <button 
              onClick={handleResetToday}
              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-orbitron text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" /> Today's Signal
            </button>
          </div>
        </div>

        {/* History Badges */}
        {searchHistory.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/5 overflow-x-auto">
            <span className="text-xs font-orbitron text-slate-400 whitespace-nowrap">RECENT LOGS:</span>
            {searchHistory.map((date) => (
              <button 
                key={date}
                onClick={() => { setSelectedDate(date); handleSearch(date); }}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-neon-cyan/20 border border-white/10 hover:border-neon-cyan/40 text-xs font-orbitron text-slate-300 transition"
              >
                {date}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
