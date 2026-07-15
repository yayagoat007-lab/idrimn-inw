"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useInsights } from '../../../hooks/use-insights';
import { PeriodSelector } from '../../../components/insights/PeriodSelector';
import { ComparisonSummary } from '../../../components/insights/ComparisonSummary';
import { TrendsChart } from '../../../components/insights/TrendsChart';
import { CategoryPieChart } from '../../../components/insights/CategoryPieChart';
import { AIInsightsDashboard } from '../../../components/insights/AIInsightsDashboard';
import { MoroccanBenchmarks } from '../../../components/insights/MoroccanBenchmarks';
import { ReportsHistory } from '../../../components/insights/ReportsHistory';
import { MoodHistoryChart } from '../../../components/checkin/MoodHistoryChart';
import { 
  BarChart, Sparkles, PieChart, Landmark, FileText, 
  ChevronRight, TrendingUp, HelpCircle 
} from 'lucide-react';
import { Language, getTranslation } from '../../../lib/i18n';

interface InsightsPageProps {
  transactions?: any[];
  buckets?: any[];
  language: Language;
}

export default function InsightsPage({ language }: InsightsPageProps) {
  const { user, profile } = useAuth();
  const userId = user?.id || "mock-user-id-9999";

  // Use insights analytics state
  const {
    period,
    setPeriod,
    comparePrevious,
    setComparePrevious,
    stats,
    exportToCSV,
    exportToExcel
  } = useInsights();

  const { monthlyHistory, spendingByCategory, topExpenses } = stats;

  // Navigation tab states
  const [activeTab, setActiveTab] = useState<'overview' | 'benchmarks' | 'ai'>('overview');

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <PieChart className="text-emerald-600 w-5 h-5" />
            <span>Ihsa'iyat (Statistiques & Rapports)</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">
            Visualisez la structure de vos sandoqs et comparez vos dépenses avec les moyennes nationales marocaines.
          </p>
        </div>
      </div>

      {/* 2. Top configuration widgets */}
      <PeriodSelector
        period={period}
        setPeriod={setPeriod}
        comparePrevious={comparePrevious}
        setComparePrevious={setComparePrevious}
        onExportCSV={exportToCSV}
        onExportExcel={exportToExcel}
      />

      {/* 3. Navigation subtabs */}
      <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-xs font-black tracking-tight whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview' 
              ? 'border-emerald-600 text-emerald-600' 
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <BarChart className="w-4 h-4" />
          <span>Aperçu de la Trésorerie</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`px-4 py-3 text-xs font-black tracking-tight whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'benchmarks' 
              ? 'border-emerald-600 text-emerald-600' 
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Comparatif HCP (Maroc)</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-3 text-xs font-black tracking-tight whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'ai' 
              ? 'border-emerald-600 text-emerald-600' 
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>Assistant IA & Rapports</span>
        </button>
      </div>

      {/* 4. Display active module */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Aggregated KPI Cards */}
          <ComparisonSummary 
            stats={stats} 
            comparePrevious={comparePrevious} 
          />

          {/* Monthly area and line trends chart */}
          <TrendsChart monthlyHistory={monthlyHistory} />

          {/* Category distribution and individual high cost transactions */}
          <CategoryPieChart 
            spendingByCategory={spendingByCategory} 
            topExpenses={topExpenses} 
          />

          {/* Daily financial mood barometer section */}
          <MoodHistoryChart userId={userId} language={language} />
        </div>
      )}

      {activeTab === 'benchmarks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MoroccanBenchmarks lang={language} />
          </div>
          
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase font-black tracking-wider">
                Note Méthodologique
              </span>
              <h4 className="text-sm font-black text-white tracking-tight">Comprendre l'écart HCP</h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Le Haut-Commissariat au Plan publie des enquêtes de consommation basées sur les dépenses d'alimentation, d'habillement, de logement et de transport des ménages marocains.
              </p>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Floussi mappe vos transactions à ces indices officiels pour identifier vos points d'optimisation financière.
              </p>
            </div>

            <div className="flex items-start gap-1.5 bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-slate-300 font-medium leading-relaxed">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <p>
                Un écart de plus de 10% sur l'alimentation ou le transport par rapport aux indicateurs HCP de votre ville signale une dérive évitable de votre masrouf quotidien.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* Executive AI helper diagnostic and health score */}
          <AIInsightsDashboard lang={language} />

          {/* Interactive PDF reports and lists */}
          <ReportsHistory />
        </div>
      )}

    </div>
  );
}
