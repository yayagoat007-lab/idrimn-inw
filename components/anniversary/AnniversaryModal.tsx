import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Cake, 
  Trophy, 
  Award, 
  TrendingUp, 
  Activity,
  Heart
} from 'lucide-react';
import { SidiAvatar } from '../sidi/SidiAvatar';
import { ConfettiAnimation } from '../shared/ConfettiAnimation';
import { AnniversarySummary } from '../../lib/account-anniversary';
import { useFocusTrap } from '../../hooks/use-focus-trap';

interface AnniversaryModalProps {
  summary: AnniversarySummary;
  language: 'fr' | 'darija';
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export const AnniversaryModal: React.FC<AnniversaryModalProps> = ({
  summary,
  language,
  onClose,
  onNavigate
}) => {
  const [showConfetti, setShowConfetti] = useState<boolean>(true);
  const content = summary[language];
  const years = summary.yearsCount;

  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen: true, onClose });

  // Re-run confetti animation every 4 seconds for maximum celebration vibe while modal is open
  useEffect(() => {
    const timer = setInterval(() => {
      setShowConfetti(false);
      setTimeout(() => setShowConfetti(true), 100);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleViewWrapped = () => {
    onNavigate('wrapped');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Real-time Confetti celebration animation */}
      <ConfettiAnimation active={showConfetti} onComplete={() => {}} />

      <motion.div
        ref={modalRef}
        id="anniversary-celebration-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-100 flex flex-col relative my-8"
      >
        {/* Moroccan Arch Pattern & Emerald/Gold Festive Gradient Header Overlay */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/15 via-emerald-500/5 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          id="close-anniversary-modal"
          onClick={onClose}
          aria-label="Fermer la célébration d'anniversaire / إغلاق احتفال ذكرى الحساب"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100/80 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="p-6 md:p-8 pt-12 flex flex-col items-center relative">
          
          {/* Celebrating Avatar and Years Badge Badge */}
          <div className="relative mb-6">
            {/* Pulsing halo */}
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl scale-125 animate-pulse" />
            
            {/* Sidi Floussi avatar in "happy" mode */}
            <div className="relative z-10 p-1 bg-white rounded-full border-4 border-amber-400 shadow-xl">
              <SidiAvatar mood="happy" size={100} className="rounded-full bg-amber-50/50" />
            </div>

            {/* Shield / Badge indicating tenure years */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-2xl px-3 py-1 text-xs font-black shadow-lg border-2 border-white flex items-center gap-1 animate-bounce">
              <Cake className="w-3.5 h-3.5 fill-white" />
              <span>{years} {language === 'darija' ? 'Snin' : years === 1 ? 'An' : 'Ans'}</span>
            </div>
          </div>

          {/* Balloon Message banner */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-1.5 mb-5 text-xs font-black text-amber-800 tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
            <span>
              {language === 'darija' ? 'MOUNAFAQA CHARAFIYA !' : 'MOMENT DE CÉLÉBRATION !'}
            </span>
          </div>

          {/* Title & Celebration Message */}
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center tracking-tight leading-tight px-2">
            {content.title}
          </h2>

          <p className="text-slate-600 text-center mt-3.5 text-sm md:text-base leading-relaxed px-1 font-medium">
            {content.message}
          </p>

          {/* Big Featured Stat Card (Savings Cumulative) */}
          <div className="w-full mt-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white flex flex-col items-center justify-center text-center shadow-lg shadow-emerald-600/15 relative overflow-hidden group">
            {/* Sparkles backdrop */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            
            <span className="text-emerald-100 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-200" />
              {language === 'darija' ? 'Majmou3 l-iddikhar l-kamil' : 'Total Épargné Cumulé'}
            </span>
            <h3 className="text-2xl md:text-3xl font-black mt-1.5 tracking-tight drop-shadow-sm">
              {content.highlightStat}
            </h3>
          </div>

          {/* Grid of accomplishments / stats */}
          <div className="w-full grid grid-cols-2 gap-3 mt-4">
            {/* Transactions Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {language === 'darija' ? 'Mo3amalat' : 'Transactions'}
                </span>
                <span className="font-black text-slate-800 text-sm">
                  {years > 0 ? '✓ ' : ''} Actif
                </span>
              </div>
            </div>

            {/* Level Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Award className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {language === 'darija' ? 'Mostawa' : 'Niveau'}
                </span>
                <span className="font-black text-slate-800 text-sm truncate max-w-[120px]">
                  {language === 'darija' ? 'Intermédiaire' : 'Avancé'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons section */}
          <div className="w-full mt-7 flex flex-col gap-2.5">
            {/* View Wrapped Action Button */}
            <button
              id="view-wrapped-btn"
              onClick={handleViewWrapped}
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-sm font-black transition-all shadow-xl shadow-amber-500/20 active:scale-98 group cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-100 fill-amber-100 animate-spin-slow" />
              <span>
                {language === 'darija' ? 'Chouf l-Wrapped dyali' : 'Voir mon Wrapped complet'}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Dismiss Button */}
            <button
              id="anniversary-dismiss-btn"
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-sm font-black transition-all active:scale-98 cursor-pointer"
            >
              {language === 'darija' ? 'Safi Chokran !' : 'Merci, continuons !'}
            </button>
          </div>

          {/* Warm appreciation tag */}
          <div className="mt-5 text-[11px] text-slate-400 font-bold tracking-wide flex items-center gap-1 select-none">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>{language === 'darija' ? 'M3ak dima f kol khotwa' : 'Floussi vous accompagne pas à pas'}</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
