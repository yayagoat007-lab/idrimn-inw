import React from 'react';
import { OptimizationSuggestion } from '../../lib/optimization-suggestions';
import { Lightbulb, ArrowRight, TrendingUp, Check, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface OptimizationSuggestionCardProps {
  suggestion: OptimizationSuggestion;
  onAction?: (actionKey: string, suggestion: OptimizationSuggestion) => void;
  lang: 'fr' | 'darija';
}

export function OptimizationSuggestionCard({ suggestion, onAction, lang }: OptimizationSuggestionCardProps) {
  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  const badgeConfig = {
    goal_accelerator: { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', label: 'Accélérateur d\'Objectif' },
    benchmark_excess: { bg: 'bg-rose-50 text-rose-800 border-rose-200', label: 'Dépassement Baromètre' },
    general: { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Conseil de Sagesse' }
  };

  const badge = badgeConfig[suggestion.type] || badgeConfig.general;

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
      <div className="flex gap-3.5 items-start">
        <div className={`p-2.5 rounded-xl border ${badge.bg.split(' ')[2]} ${badge.bg.split(' ')[0]} shrink-0 mt-0.5`}>
          <Lightbulb className="w-5 h-5 text-slate-800" />
        </div>
        <div className="space-y-1.5 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}>
              {badge.label}
            </span>
            {suggestion.impactMonths && (
              <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {lang === 'darija' ? `Kteb ${suggestion.impactMonths} d l-chhor` : `Gagnez ${suggestion.impactMonths} mois`}
              </span>
            )}
          </div>
          <h4 className="text-sm font-black text-slate-800 tracking-tight">
            {suggestion.title}
          </h4>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {suggestion.description}
          </p>
        </div>
      </div>

      <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 shrink-0 gap-3">
        <div className="text-left md:text-right">
          <span className="text-xs text-slate-400 block font-bold">Économie Potentielle</span>
          <span className="text-lg font-mono font-black text-emerald-600 block">
            +{formatMAD(suggestion.potentialSaving)}<span className="text-xs font-sans font-bold text-slate-400">/mois</span>
          </span>
        </div>

        <button
          onClick={() => onAction?.(suggestion.actionKey, suggestion)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <span>{suggestion.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
