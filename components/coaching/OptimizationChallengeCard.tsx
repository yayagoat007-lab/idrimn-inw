import React from 'react';
import { OptimizationChallenge } from '../../lib/optimization-challenges';
import { 
  Target, 
  TrendingDown, 
  Calendar, 
  Award, 
  AlertTriangle, 
  XCircle, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface OptimizationChallengeCardProps {
  challenge: OptimizationChallenge;
  onAbandon: (id: string) => void;
  language: 'fr' | 'darija';
}

export function OptimizationChallengeCard({ 
  challenge, 
  onAbandon, 
  language 
}: OptimizationChallengeCardProps) {
  const isDarija = language === 'darija';
  
  const now = new Date();
  const end = new Date(challenge.endDate);
  const diffTime = end.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate percentage of budget spent
  const spentPercentage = challenge.baselineValue > 0 
    ? Math.round((challenge.currentValue / challenge.targetValue) * 100) 
    : 0;

  const isOverBudget = challenge.currentValue > challenge.targetValue;
  
  // Status color codes
  const barColor = isOverBudget 
    ? 'bg-red-500' 
    : spentPercentage > 80 
      ? 'bg-amber-500' 
      : 'bg-emerald-500';

  const trackText = isOverBudget
    ? (isDarija ? "Foti l-Mizaniya ⚠️" : "Budget Dépassé ⚠️")
    : (isDarija ? "Gadi mzyan 👍" : "En bonne voie 👍");

  const handleAbandonClick = () => {
    if (confirm(isDarija ? "Wash bghiti t-sm7 f had l-tahaddi?" : "Voulez-vous vraiment abandonner ce défi budgétaire ?")) {
      onAbandon(challenge.id);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs hover:shadow-sm transition-all space-y-4">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-100/30">
            <Target className="w-3.5 h-3.5 text-amber-600" />
            <span>{challenge.category}</span>
          </span>
          <h3 className="text-sm font-black text-slate-800 leading-tight">
            {challenge.title}
          </h3>
        </div>
        
        {/* Days left pill */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{daysLeft} {isDarija ? "Yawm b9a" : "jrs restants"}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
        {challenge.description}
      </p>

      {/* Before vs Target vs Current Spend representation */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          
          <div className="bg-slate-50/60 p-2 rounded-xl border border-slate-100/50">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              {isDarija ? "Qbel" : "Avant"}
            </span>
            <span className="text-xs font-black text-slate-700 block mt-0.5 line-through decoration-slate-300">
              {formatCurrency(challenge.baselineValue)}
            </span>
          </div>

          <div className="bg-indigo-50/40 p-2 rounded-xl border border-indigo-100/30">
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">
              {isDarija ? "L-Hadaf" : "Objectif"}
            </span>
            <span className="text-xs font-black text-indigo-700 block mt-0.5">
              {formatCurrency(challenge.targetValue)}
            </span>
          </div>

          <div className={`${isOverBudget ? 'bg-red-50/40 border-red-100/30' : 'bg-emerald-50/40 border-emerald-100/30'} p-2 rounded-xl border`}>
            <span className={`text-[9px] font-bold uppercase tracking-wider block ${isOverBudget ? 'text-red-400' : 'text-emerald-500'}`}>
              {isDarija ? "L-Masrouf" : "Actuel"}
            </span>
            <span className={`text-xs font-black block mt-0.5 ${isOverBudget ? 'text-red-700' : 'text-emerald-700'}`}>
              {formatCurrency(challenge.currentValue)}
            </span>
          </div>

        </div>

        {/* Visual Linear Bar Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold">
            <span className={isOverBudget ? 'text-red-600' : 'text-emerald-600'}>
              {trackText}
            </span>
            <span className="text-slate-400 font-bold">
              {spentPercentage}% d'objectif dépensé
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
              style={{ width: `${Math.min(100, spentPercentage)}%` }}
            />
            {/* Target limit dotted overlay marker */}
            <div className="absolute top-0 bottom-0 left-[100%] border-l-2 border-dashed border-red-400/80" />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
        <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[11px]">
          <Award className="w-4 h-4 text-indigo-500 animate-bounce" />
          <span>+{challenge.xpReward} XP récompense</span>
        </div>

        <button
          onClick={handleAbandonClick}
          className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider bg-red-50/30 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-100/40 cursor-pointer transition-all"
        >
          {isDarija ? "Staslem" : "Abandonner"}
        </button>
      </div>

    </div>
  );
}
