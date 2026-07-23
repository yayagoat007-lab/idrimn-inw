import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, CheckCircle, Flame, ArrowRight, Star } from 'lucide-react';
import { useGamification } from '../../hooks/use-gamification';
import { ConfettiAnimation } from '../shared/ConfettiAnimation';
import { LevelProgress } from '../gamification/LevelProgress';
import { Language } from '../../lib/i18n';

interface FirstTransactionCelebrationProps {
  userId?: string;
  language: Language;
  onClose: () => void;
}

export function FirstTransactionCelebration({
  userId = "mock-user-id-9999",
  language,
  onClose
}: FirstTransactionCelebrationProps) {
  const { state: gamificationState } = useGamification(userId);
  const [confettiActive, setConfettiActive] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Start with confetti
    setConfettiActive(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <ConfettiAnimation active={confettiActive} onComplete={() => setConfettiActive(false)} />

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -30 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
          className="bg-white rounded-[32px] border border-slate-100 max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Moroccan Traditional Accent Corner */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Celebration Icon Header */}
            <div className="text-center space-y-3">
              <motion.div 
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100/50 text-emerald-500 relative"
              >
                <CheckCircle size={40} className="stroke-[2.5]" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 p-1.5 rounded-full"
                >
                  <Sparkles size={14} className="fill-current" />
                </motion.div>
              </motion.div>

              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100/40">
                  {language === 'darija' ? "Khatwa Ola Jbeera" : "Première Étape Franchie !"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {language === 'darija' 
                    ? "Bravo! Sajjelti l'masrouf l'awal dyalk 🎉" 
                    : "Bravo! Première transaction enregistrée 🎉"}
                </h2>
              </div>
            </div>

            {/* XP Floating/Pop animation */}
            <div className="relative h-20 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 0.4 }}
                className="flex items-center gap-2 text-emerald-600 bg-white border border-emerald-100 px-5 py-2.5 rounded-2xl shadow-sm"
              >
                <Star size={18} className="fill-current animate-spin-slow" />
                <span className="text-lg font-black tracking-tight">
                  {language === 'darija' ? "+10 XP Rbehtiha !" : "+10 XP Débloqués !"}
                </span>
              </motion.div>
            </div>

            {/* Gamification Level Progress display */}
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider text-center">
                {language === 'darija' ? "Had l-XP tla3 lik l-niveau" : "Cet XP met à jour votre niveau global"}
              </p>
              <LevelProgress xp={gamificationState.xp} />
            </div>

            {/* Quick system explanation */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {language === 'darija'
                  ? "Koll masrouf, kraya, ola tawfir katsajjlo tay3tik l-XP f Floussi. Khdem dima o rba7 badges o hdaya zwinin l l-mustaqbal dyalk ! 💪"
                  : "Chaque dépense, revenu, ou épargne que vous enregistrez vous fait gagner de l'XP. Restez régulier pour débloquer des badges exclusifs et monter de niveau ! 💪"}
              </p>
            </div>

            {/* Continuer CTA */}
            <button
              onClick={onClose}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>{language === 'darija' ? "Zid l'9dam 🚀" : "Continuer l'aventure 🚀"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
