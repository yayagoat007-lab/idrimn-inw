import React from 'react';
import { getSubscriptionBadgeVisual } from '../../lib/subscription-badge-display';

interface SubscriptionStatusBadgeProps {
  tier: string;
  variant?: 'compact' | 'detailed';
  language?: 'fr' | 'darija';
  className?: string;
}

export function SubscriptionStatusBadge({
  tier = 'free',
  variant = 'compact',
  language = 'fr',
  className = ''
}: SubscriptionStatusBadgeProps) {
  const visual = getSubscriptionBadgeVisual(tier);

  if (variant === 'compact') {
    return (
      <span
        id={`sub-badge-compact-${visual.id}`}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${visual.colorClass} ${visual.borderClass} ${className}`}
      >
        <span className="text-xs">{visual.emoji}</span>
        <span>{language === 'darija' ? visual.nameDarija : visual.nameFr}</span>
      </span>
    );
  }

  // Detailed variant card
  return (
    <div
      id={`sub-badge-detailed-${visual.id}`}
      className={`rounded-2xl p-4 border bg-gradient-to-br ${visual.gradientClass} ${visual.borderClass} flex items-start gap-3.5 shadow-xs max-w-md ${className}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${visual.borderClass} ${visual.colorClass} shrink-0 shadow-sm`}>
        {visual.emoji}
      </div>
      <div className="space-y-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            {language === 'darija' ? visual.nameDarija : visual.nameFr}
          </h4>
          <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black uppercase px-1.5 py-0.5 rounded tracking-widest border border-emerald-200/50">
            {language === 'darija' ? "Kheddam" : "Actif"}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-bold leading-normal">
          {language === 'darija' ? visual.descDarija : visual.descFr}
        </p>
      </div>
    </div>
  );
}

export default SubscriptionStatusBadge;
