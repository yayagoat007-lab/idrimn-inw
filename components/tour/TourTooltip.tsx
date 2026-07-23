import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../../lib/i18n';
import { X, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';

interface TourTooltipProps {
  targetSelector: string;
  title: {
    fr: string;
    darija: string;
  };
  description: {
    fr: string;
    darija: string;
  };
  placement?: 'top' | 'bottom' | 'left' | 'right';
  currentStepIndex: number;
  totalSteps: number;
  language: Language;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

export function TourTooltip({
  targetSelector,
  title,
  description,
  placement = 'bottom',
  currentStepIndex,
  totalSteps,
  language,
  onNext,
  onPrevious,
  onSkip,
}: TourTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      const tooltip = tooltipRef.current;
      if (!element || !tooltip) return;

      const rect = element.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      let top = 0;
      let left = 0;
      const gap = 12; // Gap in pixels between target element and tooltip

      // Primary placements
      switch (placement) {
        case 'top':
          top = rect.top - tooltipRect.height - gap;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.left - tooltipRect.width - gap;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.left + rect.width + gap;
          break;
        case 'bottom':
        default:
          top = rect.top + rect.height + gap;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
      }

      // Viewport safety constraints
      const margin = 16;
      const maxLeft = window.innerWidth - tooltipRect.width - margin;
      const maxTop = window.innerHeight - tooltipRect.height - margin;

      left = Math.max(margin, Math.min(maxLeft, left));
      top = Math.max(margin, Math.min(maxTop, top));

      setStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        opacity: 1,
        zIndex: 50,
      });
    };

    // Run position calculations
    updatePosition();

    // Set listeners
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    // Small delay to let rendering dimensions settle, especially with React hydration/motion transitions
    const timer = setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearTimeout(timer);
    };
  }, [targetSelector, placement, title, description, currentStepIndex]);

  const t = {
    fr: {
      skip: "Passer",
      prev: "Précédent",
      next: "Suivant",
      finish: "Terminer",
    },
    darija: {
      skip: "Nqqez",
      prev: "Rje3",
      next: "Zid",
      finish: "Sala",
    }
  }[language === 'darija' ? 'darija' : 'fr'];

  const isLast = currentStepIndex === totalSteps - 1;

  return (
    <div
      ref={tooltipRef}
      style={style}
      className="w-80 max-w-sm bg-white border border-emerald-100/80 rounded-2xl shadow-2xl p-4 md:p-5 pointer-events-auto transition-all duration-300 font-sans"
    >
      {/* Header with step count and Skip */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {language === 'darija' ? 'Mar7ala' : 'Étape'} {currentStepIndex + 1} / {totalSteps}
        </span>
        <button
          onClick={onSkip}
          className="text-[10px] font-extrabold text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors cursor-pointer"
        >
          {t.skip} ✕
        </button>
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5">
        <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 leading-tight">
          <Sparkles size={14} className="text-emerald-600 animate-pulse" />
          <span>{language === 'darija' ? title.darija : title.fr}</span>
        </h4>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          {language === 'darija' ? description.darija : description.fr}
        </p>
      </div>

      {/* Buttons / Navigation */}
      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
        {/* Previous button */}
        <button
          onClick={onPrevious}
          disabled={currentStepIndex === 0}
          className={`flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-850 transition-colors disabled:opacity-0 disabled:pointer-events-none cursor-pointer`}
        >
          <ArrowLeft size={12} />
          <span>{t.prev}</span>
        </button>

        {/* Next / Finish button */}
        <button
          onClick={onNext}
          className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            isLast
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>{isLast ? t.finish : t.next}</span>
          {isLast ? <Check size={12} /> : <ArrowRight size={12} />}
        </button>
      </div>
    </div>
  );
}
