"use client";

import React, { useState } from 'react';
import { useGoals } from '../../../hooks/use-goals';
import { useGoalStats } from '../../../hooks/use-goal-stats';
import { GoalCard } from '../../../components/goals/GoalCard';
import { GoalForm } from '../../../components/goals/GoalForm';
import { GoalContributionModal } from '../../../components/goals/GoalContributionModal';
import { ConfettiAnimation } from '../../../components/shared/ConfettiAnimation';
import { getTranslation, Language } from '../../../lib/i18n';
import { formatCurrency } from '../../../lib/utils';
import { Plus, Target, Award, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

interface GoalsPageProps {
  language: Language;
}

export default function GoalsPage({ language = 'fr' }: GoalsPageProps) {
  const { 
    goals, 
    contributions, 
    loading, 
    createGoal, 
    updateGoal, 
    deleteGoal, 
    contributeToGoal 
  } = useGoals();

  const { stats, loading: statsLoading, modelScenario, refreshStats } = useGoalStats();

  // Local navigation/modals states
  const [showGoalCreator, setShowGoalCreator] = useState(false);
  const [activeFormGoal, setActiveFormGoal] = useState<any | null>(null);
  const [activeContributeGoal, setActiveContributeGoal] = useState<any | null>(null);
  
  // Confetti celebration trigger
  const [showCelebration, setShowCelebration] = useState(false);

  const handleCreateOrUpdateGoal = async (data: any) => {
    if (activeFormGoal) {
      await updateGoal(activeFormGoal.id, data);
    } else {
      await createGoal(data);
    }
    setShowGoalCreator(false);
    setActiveFormGoal(null);
    refreshStats();
  };

  const handleContribute = async (goalId: string, amount: number, note: string) => {
    await contributeToGoal(goalId, amount, note);
    refreshStats();

    // Trigger celebration if goal reaches target
    const targetGoal = goals.find(g => g.id === goalId);
    if (targetGoal) {
      const nextAmount = targetGoal.current_amount + amount;
      if (nextAmount >= targetGoal.target_amount) {
        setShowCelebration(true);
      }
    }
  };

  // General summaries
  const totalSaved = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + (g.target_amount || 0), 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Celebration overlay */}
      <ConfettiAnimation active={showCelebration} onComplete={() => setShowCelebration(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>{getTranslation('goals', language)}</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-black uppercase rounded-full">
              Ahdaf ({goals.length})
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-semibold">
            Planifiez vos investissements, projets et fêtes religieuses marocaines en toute sérénité.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveFormGoal(null);
            setShowGoalCreator(true);
          }}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>Créer un Objectif</span>
        </button>
      </div>

      {/* Financial Portfolio progress summary card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-24 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
          <div className="md:col-span-2 space-y-3">
            <span className="inline-block px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-black tracking-wider uppercase text-amber-400">
              PORTEFEUILLE D'EPARGNE GLOBAL
            </span>
            <h3 className="text-lg font-black tracking-tight leading-snug uppercase">
              Votre capital d'épargne constitué
            </h3>
            <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
              En constituant des réserves pour vos projets à l'avance, vous réduisez de <span className="font-bold text-emerald-400">82%</span> le recours aux crédits à la consommation pour les fêtes et l'achat de biens durables.
            </p>
          </div>

          <div className="bg-white/10 p-5 rounded-2xl border border-white/10 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Total Épargné</span>
            <p className="text-2xl font-black">{formatCurrency(totalSaved)}</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase mt-1">{overallPercentage}% du capital ciblé ({formatCurrency(totalTarget)})</p>
          </div>
        </div>
      </div>

      {/* Main Grid display of Goal Cards */}
      {goals.length === 0 ? (
        <div className="p-12 bg-white border border-slate-100 rounded-3xl text-center space-y-3">
          <Target size={36} className="text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Aucun objectif en cours</h4>
          <p className="text-[10px] text-slate-400 font-semibold max-w-sm mx-auto">
            Vous n'avez pas encore défini de projets d'épargne. Cliquez sur le bouton en haut à droite pour planifier votre premier projet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const goalStat = stats[goal.id];

            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                stats={goalStat}
                language={language}
                onContribute={(g) => setActiveContributeGoal(g)}
                onEdit={(g) => {
                  setActiveFormGoal(g);
                  setShowGoalCreator(true);
                }}
                onDelete={(id) => deleteGoal(id)}
                modelScenario={modelScenario}
              />
            );
          })}
        </div>
      )}

      {/* GOAL CREATOR POPUP MODAL */}
      {showGoalCreator && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <GoalForm
              goal={activeFormGoal}
              onSubmit={handleCreateOrUpdateGoal}
              onCancel={() => {
                setShowGoalCreator(false);
                setActiveFormGoal(null);
              }}
            />
          </div>
        </div>
      )}

      {/* GOAL CONTRIBUTION POPUP MODAL */}
      <GoalContributionModal
        isOpen={!!activeContributeGoal}
        onClose={() => setActiveContributeGoal(null)}
        goal={activeContributeGoal}
        logs={contributions}
        onContribute={handleContribute}
      />

    </div>
  );
}
