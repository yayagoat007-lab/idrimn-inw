import React from 'react';
import { Sparkles, Lock } from 'lucide-react';

interface BadgeCardProps {
  title: string;
  description: string;
  emoji: string;
  xpValue: number;
  unlockedAt?: string;
  category: string;
}

export function BadgeCard({ title, description, emoji, xpValue, unlockedAt, category }: BadgeCardProps) {
  const isUnlocked = !!unlockedAt;

  return (
    <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between space-y-4 ${
      isUnlocked 
        ? 'border-emerald-500 bg-emerald-50/10 shadow-xs' 
        : 'border-slate-150 bg-slate-50/50'
    }`}>
      {/* Absolute indicator for XP reward */}
      <span className="absolute top-3 right-3 bg-slate-900 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
        <Sparkles size={10} className="text-amber-400" />
        <span>+{xpValue} XP</span>
      </span>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative ${
            isUnlocked ? 'bg-emerald-100/60 border border-emerald-200' : 'bg-slate-200 opacity-50'
          }`}>
            <span>{emoji}</span>
            {!isUnlocked && (
              <div className="absolute inset-0 bg-slate-900/10 rounded-xl flex items-center justify-center">
                <Lock size={12} className="text-slate-600" />
              </div>
            )}
          </div>
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? 'text-slate-800' : 'text-slate-400 font-medium'}`}>
              {title}
            </h4>
            <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              {category}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
          {description}
        </p>
      </div>

      <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
        <span className="text-slate-400">Statut :</span>
        <span className={isUnlocked ? 'text-emerald-600' : 'text-slate-400'}>
          {isUnlocked ? '✓ Débloqué' : '🔒 Verrouillé'}
        </span>
      </div>
    </div>
  );
}
export default BadgeCard;
