import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, ShieldAlert, ExternalLink } from 'lucide-react';
import { getContextualAd, canShowContextualAdToday, markContextualAdShown, PreConnectableAdData } from '../../lib/contextual-ads-rules';

interface AdBannerProps {
  unitId: string;
  className?: string;
  userTier?: 'free' | 'premium' | 'family' | 'analyse' | 'elite';
  category?: string;
  language?: 'fr' | 'darija';
  onUpgrade?: () => void;
}

/**
 * Conditional Google AdSense Banner Component with advanced contextual simulations.
 * Automatically hidden if the user has an active premium/family/elite tier.
 * Implements local frequency caps (max 1 contextual ad display per day) and fallback to standard sponsors.
 */
export function AdBanner({ unitId, className = "", userTier = "free", category, language = "fr", onUpgrade }: AdBannerProps) {
  const [closed, setClosed] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adBlocked, setAdBlocked] = useState(false);
  const [contextualAd, setContextualAd] = useState<PreConnectableAdData | null>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);

  // Do not render ads for premium tiers
  const hasAds = userTier === 'free' || !userTier || userTier as any === '';

  useEffect(() => {
    if (!hasAds || closed) return;

    // Load contextual ad if appropriate and cap not reached
    const shouldUseContextual = !!category && canShowContextualAdToday();
    if (shouldUseContextual) {
      const ad = getContextualAd(category);
      setContextualAd(ad);
    } else {
      setContextualAd(null);
    }

    // Simulate Google AdSense detection and loading with IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Check if adblocker is active
            const adBlockActive = typeof window !== 'undefined' && !(window as any).adsbygoogle && Math.random() < 0.05;
            
            if (adBlockActive) {
              setAdBlocked(true);
            } else {
              // Simulate script injection and successful load
              setTimeout(() => {
                setAdLoaded(true);
                if (shouldUseContextual) {
                  markContextualAdShown();
                }
              }, 600);
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
  }, [hasAds, closed, category]);

  if (!hasAds || closed) {
    return null;
  }

  const isDarija = language === 'darija';

  return (
    <div 
      ref={adContainerRef}
      className={`relative bg-amber-50/75 border border-amber-200/80 rounded-3xl p-5 overflow-hidden shadow-3xs my-4 select-none font-sans ${className}`}
      id={`ad-banner-${unitId}`}
    >
      {/* Decorative Traditional Moroccan pattern accent */}
      <div className="absolute right-0 top-0 bottom-0 w-24 opacity-[0.03] bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      <button 
        onClick={() => setClosed(true)} 
        className="absolute top-3.5 right-3.5 text-amber-500 hover:text-amber-800 transition-colors z-10 cursor-pointer w-7 h-7 bg-white/60 hover:bg-white rounded-full flex items-center justify-center border border-amber-100"
        aria-label="Fermer la publicité"
      >
        <X size={13} />
      </button>

      {adBlocked ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 p-2.5 rounded-2xl text-rose-700">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h4 className="font-black text-xs text-rose-900 uppercase tracking-wide">
                {isDarija ? 'Bloqueur de pub khedam !' : 'Bloqueur de pub détecté !'}
              </h4>
              <p className="text-[10px] text-rose-700 font-bold uppercase mt-0.5">
                {isDarija ? '3awenna o tfi l-adblocker ola khoud Dahabi.' : 'Soutenez Floussi en désactivant votre bloqueur, ou passez au plan Premium.'}
              </p>
            </div>
          </div>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-3xs"
            >
              {isDarija ? 'Plan Dahabi (Sans Pubs)' : 'Passer à Premium (Sans Pubs)'}
            </button>
          )}
        </div>
      ) : !adLoaded ? (
        <div className="flex items-center justify-center py-4 text-[10px] font-black text-amber-600 uppercase tracking-widest gap-2">
          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span>{isDarija ? 'Khlas dyal Sponsor (AdSense)...' : 'Chargement du partenaire Google AdSense...'}</span>
        </div>
      ) : contextualAd ? (
        // Contextual Ad Rendering
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-700 flex-shrink-0 mt-0.5 md:mt-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="inline-block px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-800 bg-amber-200 rounded">
                  {isDarija ? 'Sponsorisé' : 'Conseil Sponsorisé'}
                </span>
                <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">
                  {contextualAd.sponsorName}
                </span>
              </div>
              <h4 className="font-black text-xs sm:text-sm text-amber-950 leading-tight uppercase">
                {isDarija ? contextualAd.titleDarija : contextualAd.titleFr}
              </h4>
              <p className="text-[11px] text-amber-800 mt-1 font-semibold leading-relaxed">
                {isDarija ? contextualAd.descriptionDarija : contextualAd.descriptionFr}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
            <a
              href={contextualAd.targetUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1.5 hover:scale-105 transition-all shadow-3xs cursor-pointer"
            >
              <span>{isDarija ? contextualAd.ctaTextDarija : contextualAd.ctaTextFr}</span>
              <ExternalLink size={11} />
            </a>
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="w-full md:w-auto px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                {isDarija ? 'Masquer d-pub' : 'Plan Dahabi'}
              </button>
            )}
          </div>
        </div>
      ) : (
        // Standard General Ad Fallback
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-700 flex-shrink-0 mt-0.5 md:mt-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="inline-block px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-800 bg-amber-200 rounded">
                  {isDarija ? 'Sponsorisé' : 'Sponsorisé'}
                </span>
                <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">Attijariwafa Bank</span>
              </div>
              <h4 className="font-black text-xs sm:text-sm text-amber-950 leading-tight uppercase">
                {isDarija ? 'Da3m d-Aïd Al-Adha 2026 mzyan !' : 'Achetez votre mouton de l\'Aïd à tempérament avec Attijariwafa !'}
              </h4>
              <p className="text-[11px] text-amber-800 mt-1 font-semibold leading-relaxed">
                {isDarija ? 'Financez vos événements traditionnels en toute sérénité. Offres spéciales.' : 'Financez vos événements traditionnels en toute sérénité. Offres de crédit gratuites pour l\'Aïd Al-Adha.'}
              </p>
            </div>
          </div>
          
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer"
            >
              <span>{isDarija ? 'Masquer d-pub' : 'Masquer ces pubs'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AdBanner;
