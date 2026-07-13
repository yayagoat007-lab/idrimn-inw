import React from 'react';
import { useAIInsights } from '../../hooks/use-ai-insights';
import { getFinHealthScoreDescription } from '../../lib/benchmarks';
import { 
  Sparkles, ShieldAlert, CheckCircle, TrendingUp, HelpCircle, 
  Lightbulb, RefreshCw, CalendarDays, Check 
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AIInsightsDashboardProps {
  lang: 'fr' | 'darija';
}

export function AIInsightsDashboard({ lang }: AIInsightsDashboardProps) {
  const { aiResults, loading } = useAIInsights("mock-user-id-9999", lang);

  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  if (loading || !aiResults) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center py-16">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-xs font-extrabold text-slate-500">
          L'intelligence artificielle Floussi étudie vos habitudes d'épargne...
        </p>
      </div>
    );
  }

  const { healthScore, anomalies, suggestions, seasonalAdvice, potential12mSavings } = aiResults;
  const healthDesc = getFinHealthScoreDescription(healthScore);

  return (
    <div className="space-y-6">
      {/* 1. Score de Santé Financière / Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700 shadow-lg relative overflow-hidden">
        <div className="absolute right-6 top-6 animate-pulse opacity-20">
          <Sparkles className="w-24 h-24 text-amber-300" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full uppercase font-black tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnostic Floussi IA</span>
            </span>
            <h2 className="text-lg font-black tracking-tight text-white">
              Score de Santé Financière : <span className="font-mono">{healthScore}/100</span>
            </h2>
            <p className="text-xs text-slate-400 font-bold">
              {lang === 'darija' ? "Siha l'malia dyalek :" : "Statut :"} <span className="text-amber-300">{healthDesc.status}</span>
            </p>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mt-2">
              {healthDesc.advice}
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center shrink-0 min-w-[160px]">
            <span className="block text-[9px] uppercase font-bold text-slate-400">Capacité de gain 12m</span>
            <span className="text-lg font-black text-emerald-400 font-mono mt-1 block">
              +{formatMAD(potential12mSavings)}
            </span>
            <span className="text-[8px] text-slate-400 font-medium">Projection épargne cumulée</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 2. Anomalies et Alerte Detection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Anomalies détectées</h3>
              <p className="text-[9px] text-slate-400 font-semibold">Alertes et dépassements sur vos enveloppes de cash (Masrouf).</p>
            </div>
          </div>

          <div className="space-y-3">
            {anomalies.length === 0 ? (
              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>Aucune anomalie critique détectée. Vos enveloppes de dépenses sont respectées à la lettre ! Excellent travail d'arbitrage.</p>
              </div>
            ) : (
              anomalies.map((anom, idx) => (
                <div key={idx} className="flex gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 hover:bg-slate-100/50 transition-all">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-amber-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">{anom}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Suggestions intelligentes d'ajustements */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Conseils & Recommandations</h3>
              <p className="text-[9px] text-slate-400 font-semibold">Pistes concrètes pour atteindre vos objectifs d'épargne (Ahdaf).</p>
            </div>
          </div>

          <div className="space-y-3">
            {suggestions.map(sug => (
              <div key={sug.id} className="flex gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 hover:bg-slate-100/50 transition-all items-start justify-between">
                <div className="flex gap-2.5">
                  <span className="text-xs mt-0.5">💡</span>
                  <div>
                    <span className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Conseil Floussi
                    </span>
                    <h4 className="text-xs font-black text-slate-800 mt-1">{sug.title}</h4>
                    <p className="text-[11px] text-slate-600 font-semibold leading-relaxed mt-1">{sug.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-black text-emerald-600 font-mono">
                    +{formatMAD(sug.potentialSaving)}
                  </span>
                  <span className="block text-[8px] text-slate-400">estimé</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Seasonal Tip Card of the Month */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-600 shrink-0">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider">Événement & Saison d'épargne Maroc</span>
          <h4 className="text-xs font-black text-slate-800 tracking-tight">Conseil Saisonnier</h4>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">{seasonalAdvice}</p>
        </div>
      </div>
    </div>
  );
}
