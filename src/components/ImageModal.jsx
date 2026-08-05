import React, { useState } from 'react';
import { X, Download, Check, Loader2 } from 'lucide-react';
import { playBeep } from '../utils/audioSynthesizer';

export default function ImageModal({ imageUrl, onClose, showToast }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!imageUrl) return null;

  const handleDownload = async () => {
    if (downloading) return;
    playBeep(650);
    setDownloading(true);
    if (showToast) showToast("📥 PREPARING HD TELEMETRY DOWNLOAD...");

    const fileName = `COSMA_NASA_Telemetry_${Date.now()}.jpg`;

    let success = false;

    // Strategy 1: Direct Blob Fetch
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 300);
        success = true;
      }
    } catch (e) {
      // CORS block on fetch
    }

    // Strategy 2: Canvas Data URL Conversion
    if (!success) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 1200;
        canvas.height = img.naturalHeight || img.height || 800;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        success = true;
      } catch (err) {
        // Canvas tainted by cross-origin
      }
    }

    // Strategy 3: Dynamic hidden anchor with download attribute
    if (!success) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setDownloading(false);
    setDownloaded(true);
    playBeep(880, 0.15);
    if (showToast) showToast("🛰️ TELEMETRY IMAGE DOWNLOADED");
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full glass-card p-6 flex flex-col items-center border border-neon-cyan/40 shadow-glow-cyan animate-scale-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl mb-4 bg-black border border-white/10">
          <img src={imageUrl} alt="Expanded Telemetry View" className="max-h-[70vh] w-auto object-contain" />
        </div>

        <h3 className="font-orbitron text-sm font-bold text-slate-200 mb-4">Expanded Lossless Telemetry</h3>

        <div className="flex gap-4 font-orbitron">
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-glow-cyan ${
              downloaded 
                ? 'bg-neon-green text-black'
                : 'bg-gradient-to-r from-neon-cyan to-neon-blue text-black hover:shadow-glow-cyan'
            }`}
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : downloaded ? (
              <Check className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? 'DOWNLINKING...' : downloaded ? 'DOWNLOADED TO DISK' : 'Downlink HD File'}
          </button>

          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 font-bold transition cursor-pointer"
          >
            Close Feed
          </button>
        </div>
      </div>
    </div>
  );
}
