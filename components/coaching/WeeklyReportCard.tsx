import React from 'react';
import { WeeklyReport } from '../../lib/weekly-coaching-report';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Award, 
  FileText,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { generateClientPDF, ReportConfig } from '../../lib/pdf-generator';
import { useAuth } from '../../hooks/use-auth';
import { useTransactions } from '../../hooks/use-transactions';
import { useBuckets } from '../../hooks/use-buckets';
import { useGoals } from '../../hooks/use-goals';

interface WeeklyReportCardProps {
  report: WeeklyReport;
  language: 'fr' | 'darija';
}

export function WeeklyReportCard({ report, language }: WeeklyReportCardProps) {
  const isDarija = language === 'darija';
  const { profile } = useAuth();
  
  // Dependencies for PDF Generation
  const { transactions } = useTransactions(profile?.id || 'mock-user-id-9999');
  const { buckets } = useBuckets(profile?.id || 'mock-user-id-9999');
  const { goals } = useGoals(profile?.id || 'mock-user-id-9999');

  const handleExportPDF = () => {
    if (!profile) return;
    
    // Filter transactions to match this specific week to make the PDF content highly accurate!
    const weekStart = new Date(report.weekStartDate);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    
    const weekTxs = transactions.filter(t => {
      const d = new Date(t.transaction_date);
      return d >= weekStart && d <= weekEnd;
    });

    const config: ReportConfig = {
      type: 'custom',
      periodName: report.period,
      sections: ['overview', 'buckets', 'transactions'],
      healthScore: report.summary.totalSpent > 0 ? Math.max(10, Math.min(100, Math.round((report.summary.totalSaved / (report.summary.totalSaved + report.summary.totalSpent)) * 100))) : 90,
      benchmarksDiff: report.summary.comparedToLastWeek,
      anomaliesCount: report.oneWatchout ? 1 : 0
    };

    generateClientPDF(profile, weekTxs, buckets, goals, config);
  };

  const spentDiff = report.summary.comparedToLastWeek;
  const isSpentDown = spentDiff < 0;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6" id={`weekly-report-card-${report.id}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 tracking-tight">
              {isDarija ? "Rapport Hebdomadaire dyal Coaching" : "Votre Rapport Coaching Hebdomadaire"}
            </h2>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-bold mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{report.period}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportPDF}
          className="self-start sm:self-center bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 border border-slate-100 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>{isDarija ? "Khrej PDF" : "Exporter en PDF"}</span>
        </button>
      </div>

      {/* Top Insight */}
      <div className="bg-amber-50/40 border border-amber-100/50 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-black text-amber-800 tracking-wide uppercase">
            {isDarija ? "L-Insight l-Kbir dyal l-Osimana" : "Le Fait Marquant de la Semaine"}
          </h4>
          <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
            {report.topInsight}
          </p>
        </div>
      </div>

      {/* Financial Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Spent */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-bold">
            {isDarija ? "Ch7al khrejti" : "Total Dépensé"}
          </div>
          <div className="text-xl font-black text-slate-800 tracking-tight mt-1">
            {formatCurrency(report.summary.totalSpent)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {spentDiff !== 0 ? (
              <>
                <div className={`p-0.5 rounded-md ${isSpentDown ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {isSpentDown ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-[11px] font-bold ${isSpentDown ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isSpentDown 
                    ? (isDarija ? `-${Math.abs(spentDiff)}% 3la l'osimana l-fatet` : `-${Math.abs(spentDiff)}% vs semaine dernière`)
                    : (isDarija ? `+${spentDiff}% 3la l'osimana l-fatet` : `+${spentDiff}% vs semaine dernière`)}
                </span>
              </>
            ) : (
              <span className="text-[11px] font-bold text-slate-400">
                {isDarija ? "Bhal l'osimana l-fatet" : "Identique à la semaine dernière"}
              </span>
            )}
          </div>
        </div>

        {/* Total Saved */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-bold">
            {isDarija ? "Ch7al wfferti" : "Total Épargné"}
          </div>
          <div className="text-xl font-black text-emerald-600 tracking-tight mt-1">
            {formatCurrency(report.summary.totalSaved)}
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-2.5">
            {isDarija ? "Épargne estimée ou réelle" : "Épargne estimée sur vos revenus"}
          </p>
        </div>

        {/* Floussi Score Impact */}
        <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-4">
          <div className="text-xs text-emerald-800 font-black tracking-wide uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isDarija ? "Tatir 3la s-Skour" : "Impact Score Floussi"}</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 mt-2 leading-relaxed">
            {report.scoreImpact}
          </p>
        </div>
      </div>

      {/* Wins and Watchout Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3 Wins Card */}
        <div className="border border-slate-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase">
              {isDarija ? "3 d l-Intissarat dyalek" : "Vos 3 Victoires Financières"}
            </h3>
          </div>

          <div className="space-y-3.5">
            {report.threeWins.map((win, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-600 font-medium leading-relaxed">{win}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 1 Watchout & Week Ahead Tip */}
        <div className="space-y-4">
          {/* Watchout */}
          <div className="bg-amber-50/20 border border-amber-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <h3 className="text-xs font-black tracking-wide uppercase">
                {isDarija ? "Noqta d l-Yaqada dyal l'Osimana" : "Point de Vigilance Unique"}
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-2.5 leading-relaxed">
              {report.oneWatchout}
            </p>
          </div>

          {/* Week Ahead Tip */}
          <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-indigo-700">
              <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0" />
              <h3 className="text-xs font-black tracking-wide uppercase">
                {isDarija ? "Nasiha d l'Osimana l-Majya" : "Conseil pour la Semaine Prochaine"}
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-2.5 leading-relaxed">
              {report.weekAheadTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
