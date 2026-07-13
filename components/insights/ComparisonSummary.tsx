import React from 'react';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus, DollarSign, Wallet, PiggyBank, Award } from 'lucide-react';

interface ComparisonSummaryProps {
  stats: {
    totalIncome: number;
    totalExpense: number;
    totalSavings: number;
    savingsRate: number;
    compareStats: {
      prevIncome: number;
      prevExpense: number;
      prevSavings: number;
      incomeChange: number;
      expenseChange: number;
      savingsChange: number;
      savingsRateChange: number;
    };
  };
  comparePrevious: boolean;
}

export function ComparisonSummary({ stats, comparePrevious }: ComparisonSummaryProps) {
  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  const renderVariation = (percent: number, invertColor: boolean = false) => {
    if (!comparePrevious) return null;
    if (percent === 0) return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
        <Minus className="w-3 h-3" />
        <span>Stable</span>
      </span>
    );

    const isGrowth = percent > 0;
    const isSuccess = invertColor ? !isGrowth : isGrowth;
    const colorClass = isSuccess ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-rose-500 bg-rose-50 border-rose-100';

    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[9px] font-extrabold ${colorClass}`}>
        {isGrowth ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{Math.abs(percent).toFixed(1)}%</span>
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Income Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Revenus cumulés</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-800 font-mono mt-2">
            {formatMAD(stats.totalIncome)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          <span className="text-[9px] text-slate-400 font-bold uppercase">Variation</span>
          {renderVariation(stats.compareStats.incomeChange)}
        </div>
      </div>

      {/* Expenses Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dépenses cumulées (Masrouf)</span>
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-800 font-mono mt-2">
            {formatMAD(stats.totalExpense)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          <span className="text-[9px] text-slate-400 font-bold uppercase">Variation</span>
          {renderVariation(stats.compareStats.expenseChange, true)}
        </div>
      </div>

      {/* Savings Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Épargne dégagée</span>
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-800 font-mono mt-2">
            {formatMAD(stats.totalSavings)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          <span className="text-[9px] text-slate-400 font-bold uppercase">Variation</span>
          {renderVariation(stats.compareStats.savingsChange)}
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Taux d'Épargne moyen</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-800 font-mono mt-2">
            {stats.savingsRate.toFixed(1)}%
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          <span className="text-[9px] text-slate-400 font-bold uppercase">vs objectif (20%)</span>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${stats.savingsRate >= 20 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
            {stats.savingsRate >= 20 ? "Atteint" : "Insuffisant"}
          </span>
        </div>
      </div>
    </div>
  );
}
