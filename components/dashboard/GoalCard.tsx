import React, { useState } from 'react';
import { Goal } from '../../types';
import { formatCurrency } from '../../lib/utils';
import * as Icons from 'lucide-react';
import { Language, t } from '../../lib/i18n';

interface GoalCardProps {
  goal: Goal;
  onContribute: (id: string, amount: number) => void;
  language: Language;
}

export function GoalCard({ goal, onContribute, language }: GoalCardProps) {
  const [amountInput, setAmountInput] = useState<string>('200');
  const [showInput, setShowInput] = useState(false);

  const rawPercent = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const percent = Math.min(100, Math.round(rawPercent));
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  const IconComponent = (Icons as any)[goal.icon] || Icons.PiggyBank;

  const handleQuickSave = () => {
    const value = parseFloat(amountInput);
    if (!isNaN(value) && value > 0) {
      onContribute(goal.id, value);
      setShowInput(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-4 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: goal.color }}
          >
            <IconComponent size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">
              {goal.name}
            </h4>
            {goal.deadline && (
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {t('deadline', language)}: {goal.deadline}
              </p>
            )}
          </div>
        </div>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {percent}%
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-slate-600">
          <span>{formatCurrency(goal.current_amount)} {t('sur', language)} {formatCurrency(goal.target_amount)}</span>
          <span className="text-emerald-600">{formatCurrency(remaining)} {t('remaining', language)}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: goal.color }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-colors border border-slate-100 cursor-pointer"
          >
            {t('quickContribute', language)}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                placeholder={t('amount', language)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                DH
              </span>
            </div>
            <button
              onClick={handleQuickSave}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t('add', language)}
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Icons.X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
