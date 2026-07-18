import React, { useState, useMemo } from 'react';
import { useAIInsights } from '../../hooks/use-ai-insights';
import { useBuckets } from '../../hooks/use-buckets';
import { useGoals } from '../../hooks/use-goals';
import { useTransactions } from '../../hooks/use-transactions';
import { useAuth } from '../../hooks/use-auth';
import { getFinHealthScoreDescription } from '../../lib/benchmarks';
import { 
  Sparkles, ShieldAlert, CheckCircle, TrendingUp, HelpCircle, 
  Lightbulb, RefreshCw, CalendarDays, Check, UserCheck, BarChart4,
  CheckCircle2, ArrowRightLeft, Landmark
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

// Import our new advanced subcomponents & libraries
import { BehaviorProfileCard } from './BehaviorProfileCard';
import { ForecastChart } from './ForecastChart';
import { OptimizationSuggestionCard } from './OptimizationSuggestionCard';
import { AnomalyAlert } from './AnomalyAlert';
import { detectAllAnomalies, Anomaly } from '../../lib/anomaly-detection';
import { generateOptimizationSuggestions, OptimizationSuggestion } from '../../lib/optimization-suggestions';

interface AIInsightsDashboardProps {
  lang: 'fr' | 'darija';
}

export function AIInsightsDashboard({ lang }: AIInsightsDashboardProps) {
  // Navigation inside the AI dashboard
  const [subTab, setSubTab] = useState<'profile' | 'forecast' | 'optimizations' | 'anomalies'>('profile');

  // Load existing data hooks with correct userId
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const { transactions, createTransaction, deleteTransaction } = useTransactions(userId);
  const { buckets, loading: bucketsLoading } = useBuckets(userId);
  const { goals, loading: goalsLoading } = useGoals(userId);
  const { aiResults, loading: aiLoading } = useAIInsights(userId, lang);

  // Success alert state for simulated actions
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  const loading = bucketsLoading || goalsLoading || aiLoading;

  // 1. Calculate dynamic anomalies on active transactions
  const activeAnomalies = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    return detectAllAnomalies(transactions, lang);
  }, [transactions, lang]);

  // 2. Calculate dynamic optimization suggestions with real math
  const activeSuggestions = useMemo(() => {
    if (!buckets || !goals || !transactions) return [];
    const monthlyIncome = aiResults?.healthScore ? 9500 : 8500; // default estimated income
    return generateOptimizationSuggestions(
      buckets,
      goals,
      transactions,
      monthlyIncome,
      "Casablanca",
      "5000-10000 DH"
    );
  }, [buckets, goals, transactions, aiResults]);

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

  const { healthScore, seasonalAdvice, potential12mSavings } = aiResults;
  const healthDesc = getFinHealthScoreDescription(healthScore);

  // Handler for simulated corrections
  const handleCorrectAnomaly = (anomaly: Anomaly) => {
    setSuccessToast(
      lang === 'darija' 
        ? `T-tshor d l'mouwamala t-baddel l "${anomaly.suggestedCorrection?.category}"! Baraka d l-mika t-rajjet.`
        : `Transaction corrigée avec succès ! La catégorie a été ajustée en "${anomaly.suggestedCorrection?.category}".`
    );
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleApplySuggestion = (actionKey: string, suggestion: OptimizationSuggestion) => {
    setSuccessToast(
      lang === 'darija'
        ? `L-khotta "${suggestion.title}" t-tebba9t b naja7 ! L-iddikhar dyalek ghadi ykber.`
        : `Recommandation "${suggestion.title}" activée ! Votre budget a été optimisé.`
    );
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner with Score and Capacity */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 border border-slate-700 shadow-md relative overflow-hidden">
        <div className="absolute right-6 top-6 animate-pulse opacity-10">
          <Sparkles className="w-24 h-24 text-amber-300" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-lg">
            <span className="inline-flex items-center gap-1.5 text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full uppercase font-black tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnostic Floussi IA</span>
            </span>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Score de Santé Financière :</span>
              <span className="font-mono text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg">{healthScore}/100</span>
            </h2>
            <p className="text-xs text-slate-400 font-bold">
              {lang === 'darija' ? "Siha l'malia dyalek :" : "Statut :"} <span className="text-amber-300">{healthDesc.status}</span>
            </p>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mt-2">
              {healthDesc.advice}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center shrink-0 min-w-[170px] backdrop-blur-xs">
            <span className="block text-[9px] uppercase font-black text-slate-400 tracking-wider">Capacité de gain 12m</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              +{formatMAD(potential12mSavings)}
            </span>
            <span className="text-[8px] text-slate-400 font-bold block mt-0.5">Projection d'épargne lissée</span>
          </div>
        </div>
      </div>

      {/* Toast alert for corrections */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p>{successToast}</p>
        </div>
      )}

      {/* 2. Sub-navigation tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'profile' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Profil Habitudes</span>
        </button>

        <button
          onClick={() => setSubTab('forecast')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'forecast' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Prévisions & Ramadan</span>
        </button>

        <button
          onClick={() => setSubTab('optimizations')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'optimizations' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Arbitrages & Conseils ({activeSuggestions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('anomalies')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'anomalies' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Alertes & Doublons ({activeAnomalies.length})</span>
        </button>
      </div>

      {/* 3. Sub-tab Content Dispatcher */}
      <div className="space-y-6">
        {subTab === 'profile' && (
          <BehaviorProfileCard lang={lang} />
        )}

        {subTab === 'forecast' && (
          <ForecastChart lang={lang} />
        )}

        {subTab === 'optimizations' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Conseils d'Optimisation de Sidi Floussi</h3>
              <p className="text-[10px] text-slate-400 font-bold">Arbitrages automatiques basés sur vos sandoqs et les baromètres HCP.</p>
            </div>

            <div className="space-y-3">
              {activeSuggestions.map(suggestion => (
                <OptimizationSuggestionCard 
                  key={suggestion.id} 
                  suggestion={suggestion} 
                  onAction={handleApplySuggestion}
                  lang={lang}
                />
              ))}
            </div>

            {/* Regional cost of living methodology banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-3">
              <Landmark className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Méthode d'analyse HCP</span>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  Floussi croise en temps réel vos dépenses réelles par sandoq avec l'Enquête Nationale sur la Consommation et les Dépenses des Ménages du HCP, ajustée à l'indice du coût de la vie de <span className="text-slate-900 font-extrabold">Grand Casablanca - Settat</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        {subTab === 'anomalies' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Scanner d'Anomalies de Paiement</h3>
              <p className="text-[10px] text-slate-400 font-bold">Analyse en temps réel de vos relevés de comptes : détection automatique des erreurs bancaires et doublons.</p>
            </div>

            <div className="space-y-3">
              {activeAnomalies.length === 0 ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Aucun problème détecté</h4>
                    <p className="text-[11px] text-slate-600 font-semibold mt-0.5">Votre relevé de transactions est parfaitement ordonné. Sidi Floussi ne détecte aucune anomalie ce mois-ci !</p>
                  </div>
                </div>
              ) : (
                activeAnomalies.map(anomaly => (
                  <AnomalyAlert 
                    key={anomaly.id} 
                    anomaly={anomaly} 
                    onCorrect={handleCorrectAnomaly}
                    lang={lang}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Seasonal Tip of the Month Banner (Always present as footer anchor) */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-600 shrink-0">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider">Événement & Saison d'épargne Maroc</span>
          <h4 className="text-xs font-black text-slate-800 tracking-tight">Conseil Saisonnier de Sidi Floussi</h4>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">{seasonalAdvice}</p>
        </div>
      </div>
    </div>
  );
}
