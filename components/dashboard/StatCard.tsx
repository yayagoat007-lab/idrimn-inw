import React from 'react';
import * as Icons from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  variation?: {
    amount: string | number;
    percent: number;
    isPositive: boolean;
  };
  icon: string;
  color: 'emerald' | 'rose' | 'amber' | 'blue' | 'slate' | 'indigo';
  variant?: 'grand' | 'moyen' | 'petit';
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  variation,
  icon,
  color,
  variant = 'moyen',
  subtitle
}: StatCardProps) {
  const IconComponent = (Icons as any)[icon] || Icons.TrendingUp;

  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      badge: 'bg-rose-50 text-rose-800 border-rose-200'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      badge: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      badge: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    slate: {
      bg: 'bg-slate-50 text-slate-600',
      border: 'border-slate-100',
      badge: 'bg-slate-50 text-slate-800 border-slate-200'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
      badge: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    }
  };

  const scheme = colorMap[color] || colorMap.slate;

  if (variant === 'grand') {
    return (
      <div className={`bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4 relative overflow-hidden`}>
        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50/40 rounded-bl-full -z-10" />
        
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
              {title}
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {value}
            </h2>
          </div>
          <div className={`p-3.5 rounded-2xl ${scheme.bg} shadow-xs`}>
            <IconComponent size={24} />
          </div>
        </div>

        {variation && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-50 text-xs font-bold">
            <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full border ${variation.isPositive ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
              {variation.isPositive ? <Icons.ArrowUpRight size={13} /> : <Icons.ArrowDownRight size={13} />}
              {variation.percent}%
            </span>
            <span className="text-slate-400 font-semibold">
              {variation.isPositive ? 'Augmentation' : 'Baisse'} de {variation.amount} vs mois dernier
            </span>
          </div>
        )}

        {subtitle && (
          <p className="text-[11px] text-slate-400 font-semibold">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'petit') {
    return (
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${scheme.bg}`}>
          <IconComponent size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{title}</p>
          <p className="font-extrabold text-sm text-slate-900 truncate">{value}</p>
        </div>
      </div>
    );
  }

  // Moyen
  return (
    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${scheme.bg}`}>
          <IconComponent size={16} />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-[10px] text-slate-400 font-bold tracking-tight">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
