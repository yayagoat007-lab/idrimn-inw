import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OptimizationChallenge } from '../../lib/optimization-challenges';
import { ConfettiAnimation } from '../shared/ConfettiAnimation';
import { Trophy, Sparkles, Award, Star, TrendingDown, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface ChallengeResultCelebrationProps {
  challenge: OptimizationChallenge;
  onClose: () => void;
  language: 'fr' | 'darija';
}

export function ChallengeResultCelebration({
  challenge,
  onClose,
  language
}: ChallengeResultCelebrationProps) {
  const isDarija = language === 'darija';
  const [confettiActive, setConfettiActive] = useState(true);

  useEffect(() => {
    setConfettiActive(true);
  }, [challenge]);

  const savingsGained = challenge.baselineValue - challenge.currentValue;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Confetti Animation Trigger */}
      <ConfettiAnimation active={confettiActive} onComplete={() => setConfettiActive(false)} />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 text-center space-y-6 relative"
        >
          {/* Sparkles Decorative */}
          <div className="absolute top-4 left-4 text-amber-400 animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="absolute top-10 right-10 text-indigo-400 animate-bounce">
            <Star className="w-4 h-4 fill-indigo-400" />
          </div>

          {/* Icon Trophy */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-lg border border-amber-300 relative">
              <Trophy className="w-10 h-10 text-white drop-shadow-md animate-bounce" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-800 leading-tight">
              {isDarija ? "Mabrouk ! Njahti f l-Tahaddi 🏆" : "Félicitations, Défi Réussi ! 🏆"}
            </h2>
            <p className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest">
              {challenge.title}
            </p>
          </div>

          {/* Score details */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {isDarija 
                ? `Khrebti ${formatCurrency(challenge.currentValue)} 3la l-chhar kamel (f sandoq ${challenge.category}), dewwzti l-Hadaf dyal ${formatCurrency(challenge.targetValue)} DH d-mizaniya !`
                : `Vous avez dépensé seulement ${formatCurrency(challenge.currentValue)} sur les 30 jours, respectant la limite de ${formatCurrency(challenge.targetValue)} sur votre budget ${challenge.category} !`}
            </p>

            <div className="border-t border-slate-200/50 pt-3 flex justify-around text-center">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isDarija ? "L-Yddikhar" : "Économie réelle"}
                </span>
                <span className="text-sm font-black text-emerald-600 block">
                  +{formatCurrency(savingsGained)}
                </span>
              </div>

              <div className="border-l border-slate-200/50" />

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isDarija ? "L'Engagé" : "Nouveau Score"}
                </span>
                <span className="text-sm font-black text-indigo-600 block">
                  On-Track ✅
                </span>
              </div>
            </div>
          </div>

          {/* Reward Alert */}
          <div className="bg-indigo-50/60 border border-indigo-100/30 rounded-2xl p-3 flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span className="text-xs font-black text-indigo-800">
              {isDarija 
                ? `Rbehti +${challenge.xpReward} XP o tla3ti f l-score!` 
                : `Vous gagnez +${challenge.xpReward} XP & renforcez votre Score Floussi !`}
            </span>
          </div>

          {/* Confirm Button */}
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-3 text-xs font-black tracking-wider transition-all cursor-pointer shadow-md"
          >
            {isDarija ? "Mzyan, Chokran !" : "Merveilleux, merci !"}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
