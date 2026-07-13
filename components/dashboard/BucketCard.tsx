import React from 'react';
import * as Icons from 'lucide-react';
import { Bucket } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Language, getTranslation } from '../../lib/i18n';

interface BucketCardProps {
  bucket: Bucket;
  language: Language;
  variant?: 'compact' | 'detailed';
  onSelect?: (bucket: Bucket) => void;
}

export function BucketCard({
  bucket,
  language,
  variant = 'compact',
  onSelect
}: BucketCardProps) {
  const IconComponent = (Icons as any)[bucket.icon] || Icons.Layers;
  
  const remaining = bucket.allocated_amount - bucket.spent_amount;
  const rawPercent = bucket.allocated_amount > 0 
    ? (bucket.spent_amount / bucket.allocated_amount) * 100 
    : 0;
  const percent = Math.min(100, Math.round(rawPercent));

  // Alert thresholds
  // 🟢 > 0% : normal
  // 🟡 > 70% : attention
  // 🔴 > 90% : danger (pulse animation)
  // ⚫ > 100% : dépassé (grisé + badge)
  const isOverBudget = bucket.spent_amount > bucket.allocated_amount;
  const isDanger = percent > 90;
  const isWarning = percent > 70 && percent <= 90;

  let ringColor = 'border-slate-100';
  let progressColor = 'bg-emerald-500';
  let alertBadge = null;

  if (isOverBudget) {
    ringColor = 'border-slate-300 bg-slate-50/50';
    progressColor = 'bg-slate-700';
    alertBadge = (
      <span className="px-2 py-0.5 bg-slate-800 text-white rounded-full text-[9px] font-bold uppercase tracking-wider">
        Dépassement
      </span>
    );
  } else if (isDanger) {
    ringColor = 'border-rose-200 animate-pulse bg-rose-50/10';
    progressColor = 'bg-rose-500';
    alertBadge = (
      <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wider">
        Danger
      </span>
    );
  } else if (isWarning) {
    ringColor = 'border-amber-200 bg-amber-50/5';
    progressColor = 'bg-amber-500';
    alertBadge = (
      <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider">
        Attention
      </span>
    );
  } else {
    alertBadge = (
      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-bold uppercase tracking-wider">
        Ok
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        onClick={() => onSelect?.(bucket)}
        className={`bg-white border ${ringColor} p-4.5 rounded-2xl shadow-xs hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: bucket.color }}
            >
              <IconComponent size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 tracking-tight line-clamp-1">
                {bucket.name}
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Sanadouq {bucket.category}
              </p>
            </div>
          </div>
          {alertBadge}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-600">
            <span>{percent}% utilisé</span>
            <span className={isOverBudget ? 'text-rose-600 font-black' : 'text-slate-800'}>
              {formatCurrency(remaining)} restants
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onSelect?.(bucket)}
      className={`bg-white border ${ringColor} p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-all cursor-pointer`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: bucket.color }}
          >
            <IconComponent size={24} />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 tracking-tight">
              {bucket.name}
            </h3>
            <span className="inline-block px-2.5 py-0.5 mt-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-wider">
              {bucket.category}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {alertBadge}
          {bucket.is_essential && (
            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[8px] font-bold uppercase tracking-wider">
              Obligatoire
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 text-center">
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Alloué</p>
          <p className="font-black text-xs text-slate-800">{formatCurrency(bucket.allocated_amount)}</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dépensé</p>
          <p className={`font-black text-xs ${isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
            {formatCurrency(bucket.spent_amount)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Solde</p>
          <p className={`font-black text-xs ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {/* Details progression bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-600">
          <span>{percent}% du budget consommé</span>
          {bucket.auto_allocate_percent > 0 && (
            <span className="text-slate-400 text-[10px]">
              Alloc. auto: {bucket.auto_allocate_percent}%
            </span>
          )}
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
