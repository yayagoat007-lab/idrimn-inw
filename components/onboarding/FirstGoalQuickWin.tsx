import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { getSuggestedFirstGoal } from '../../lib/first-goal-suggestion';
import { useGoals } from '../../hooks/use-goals';
import { awardGlobalXp, unlockGlobalBadge } from '../../lib/gamification';
import { ConfettiAnimation } from '../shared/ConfettiAnimation';
import { GoalForm } from '../goals/GoalForm';
import { SidiAvatar } from '../sidi/SidiAvatar';
import { Language } from '../../lib/i18n';
import { formatCurrency } from '../../lib/utils';

interface FirstGoalQuickWinProps {
  userId?: string;
  persona?: string;
  monthlyIncome?: number;
  language: Language;
  onResolve: () => void;
}

export function FirstGoalQuickWin({
  userId = "mock-user-id-9999",
  persona = "salarie",
  monthlyIncome = 8000,
  language,
  onResolve
}: FirstGoalQuickWinProps) {
  const { createGoal } = useGoals(userId);
  const [success, setSuccess] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [badgeUnlocked, setBadgeUnlocked] = useState<any>(null);

  const suggestion = getSuggestedFirstGoal(persona, monthlyIncome);
  const IconComponent = (Icons as any)[suggestion.icon] || Icons.PiggyBank;

  // Handle immediate 1-click creation
  const handleQuickCreate = async () => {
    // Calculate 12 months deadline from today or the custom deadline suggested
    const months = suggestion.suggestedDeadlineMonths;
    const deadlineDate = new Date();
    deadlineDate.setMonth(deadlineDate.getMonth() + months);
    const formattedDeadline = deadlineDate.toISOString().split('T')[0];

    const newGoalData = {
      name: language === 'darija' ? suggestion.name.darija : suggestion.name.fr,
      target_amount: suggestion.suggestedAmount,
      current_amount: 0,
      deadline: formattedDeadline,
      bucket_id: null,
      color: suggestion.color,
      icon: suggestion.icon,
      auto_contribute_amount: Math.round(suggestion.suggestedAmount / months)
    };

    try {
      await createGoal(newGoalData);

      // Trigger Celebration
      setConfettiActive(true);
      setSuccess(true);

      // Award XP (50 XP for first goal)
      const xpResult = awardGlobalXp(userId, 50);
      setXpEarned(50);

      // Unlock Badge
      const badgeResult = unlockGlobalBadge(userId, 'first_goal_created');
      if (badgeResult.unlocked) {
        setBadgeUnlocked(badgeResult.badge);
      }
    } catch (err) {
      console.error("Error creating quick win goal:", err);
    }
  };

  // Handle customized submission
  const handleCustomSubmit = async (formData: any) => {
    try {
      await createGoal({
        name: formData.name,
        target_amount: formData.target_amount,
        current_amount: formData.current_amount || 0,
        deadline: formData.deadline || null,
        bucket_id: formData.bucket_id || null,
        color: formData.color,
        icon: formData.icon,
        auto_contribute_amount: formData.auto_contribute_amount || 0
      });

      setIsCustomizing(false);
      setConfettiActive(true);
      setSuccess(true);

      // Award XP and Badge
      awardGlobalXp(userId, 50);
      setXpEarned(50);

      const badgeResult = unlockGlobalBadge(userId, 'first_goal_created');
      if (badgeResult.unlocked) {
        setBadgeUnlocked(badgeResult.badge);
      }
    } catch (err) {
      console.error("Error creating customized goal:", err);
    }
  };

  // Skip / dismiss First Goal Quick Win
  const handleSkip = () => {
    localStorage.setItem('floussi_first_goal_quickwin_completed', 'true');
    onResolve();
  };

  // Close success state and move to dashboard
  const handleProceed = () => {
    localStorage.setItem('floussi_first_goal_quickwin_completed', 'true');
    onResolve();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <ConfettiAnimation active={confettiActive} onComplete={() => setConfettiActive(false)} />

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="suggest-view"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-[32px] border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Moroccan Traditional Accent Corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {!isCustomizing ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-black text-[10px] uppercase tracking-widest border border-emerald-100/40">
                    <Icons.Sparkles size={11} className="animate-pulse" />
                    {language === 'darija' ? "Victoire Sereeya" : "Petite Victoire !"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {language === 'darija' 
                      ? "Yallah! Nbda'o b أول هدف توفير ديالك 🎯" 
                      : "Yallah! Créons votre premier objectif d'épargne 🎯"}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {language === 'darija'
                      ? "Sidi Floussi wejjed lik had t-taqtira s-sghira bach t-bda t-khbi floussek b tariqa dkiya o sahla mn dba!"
                      : "Sidi Floussi a préparé cette suggestion intelligente adaptée à votre profil pour lancer votre épargne dès aujourd'hui."}
                  </p>
                </div>

                {/* Sidi Explains / Speech bubble */}
                <div className="bg-emerald-50/60 border border-emerald-100/40 p-4 rounded-2xl flex items-start gap-3.5 relative">
                  <SidiAvatar mood="happy" size={48} className="shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                      {language === 'darija' ? "Nassiha d Sidi Floussi" : "Conseil de Sidi Floussi"}
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                      "{language === 'darija' ? suggestion.reasoning.darija : suggestion.reasoning.fr}"
                    </p>
                  </div>
                </div>

                {/* Featured Suggestion Card */}
                <div className="bg-slate-50/70 border border-slate-100 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: suggestion.color }}
                    >
                      <IconComponent size={24} className="stroke-[2.5]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-sm text-slate-800 leading-snug">
                        {language === 'darija' ? suggestion.name.darija : suggestion.name.fr}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {language === 'darija' ? `L-hadaf: ${suggestion.suggestedDeadlineMonths} Ch-hor` : `Échéance suggérée: ${suggestion.suggestedDeadlineMonths} mois`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600 block leading-tight">
                        {formatCurrency(suggestion.suggestedAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-extrabold block">
                        {language === 'darija' ? "D-Dirham" : "DH marocain"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100/80 pt-3 flex justify-between items-center text-[11px] font-bold text-slate-500">
                    <span>
                      {language === 'darija' ? "Épargne mensuelle estimée:" : "Versement mensuel suggéré:"}
                    </span>
                    <span className="text-slate-800 font-extrabold">
                      {formatCurrency(Math.round(suggestion.suggestedAmount / suggestion.suggestedDeadlineMonths))} / {language === 'darija' ? "chhar" : "mois"}
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleQuickCreate}
                    className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/15 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Icons.CheckCircle2 size={16} />
                    {language === 'darija' ? "Créer cet objectif f 1 Clic 🚀" : "Créer cet objectif en 1 clic 🚀"}
                  </button>

                  <div className="flex justify-between items-center px-2 text-xs">
                    <button
                      onClick={() => setIsCustomizing(true)}
                      className="text-slate-500 hover:text-emerald-600 font-extrabold transition-all hover:underline cursor-pointer"
                    >
                      🔧 {language === 'darija' ? "Beddel / Personaliser" : "Personnaliser"}
                    </button>

                    <button
                      onClick={handleSkip}
                      className="text-slate-400 hover:text-slate-600 font-extrabold transition-all hover:underline cursor-pointer"
                    >
                      {language === 'darija' ? "Men ba3d, choukran" : "Plus tard, merci"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <button 
                    onClick={() => setIsCustomizing(false)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-all cursor-pointer"
                  >
                    <Icons.ArrowLeft size={16} />
                  </button>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    {language === 'darija' ? "Personaliser l-hadaf dyalk" : "Personnaliser votre objectif"}
                  </h3>
                </div>

                <GoalForm
                  goal={{
                    id: 'temp-suggested',
                    user_id: userId,
                    name: language === 'darija' ? suggestion.name.darija : suggestion.name.fr,
                    target_amount: suggestion.suggestedAmount,
                    current_amount: 0,
                    deadline: new Date(Date.now() + suggestion.suggestedDeadlineMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    bucket_id: null,
                    color: suggestion.color,
                    icon: suggestion.icon,
                    auto_contribute_amount: Math.round(suggestion.suggestedAmount / suggestion.suggestedDeadlineMonths),
                    created_at: '',
                    updated_at: ''
                  }}
                  onSubmit={handleCustomSubmit}
                  onCancel={() => setIsCustomizing(false)}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] border border-slate-100 max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center space-y-6"
          >
            {/* Visual Success */}
            <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
              <Icons.CheckCircle2 className="text-emerald-500 stroke-[2.5]" size={42} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {language === 'darija' ? "Mabrouk! 🥳 Hadaf dyalk t-crayat" : "Félicitations! 🥳 Objectif créé"}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                {language === 'darija'
                  ? "T-mkin dyal l-hadaf l-awal dyalk t-bda dba f d-Dashboard. Sidi Floussi s-sa3id bik !"
                  : "Votre premier objectif d'épargne est maintenant configuré. Vous avez fait un grand pas vers votre santé financière !"}
              </p>
            </div>

            {/* Sidi says */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 text-left">
              <SidiAvatar mood="happy" size={44} className="shrink-0" />
              <div>
                <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                  Sidi Floussi
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-bold italic mt-0.5">
                  "{language === 'darija' ? "Hadaf dyalk rwa3! Ton premier objectif est en route ! 🎯" : "Ton premier objectif est en route ! 🎯"}"
                </p>
              </div>
            </div>

            {/* Rewards Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white text-left shadow-lg shadow-emerald-500/10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 block">
                  {language === 'darija' ? "Jawa'iz s-Sandoq" : "Récompense débloquée"}
                </span>
                <span className="font-extrabold text-sm block leading-snug">
                  {badgeUnlocked ? badgeUnlocked.title : (language === 'darija' ? "Premier Objectif Lancé" : "Premier Objectif Lancé")}
                </span>
                <span className="text-[10px] text-emerald-100 block font-medium">
                  {badgeUnlocked ? badgeUnlocked.description : (language === 'darija' ? "Créer son premier projet d'épargne" : "Créer son premier projet d'épargne")}
                </span>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-xs rounded-xl px-2.5 py-1.5 min-w-[70px]">
                <span className="text-2xl block leading-none">
                  {badgeUnlocked ? badgeUnlocked.emoji : "🎯"}
                </span>
                <span className="text-[10px] font-bold block mt-1 text-emerald-100">
                  +{xpEarned} XP
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleProceed}
              className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl tracking-wider transition-all uppercase cursor-pointer"
            >
              {language === 'darija' ? "Idh-hab l-Dashboard 🚀" : "Continuer vers le Dashboard 🚀"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
