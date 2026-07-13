import React from 'react';
import { formatCurrency } from '../../lib/utils';

interface BucketProgressBarProps {
  allocated: number;
  spent: number;
  color?: string;
  className?: string;
}

export function BucketProgressBar({
  allocated,
  spent,
  color = "#10B981",
  className = ""
}: BucketProgressBarProps) {
  const percent = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
  const remaining = Math.max(0, allocated - spent);

  // Status colors based on thresholds
  let barColor = "bg-emerald-500";
  if (percent >= 100) {
    barColor = "bg-slate-500";
  } else if (percent >= 90) {
    barColor = "bg-rose-500 animate-pulse";
  } else if (percent >= 70) {
    barColor = "bg-amber-500";
  }

  return (
    <div className={`space-y-1.5 font-sans ${className}`}>
      <div className="flex justify-between items-baseline text-[10px] font-black uppercase text-slate-400">
        <span>Usage : {percent}%</span>
        <span>Reste : {formatCurrency(remaining)}</span>
      </div>

      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative border border-slate-50">
        {/* Progress Fill */}
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${Math.min(100, percent)}%`, backgroundColor: percent < 70 ? color : undefined }}
        />
        
        {/* Subtle marker at 80% */}
        <div className="absolute top-0 bottom-0 left-[80%] w-[1px] bg-slate-300/60" />
      </div>

      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
        <span>{formatCurrency(spent)} dépensé</span>
        <span>Cible : {formatCurrency(allocated)}</span>
      </div>
    </div>
  );
}
