import React, { useState, useEffect, useCallback } from 'react';
import { Search, Globe, Award, Heart, Download, Share2, Maximize2, Loader2, ArrowDown, User, MapPin } from 'lucide-react';
import { fetchUnsplashPhotos } from '../utils/nasaApi';
import { playBeep } from '../utils/audioSynthesizer';
import { downloadImage } from '../utils/downloadHelper';

const CATEGORIES = [
  { id: 'waterfall', label: '💦 Waterfalls' },
  { id: 'volcano', label: '🌋 Volcanoes' },
  { id: 'glacier', label: '❄ Glaciers' },
  { id: 'mountain', label: '🏔 Mountains' },
  { id: 'forest', label: '🌲 Forests' },
  { id: 'island', label: '🏝 Islands' },
  { id: 'beach', label: '🏖 Beaches' },
  { id: 'aurora', label: '🌌 Aurora' },
  { id: 'desert', label: '🏜 Desert' },
  { id: 'flower', label: '🌺 Flowers' },
];

export default function EarthWondersView({ onOpenModal, showToast }) {
  const [activeCategory, setActiveCategory] = useState('waterfall');
  const [currentQuery, setCurrentQuery] = useState('waterfall');
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [earthFavorites, setEarthFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem('earthFavorites') || '[]');
  });

  // Initial load for a new query
  const loadInitialPhotos = useCallback(async (queryStr) => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    try {
      const data = await fetchUnsplashPhotos(queryStr, 1);
      const results = data.results || [];
      setPhotos(results);
      if (results.length < 6) {
        setHasMore(false);
      }
    } catch (e) {
      showToast("⚠️ FAILED TO DECODE PLANETARY PHOTOGRAPHS");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Load more for infinite scroll
  const loadMorePhotos = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await fetchUnsplashPhotos(currentQuery, nextPage);
      const results = data.results || [];
      if (results.length === 0) {
        setHasMore(false);
      } else {
        setPhotos(prev => [...prev, ...results]);
        setPage(nextPage);
      }
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page, currentQuery]);

  // Category switch listener
  useEffect(() => {
    if (activeCategory) {
      setCurrentQuery(activeCategory);
      loadInitialPhotos(activeCategory);
    }
  }, [activeCategory, loadInitialPhotos]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 700;
      if (scrollPosition >= threshold) {
        loadMorePhotos();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMore, loadMorePhotos]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    playBeep(440);
    const q = searchQuery.trim();
    setActiveCategory(null);
    setCurrentQuery(q);
    loadInitialPhotos(q);

    showToast(`🔍 SCANNING COORDINATES FOR "${q.toUpperCase()}"`);

    const galleryEl = document.getElementById('galleryGrid');
    if (galleryEl) {
      galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleEarthFav = (photo) => {
    const regularUrl = photo.urls.regular;
    let updated;
    if (earthFavorites.some(item => item.image === regularUrl)) {
      updated = earthFavorites.filter(item => item.image !== regularUrl);
      showToast("Removed from Nature Favorites ❤️");
    } else {
      updated = [...earthFavorites, {
        image: regularUrl,
        full: photo.urls.full,
        title: photo.location?.name || photo.alt_description || "Vibrant Landscape",
        author: photo.user?.name || "Agency Photographer"
      }];
      showToast("❤️ ADDED TO NATURE FAVORITES");
    }
    setEarthFavorites(updated);
    localStorage.setItem('earthFavorites', JSON.stringify(updated));
  };

  const handleSharePhoto = (photo) => {
    const url = photo.urls.regular;
    if (navigator.share) {
      navigator.share({ title: "Earth Wonders", text: "Explore physical landscape coordinates!", url })
        .then(() => showToast("📤 Uplink Shared!"))
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      showToast("📋 UPLINK COPIED TO CLIPBOARD");
    }
  };

  // Dynamic Featured Destination details
  const featuredPhoto = photos.length > 0 ? photos[0] : null;
  const featuredTitle = featuredPhoto 
    ? (featuredPhoto.location?.name || featuredPhoto.alt_description || (currentQuery ? currentQuery.toUpperCase() + " Record" : "Featured Landscape"))
    : "Niagara Falls";
  const featuredAuthor = featuredPhoto ? (featuredPhoto.user?.name || "Agency Photographer") : "Global Photographer";
  const featuredImage = featuredPhoto ? (featuredPhoto.urls?.full || featuredPhoto.urls?.regular) : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
  const featuredDesc = featuredPhoto 
    ? (featuredPhoto.description || featuredPhoto.alt_description || `A breathtaking high-definition geographical landscape of ${featuredTitle} captured by ${featuredAuthor}. Syncing spectrum feeds...`)
    : "One of the most famous waterfalls in the world, located on the border of Canada and the USA. Syncing spectrum feeds...";

  return (
    <div className="min-h-screen pt-24 pb-16 max-w-7xl mx-auto px-4">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron font-semibold bg-neon-green/10 text-neon-green border border-neon-green/30 mb-3 animate-pulse">
          <Globe className="w-3.5 h-3.5" /> PLANETARY GEOGRAPHY CATALOG
        </span>
        <h1 className="text-4xl sm:text-5xl font-orbitron font-black text-emerald-400 mb-4">
          Discover Earth's <br /><span className="gradient-text-purple">Vibrant Landscapes</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base font-inter">
          An immersive visual portfolio compiling waterfalls, glaciers, active volcanoes, high-altitude ranges, animals, and landscapes.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="glass-card p-6 mb-10 max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lion, waterfalls, glaciers, volcanoes, forests, sunset..."
              className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/20 rounded-lg text-xs sm:text-sm font-inter text-slate-100 focus:outline-none focus:border-neon-green"
            />
          </div>
          <button 
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron text-xs font-bold transition flex items-center gap-2"
          >
            Scan
          </button>
        </form>
      </div>

      {/* Categories Filter Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 no-scrollbar justify-start sm:justify-center">
        {CATEGORIES.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => { playBeep(500); setActiveCategory(cat.id); }}
            className={`px-4 py-2 rounded-full font-orbitron text-xs font-semibold whitespace-nowrap transition ${activeCategory === cat.id ? 'bg-neon-green text-black shadow-glow-green' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dynamic Featured Destination Spot */}
      <div className="glass-card p-6 md:p-8 mb-12 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 space-y-4 font-inter">
            <span className="inline-flex items-center gap-1.5 text-xs font-orbitron font-bold text-amber-400">
              <Award className="w-4 h-4 text-amber-400 animate-bounce" /> FEATURED RECORD
            </span>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-slate-100 capitalize">{featuredTitle}</h2>
            <p className="text-sm text-slate-300 leading-relaxed capitalize">
              {featuredDesc}
            </p>
            <div className="flex items-center gap-4 text-xs font-orbitron text-neon-cyan pt-2">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Photographer: {featuredAuthor}</span>
            </div>
          </div>
          <div className="md:col-span-6">
            <div className="aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-glow-cyan relative group">
              <img 
                src={featuredImage} 
                alt={featuredTitle} 
                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-500"
                onClick={() => onOpenModal(featuredImage)}
              />
              <div className="absolute top-3 right-3 flex gap-1.5">
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadImage(featuredImage, `Earth_Wonder_Featured.jpg`, showToast); }}
                  className="p-2 rounded-lg bg-black/70 backdrop-blur-md text-white border border-white/20 hover:border-neon-cyan hover:text-neon-cyan transition cursor-pointer"
                  title="Direct Download HD"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onOpenModal(featuredImage)}
                  className="p-2 rounded-lg bg-black/70 backdrop-blur-md text-white border border-white/20 hover:border-neon-cyan transition cursor-pointer"
                  title="Expand View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card aspect-[4/3] skeleton-loader rounded-xl"></div>
          ))}
        </div>
      ) : photos.length > 0 ? (
        <>
          <div id="galleryGrid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 scroll-mt-28">
            {photos.map((photo, index) => {
              const isSaved = earthFavorites.some(item => item.image === photo.urls.regular);
              const rawTitle = photo.location?.name || photo.alt_description || photo.description;
              const location = rawTitle 
                ? (rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1))
                : (currentQuery ? `${currentQuery.charAt(0).toUpperCase() + currentQuery.slice(1)} Record #${index + 1}` : "Vibrant Landscape");
              const author = photo.user?.name || "Agency Photographer";

              return (
                <div key={`${photo.id}-${index}`} className="glass-card overflow-hidden group hover:-translate-y-1 transition duration-300 flex flex-col justify-between">
                  <div className="relative aspect-[4/3] overflow-hidden bg-black">
                    <img 
                      src={photo.urls.regular} 
                      alt={location} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer"
                      onClick={() => onOpenModal(photo.urls.full || photo.urls.regular)}
                    />
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={(e) => { e.stopPropagation(); downloadImage(photo.urls.full || photo.urls.regular, `Earth_Wonder_${photo.id}.jpg`, showToast); }}
                        className="p-1.5 rounded-md bg-black/70 hover:bg-neon-cyan text-white hover:text-black border border-white/20 transition cursor-pointer"
                        title="Direct Download HD"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onOpenModal(photo.urls.full || photo.urls.regular)}
                        className="p-1.5 rounded-md bg-black/70 hover:bg-white text-white hover:text-black border border-white/20 transition cursor-pointer"
                        title="Expand View"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    <div>
                      <h3 className="font-orbitron font-bold text-xs text-slate-100 line-clamp-2 leading-snug" title={location}>{location}</h3>
                      <p className="text-[10px] text-slate-400 truncate mt-1 flex items-center gap-1 font-inter">
                        <User className="w-3 h-3 text-neon-cyan inline" /> {author}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/10 font-orbitron text-[10px]">
                      <button 
                        onClick={() => toggleEarthFav(photo)}
                        className={`py-1.5 rounded flex items-center justify-center gap-1 transition ${isSaved ? 'bg-neon-green text-black font-bold' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                      >
                        <Heart className="w-3 h-3 fill-current" /> {isSaved ? 'Saved' : 'Fav'}
                      </button>
                      <button 
                        onClick={() => downloadImage(photo.urls.full || photo.urls.regular, `Earth_Wonder_${photo.id}.jpg`, showToast)}
                        className="py-1.5 rounded bg-neon-cyan/20 text-neon-cyan font-bold flex items-center justify-center gap-1 transition hover:bg-neon-cyan/30 cursor-pointer"
                        title="Direct Download HD Image"
                      >
                        <Download className="w-3 h-3" /> Downlink
                      </button>
                      <button 
                        onClick={() => handleSharePhoto(photo)}
                        className="py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center gap-1 transition"
                      >
                        <Share2 className="w-3 h-3" /> Share
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Infinite Scroll Loader & Trigger */}
          <div className="mt-12 text-center flex flex-col items-center">
            {loadingMore ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 font-orbitron text-xs text-neon-green animate-pulse border border-neon-green/30">
                <Loader2 className="w-4 h-4 animate-spin text-neon-green" /> LOADING MORE LANDSCAPES...
              </div>
            ) : hasMore ? (
              <button 
                onClick={loadMorePhotos}
                className="px-6 py-3 rounded-full bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/40 text-neon-green font-orbitron text-xs font-bold transition flex items-center gap-2"
              >
                <ArrowDown className="w-4 h-4 animate-bounce" /> Load More Photos (or scroll down)
              </button>
            ) : (
              <span className="font-orbitron text-xs text-slate-500">ALL GEOGRAPHIC PHOTOGRAPHS RESOLVED.</span>
            )}
          </div>
        </>
      ) : (
        <div className="glass-card p-12 text-center font-orbitron text-slate-400">
          <p className="text-sm">NO GEOGRAPHIC RECORDS DETECTED IN THIS CATEGORY QUERY.</p>
        </div>
      )}
    </div>
  );
}
