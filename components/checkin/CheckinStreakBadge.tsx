import React from 'react';
import { Flame } from 'lucide-react';

interface CheckinStreakBadgeProps {
  streak: number;
  language: 'fr' | 'darija';
}

export function CheckinStreakBadge({ streak, language }: CheckinStreakBadgeProps) {
  if (streak === 0) return null;

  const text = language === 'fr' ? 'Rituel d\'affilée' : 'Moutsalsal';

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full font-bold text-xs shadow-xs animate-pulse">
      <Flame size={14} className="fill-amber-500 text-amber-500 animate-bounce" />
      <span>{streak} {streak > 1 ? (language === 'fr' ? 'jours' : 'ayam') : (language === 'fr' ? 'jour' : 'nhar')}</span>
      <span className="text-[10px] text-amber-500/80 font-semibold">• {text}</span>
    </div>
  );
}
