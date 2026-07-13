import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Goal } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Language } from '../../lib/i18n';
import { CircularProgress } from '../shared/CircularProgress';
import { motion, AnimatePresence } from 'motion/react';

interface GoalCardProps {
  key?: any;
  goal: Goal;
  stats?: {
    monthlySavingsVelocity: number;
    estimatedCompletionMonths: number;
    estimatedCompletionDate: string | null;
    onTrack: boolean;
    requiredMonthlyToMeetDeadline: number;
  };
  language: Language;
  onContribute?: (goal: Goal) => void;
  onEdit?: (goal: Goal) => void;
  onDelete?: (id: string) => void;
  modelScenario?: (goalId: string, additional: number) => { estimatedCompletionMonths: number; estimatedCompletionDate: string | null; monthsSaved: number };
}

export function GoalCard({
  goal,
  stats,
  language,
  onContribute,
  onEdit,
  onDelete,
  modelScenario
}: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [extraMonthly, setExtraMonthly] = useState<number>(0);
  const [showSimulator, setShowSimulator] = useState(false);

  // Dynamic Icon
  const IconComponent = (Icons as any)[goal.icon] || Icons.Target;

  const current = goal.current_amount || 0;
  const target = goal.target_amount || 0;
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);

  // Default fallback stats if not supplied
  const finalStats = stats || {
    monthlySavingsVelocity: goal.auto_contribute_amount || 500,
    estimatedCompletionMonths: remaining > 0 ? remaining / (goal.auto_contribute_amount || 500) : 0,
    estimatedCompletionDate: null,
    onTrack: true,
    requiredMonthlyToMeetDeadline: 0
  };

  // Run simulation if modeled
  const modeledOutput = modelScenario && extraMonthly > 0 
    ? modelScenario(goal.id, extraMonthly)
    : {
        estimatedCompletionMonths: finalStats.estimatedCompletionMonths,
        estimatedCompletionDate: finalStats.estimatedCompletionDate,
        monthsSaved: 0
      };

  return (
    <motion.div
      layoutId={`goal-card-${goal.id}`}
      className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 cursor-pointer relative group"
    >
      {/* Background radial soft light */}
      <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full filter blur-3xl opacity-10" style={{ backgroundColor: goal.color }} />

      {/* Header Row */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: goal.color || "#059669" }}
          >
            <IconComponent size={18} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide leading-snug line-clamp-1">
              {goal.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {goal.deadline && (
                <span className="text-[9px] font-black uppercase text-slate-400">
                  Échéance : {formatDate(goal.deadline, language)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu Toggle */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            <Icons.MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-100 rounded-2xl shadow-lg z-30 py-1.5 text-xs font-bold text-slate-600 divide-y divide-slate-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onEdit && onEdit(goal);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
              >
                <Icons.Edit2 size={12} />
                Modifier
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete && onDelete(goal.id);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-1.5 text-rose-600"
              >
                <Icons.Trash size={12} />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats with circular and linear indicators */}
      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <CircularProgress 
          percentage={percentage} 
          size={85} 
          strokeWidth={8} 
          color="text-emerald-500"
          trackColor="text-slate-100"
        />

        {/* Linear breakdown details */}
        <div className="flex-1 space-y-2">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400">Progression</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-slate-800">{formatCurrency(current)}</span>
              <span className="text-[10px] font-bold text-slate-400">sur {formatCurrency(target)}</span>
            </div>
          </div>

          {percentage < 100 && (
            <div className="text-[10px] font-semibold text-slate-500 leading-normal">
              Reste <span className="font-extrabold text-slate-700">{formatCurrency(remaining)}</span> à épargner
            </div>
          )}
        </div>
      </div>

      {/* Track info and estimations */}
      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 space-y-3 text-[10px] font-bold text-slate-500">
        
        {percentage >= 100 ? (
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/70 p-1.5 rounded-xl font-extrabold justify-center">
            <Icons.CheckCircle size={14} />
            <span>Objectif atteint ! Félicitations !</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span>Rythme actuel :</span>
              <span className="font-extrabold text-slate-700">
                {formatCurrency(finalStats.monthlySavingsVelocity)} / mois
              </span>
            </div>

            {finalStats.requiredMonthlyToMeetDeadline > 0 && (
              <div className="flex justify-between items-center">
                <span>Requis pour l'échéance :</span>
                <span className={`font-extrabold ${finalStats.onTrack ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md' : 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md animate-pulse'}`}>
                  {formatCurrency(finalStats.requiredMonthlyToMeetDeadline)} / mois
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span>Date d'achèvement estimée :</span>
              <span className="font-extrabold text-slate-700">
                {finalStats.estimatedCompletionDate 
                  ? formatDate(finalStats.estimatedCompletionDate, language) 
                  : "Pas de rythme d'épargne"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Simulator slider Toggle */}
      {percentage < 100 && modelScenario && (
        <div className="border-t border-slate-50 pt-2 space-y-2">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="text-[10px] font-black uppercase text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Icons.Sparkles size={11} />
            <span>{showSimulator ? "Fermer le Simulateur" : "Simuler un effort d'épargne supplémentaire"}</span>
          </button>

          <AnimatePresence>
            {showSimulator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-2.5 bg-emerald-50/20 p-3 rounded-2xl border border-emerald-100/30"
              >
                <div className="flex justify-between text-[9px] font-black text-emerald-800 uppercase">
                  <span>Effort mensuel en + :</span>
                  <span>+{extraMonthly} DH</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={extraMonthly}
                  onChange={(e) => setExtraMonthly(Number(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />

                {extraMonthly > 0 && (
                  <div className="text-[9.5px] text-emerald-800 font-bold bg-white/60 p-2 rounded-xl flex flex-col gap-0.5">
                    <div className="flex justify-between">
                      <span>Nouveau délai :</span>
                      <span className="font-extrabold text-emerald-900">
                        {modeledOutput.estimatedCompletionDate 
                          ? formatDate(modeledOutput.estimatedCompletionDate, language) 
                          : "Immédiat"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temps gagné :</span>
                      <span className="font-extrabold text-amber-700 flex items-center gap-0.5">
                        <Icons.ArrowUp size={10} />
                        <span>{modeledOutput.monthsSaved} mois plus tôt !</span>
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Buttons */}
      {percentage < 100 && (
        <div className="pt-2 border-t border-slate-50 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContribute && onContribute(goal);
            }}
            className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-100/30"
          >
            <Icons.Plus size={12} />
            Alimenter l'Objectif
          </button>
        </div>
      )}

    </motion.div>
  );
}
