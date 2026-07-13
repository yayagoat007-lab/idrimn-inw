import React from 'react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, TrendingDown, Landmark, ShieldAlert } from 'lucide-react';

interface NetWorthSummaryCardProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  debtToAssetRatio: number;
}

export function NetWorthSummaryCard({
  totalAssets,
  totalLiabilities,
  netWorth,
  debtToAssetRatio
}: NetWorthSummaryCardProps) {
  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  const ratioPercentage = Math.min(100, Math.max(0, debtToAssetRatio));
  const circleRadius = 36;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (ratioPercentage / 100) * circumference;

  const isPositive = netWorth >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Valeur Nette / Dakira principal card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700 shadow-lg relative overflow-hidden"
      >
        <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
          <Landmark className="w-32 h-32" />
        </div>

        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase font-black tracking-widest">
          Dakira • Patrimoine Net
        </span>

        <div className="mt-4">
          <p className="text-3xl font-black tracking-tight text-white font-mono">
            {formatMAD(netWorth)}
          </p>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Mis à jour aujourd'hui • Zone Maroc
          </p>
        </div>

        <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-emerald-400">
          <TrendingUp className="w-4 h-4" />
          <span>+4.2% vs le mois dernier</span>
        </div>
      </motion.div>

      {/* Assets card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
      >
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Actifs totaux</span>
        <div className="mt-2">
          <span className="text-xl font-black text-emerald-600 font-mono">
            {formatMAD(totalAssets)}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium mt-1">
          Comprend l'immobilier, véhicules et or refuge.
        </p>
        <div className="flex items-center gap-1 mt-3 text-emerald-600 text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+1.5%</span>
        </div>
      </motion.div>

      {/* Liabilities & Ratio card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dettes totales</span>
          <div>
            <span className="text-xl font-black text-rose-500 font-mono">
              {formatMAD(totalLiabilities)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-rose-500 text-xs font-bold mt-2">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-2.1%</span>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={circleRadius}
                className="stroke-slate-100"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={circleRadius}
                className="stroke-rose-500 transition-all duration-500"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <span className="absolute text-[11px] font-black text-slate-800 font-mono">
              {Math.round(ratioPercentage)}%
            </span>
          </div>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
            Dette/Actif
          </span>
        </div>
      </motion.div>
    </div>
  );
}
