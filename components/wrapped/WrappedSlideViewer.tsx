import React, { useState, useEffect, useRef } from 'react';
import { X, Share2, ChevronLeft, ChevronRight, Download, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface WrappedSlideViewerProps {
  isOpen: boolean;
  slides: string[];
  onClose: () => void;
  loading?: boolean;
  language: 'fr' | 'darija';
}

export function WrappedSlideViewer({ isOpen, slides, onClose, loading = false, language }: WrappedSlideViewerProps) {
  if (!isOpen) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const SLIDE_DURATION = 6000; // 6 seconds per slide
  const INTERVAL_STEP = 50; // Update progress every 50ms

  // Reset states on opening or slide changing
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Main story progress interval
  useEffect(() => {
    if (loading || slides.length === 0 || isPaused) return;

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current!);
          handleNext();
          return 0;
        }
        return prev + (INTERVAL_STEP / SLIDE_DURATION) * 100;
      });
    }, INTERVAL_STEP);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, loading, slides, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev < slides.length - 1) {
        return prev + 1;
      } else {
        // Loop back to start or stay on final? Let's stay on final so they can download/share
        setIsPaused(true);
        return prev;
      }
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Click on the left 30% goes back, right 70% goes forward
    if (clickX < width * 0.3) {
      handlePrev();
    } else {
      if (currentIndex === slides.length - 1) {
        // If final slide, click right can resume or close, let's keep it paused
      } else {
        handleNext();
      }
    }
  };

  const handleShare = async () => {
    const dataUrl = slides[currentIndex];
    if (!dataUrl) return;

    try {
      // Try using the modern Web Share API if supported with blobs
      if (navigator.share) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `floussi-wrapped-${currentIndex + 1}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Floussi Wrapped',
            text: language === 'fr' 
              ? 'Regardez mon bilan financier de l\'année sur Floussi ! 🚀' 
              : 'Chouf l-bilan dyali d l-flouss m3a Floussi ! 🚀'
          });
          return;
        }
      }
      
      // Fallback: trigger image download
      triggerDownload();
    } catch (err) {
      console.warn('Sharing failed, falling back to download:', err);
      triggerDownload();
    }
  };

  const triggerDownload = () => {
    const dataUrl = slides[currentIndex];
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `floussi-wrapped-slide-${currentIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-0 md:p-4 overflow-hidden select-none font-sans">
      
      {/* Background blur from current slide */}
      {slides[currentIndex] && (
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 pointer-events-none scale-105"
          style={{ backgroundImage: `url(${slides[currentIndex]})` }}
        ></div>
      )}

      {/* Main Container mimicking phone dimensions */}
      <div className="relative w-full h-full md:max-w-[480px] md:h-[85vh] bg-slate-900 rounded-none md:rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-50 space-y-4">
            <RefreshCw size={44} className="text-emerald-500 animate-spin" />
            <div className="space-y-1">
              <h3 className="font-black text-white text-base">
                {language === 'fr' ? 'Sidi Floussi prépare vos slides...' : 'Sidi Floussi kay-wajed l-bilan...'}
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                {language === 'fr' ? 'Génération de votre rétrospective unique' : 'Kay-7seb tawfir w l-indibat dyalek'}
              </p>
            </div>
          </div>
        )}

        {/* Top Indicators and Controls */}
        <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent z-40 space-y-3">
          
          {/* Progress indicators */}
          <div className="flex gap-1.5 px-1">
            {slides.map((_, idx) => (
              <div 
                key={idx} 
                className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden"
              >
                <div 
                  className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                  style={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                  }}
                ></div>
              </div>
            ))}
          </div>

          {/* Title, Pause status, and Close button */}
          <div className="flex justify-between items-center text-white px-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs uppercase tracking-wider text-emerald-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Wrapped
              </span>
              <span className="text-[11px] font-bold text-slate-300">
                {currentIndex + 1} / {slides.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Press & Hold help hint */}
              <button
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                className="text-[10px] text-slate-300 hover:text-white px-2 py-1 bg-white/10 rounded-lg hover:bg-white/25 transition-colors font-bold uppercase tracking-wider"
                title="Hold to pause"
              >
                {isPaused ? 'PAUSE' : 'HOLD'}
              </button>

              <button 
                onClick={onClose}
                className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
                id="btn-close-wrapped-viewer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

        </div>

        {/* Main slide display / Clickable area */}
        <div 
          onClick={handleContainerClick}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex-1 w-full relative flex items-center justify-center cursor-pointer bg-slate-950"
        >
          {slides[currentIndex] && (
            <img 
              src={slides[currentIndex]} 
              alt={`Slide ${currentIndex + 1}`}
              className="w-full h-full object-contain pointer-events-none"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Floating Left/Right tap buttons for Desktop visibility */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            disabled={currentIndex === 0}
            className="absolute left-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all opacity-0 hover:opacity-100 disabled:opacity-0 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentIndex === slides.length - 1}
            className="absolute right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all opacity-0 hover:opacity-100 disabled:opacity-0 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Bottom Sharing Panel */}
        <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-40 flex items-center justify-between gap-4">
          <div className="text-white text-left">
            <h4 className="font-extrabold text-xs text-emerald-400 uppercase tracking-widest leading-none mb-1">
              {language === 'fr' ? 'Partager ma story' : 'Charek l-bilan dyali'}
            </h4>
            <p className="text-[10px] text-slate-300 font-bold leading-normal">
              {language === 'fr' ? 'Format standard 1080x1920 pour Instagram & WhatsApp' : 'Format 1080x1920 khass l Insta w WhatsApp'}
            </p>
          </div>

          <div className="flex gap-2">
            {/* Download Button */}
            <button
              onClick={triggerDownload}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95"
              title="Download image"
              id="btn-download-wrapped"
            >
              <Download size={20} />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
              id="btn-share-wrapped"
            >
              <Share2 size={16} />
              <span>{language === 'fr' ? 'PARTAGER' : 'CHAREK'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
