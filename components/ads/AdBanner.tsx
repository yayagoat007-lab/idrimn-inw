import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, ShieldAlert } from 'lucide-react';

interface AdBannerProps {
  unitId: string;
  className?: string;
  userTier?: 'free' | 'premium' | 'family' | 'analyse' | 'elite';
  onUpgrade?: () => void;
}

/**
 * Conditional Google AdSense Banner Component with simulation capabilities.
 * Automatically hidden if the user has an active premium tier.
 * Implements IntersectionObserver lazy loading and blocks if blocked.
 */
export function AdBanner({ unitId, className = "", userTier = "free", onUpgrade }: AdBannerProps) {
  const [closed, setClosed] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adBlocked, setAdBlocked] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);

  // Do not render ads for premium tiers
  const hasAds = userTier === 'free' || !userTier;

  useEffect(() => {
    if (!hasAds || closed) return;

    // Simulate Google AdSense detection and loading with IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Check if adblocker is active (can check if window.adsbygoogle is blocked or simulate)
            const adBlockActive = typeof window !== 'undefined' && !(window as any).adsbygoogle && Math.random() < 0.15;
            
            if (adBlockActive) {
              setAdBlocked(true);
            } else {
              // Simulate script injection and successful load
              setTimeout(() => {
                setAdLoaded(true);
              }, 800);
            }
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (adContainerRef.current) {
      observer.observe(adContainerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAds, closed]);

  if (!hasAds || closed) {
    return null;
  }

  return (
    <div 
      ref={adContainerRef}
      className={`relative bg-amber-50 border border-amber-200 rounded-xl p-4 overflow-hidden shadow-xs my-4 select-none ${className}`}
    >
      {/* Decorative Traditional Moroccan pattern accent */}
      <div className="absolute right-0 top-0 bottom-0 w-24 opacity-5 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <button 
        onClick={() => setClosed(true)} 
        className="absolute top-2 right-2 text-amber-500 hover:text-amber-800 transition-colors z-10"
        aria-label="Fermer la publicité"
      >
        <X size={16} />
      </button>

      {adBlocked ? (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 p-2 rounded-lg text-rose-700">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-rose-900">Bloqueur de pub détecté !</h4>
              <p className="text-[10px] text-rose-700 font-medium">
                Soutenez Floussi en désactivant votre adblocker, ou passez au plan Premium.
              </p>
            </div>
          </div>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Passer à Premium (Sans Pubs)
            </button>
          )}
        </div>
      ) : !adLoaded ? (
        <div className="flex items-center justify-center py-4 text-xs font-medium text-amber-600 gap-2">
          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span>Chargement du partenaire Google AdSense...</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-700 flex-shrink-0 mt-0.5 md:mt-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-block px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200 rounded">
                  Sponsorisé
                </span>
                <span className="text-[10px] text-amber-600 font-bold">Google AdSense</span>
              </div>
              <h4 className="font-extrabold text-xs md:text-sm text-amber-900 leading-tight">
                Achetez votre mouton de l'Aïd à tempérament avec Attijariwafa !
              </h4>
              <p className="text-xs text-amber-700 mt-0.5 font-medium">
                Financez vos événements traditionnels en toute sérénité. Offres spéciales Aïd Al-Adha 2026.
              </p>
            </div>
          </div>
          
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="w-full md:w-auto px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 flex items-center justify-center gap-1.5 shadow-xs"
            >
              Masquer ces pubs (Dahabi)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AdBanner;
