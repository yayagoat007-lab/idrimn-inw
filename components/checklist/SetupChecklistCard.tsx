import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Target, 
  Camera, 
  MessageSquareCode, 
  Package, 
  Wallet, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Sparkles,
  ArrowRight,
  ClipboardCheck
} from 'lucide-react';
import { useSetupChecklist } from '../../hooks/use-setup-checklist';
import { ConfettiAnimation } from '../shared/ConfettiAnimation';
import { Language } from '../../lib/i18n';

interface SetupChecklistCardProps {
  userId?: string;
  language: Language;
  onNavigate: (screen: string) => void;
}

const IconMap: Record<string, React.ComponentType<any>> = {
  CreditCard,
  Target,
  Camera,
  MessageSquareCode,
  Package,
  Wallet
};

export function SetupChecklistCard({
  userId = "mock-user-id-9999",
  language,
  onNavigate
}: SetupChecklistCardProps) {
  const { items, progress, isVisible, dismissChecklist } = useSetupChecklist(userId);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [isFullyCompletedCelebration, setIsFullyCompletedCelebration] = useState(false);

  // Trigger celebration when percent reaches 100%
  useEffect(() => {
    if (progress.percentComplete === 100 && isVisible) {
      setConfettiActive(true);
      setIsFullyCompletedCelebration(true);
      
      const timer = setTimeout(() => {
        setIsFullyCompletedCelebration(false);
        dismissChecklist();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [progress.percentComplete, isVisible, dismissChecklist]);

  if (!isVisible) return null;

  return (
    <div className="w-full relative">
      <ConfettiAnimation active={confettiActive} onComplete={() => setConfettiActive(false)} />

      <AnimatePresence mode="wait">
        {isFullyCompletedCelebration ? (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-emerald-600 text-white rounded-[24px] p-6 shadow-xl flex flex-col items-center text-center space-y-4 border border-emerald-500 relative overflow-hidden"
          >
            {/* Traditional Moroccan geometric/stars details in bg */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: 3 }}
              className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-amber-300 border border-white/20"
            >
              <Sparkles size={32} className="fill-current" />
            </motion.div>

            <div className="space-y-1 relative z-10">
              <h3 className="text-lg font-black tracking-tight">
                {language === 'darija' ? "Kollchi Nadi! 🎉" : "Configuration Complétée ! 🎉"}
              </h3>
              <p className="text-xs text-emerald-100 max-w-sm mx-auto font-medium leading-relaxed">
                {language === 'darija'
                  ? "Safi kmmlti l-khotowat kamlin dyal bdaya! Rba7ti dousinat d l'XP o daba nta mwa7ad mzyan tssayar floussekk."
                  : "Excellent ! Vous avez complété toutes les étapes d'installation de Floussi. Vous êtes prêt à gérer votre budget comme un pro !"}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="checklist-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm space-y-4 overflow-hidden relative"
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/30">
                  <ClipboardCheck size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                    {language === 'darija' ? "Khotowat l-bdaya dyalk 🚀" : "Vos premiers pas sur Floussi 🚀"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    {progress.completedCount} / {progress.totalCount} {language === 'darija' ? "kmmlti" : "complétés"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={isCollapsed ? "Agrandir" : "Réduire"}
                >
                  {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
                <button
                  onClick={dismissChecklist}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Fermer définitivement"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-black text-slate-600">
                <span>{language === 'darija' ? "Taqaddom" : "Progression"}</span>
                <span className="font-mono text-emerald-600">{progress.percentComplete}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentComplete}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            {/* Expandable items list */}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden pt-2"
                >
                  <div className="divide-y divide-slate-100 border-t border-slate-100">
                    {items.map(item => {
                      const IconComponent = IconMap[item.icon] || ClipboardCheck;
                      return (
                        <div 
                          key={item.id} 
                          className="py-3 flex items-start gap-3 justify-between group transition-colors"
                        >
                          {/* Checkbox & Text */}
                          <div className="flex gap-3 items-start min-w-0">
                            <div className="mt-0.5 text-emerald-500">
                              {item.isCompleted ? (
                                <CheckCircle2 size={18} className="fill-emerald-50 text-emerald-500" />
                              ) : (
                                <Circle size={18} className="text-slate-300" />
                              )}
                            </div>

                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold leading-tight ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                  {language === 'darija' ? item.label.darija : item.label.fr}
                                </span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-100/40 ${item.isCompleted ? 'opacity-50' : ''}`}>
                                  +{item.xpReward} XP
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                                {language === 'darija' ? item.description.darija : item.description.fr}
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          {!item.isCompleted && (
                            <button
                              onClick={() => onNavigate(item.actionRoute)}
                              className="self-center flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 text-[10px] font-extrabold text-slate-600 hover:text-emerald-700 border border-slate-200/60 hover:border-emerald-200/50 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                            >
                              <span>{language === 'darija' ? 'Bda' : 'Faire'}</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
