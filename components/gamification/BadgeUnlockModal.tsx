import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X } from 'lucide-react';
import { Badge } from '../../lib/gamification';

interface BadgeUnlockModalProps {
  badge: Badge;
  language: 'fr' | 'darija';
  onClose: () => void;
}

export function BadgeUnlockModal({ badge, language, onClose }: BadgeUnlockModalProps) {
  const isDarija = language === 'darija';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
        >
          {/* Decorative background gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -z-10" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Icon/Emoji display */}
          <div className="relative inline-flex items-center justify-center mt-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              className="absolute inset-0 bg-amber-100/40 rounded-full blur-md"
            />
            <div className="relative w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center text-4xl shadow-md animate-bounce">
              {badge.emoji}
            </div>
          </div>

          {/* Celebration Header */}
          <div className="space-y-1.5 mt-6">
            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {isDarija ? "Wesslat k-Mofajaa! 🏆" : "Badge Débloqué ! 🏆"}
            </span>
            <h3 className="text-lg font-black text-slate-800">
              {isDarija ? "Mabrouk 3lik !" : "Félicitations !"}
            </h3>
          </div>

          {/* Badge details */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 my-5 space-y-1">
            <h4 className="font-extrabold text-sm text-slate-900">
              {badge.title}
            </h4>
            <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
              {badge.description}
            </p>
          </div>

          {/* XP Gained info */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-emerald-600 mb-6 bg-emerald-50/50 py-1.5 px-4 rounded-xl border border-emerald-100 w-fit mx-auto">
            <Star size={14} fill="currentColor" />
            <span>+{badge.xpValue} XP</span>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            {isDarija ? "Nchouf d-Dashboard" : "Excellent !"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default BadgeUnlockModal;
