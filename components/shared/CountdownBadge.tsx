import React from 'react';
import { Hourglass } from 'lucide-react';

interface CountdownBadgeProps {
  daysRemaining: number;
}

export function CountdownBadge({ daysRemaining }: CountdownBadgeProps) {
  if (daysRemaining < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
        Passé
      </span>
    );
  }

  if (daysRemaining === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white border border-rose-600 animate-pulse uppercase tracking-wider">
        Aujourd'hui
      </span>
    );
  }

  let colorClasses = "";
  if (daysRemaining <= 7) {
    colorClasses = "bg-rose-50 text-rose-800 border-rose-200 text-rose-700 font-extrabold";
  } else if (daysRemaining <= 30) {
    colorClasses = "bg-amber-50 text-amber-800 border-amber-200 text-amber-700 font-bold";
  } else {
    colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200 text-emerald-700 font-medium";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${colorClasses} shadow-sm`}>
      <Hourglass className="w-3.5 h-3.5" />
      <span>Dans {daysRemaining} jours</span>
    </span>
  );
}
