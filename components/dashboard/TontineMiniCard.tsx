import React from 'react';
import { Landmark, Users, ArrowUpRight, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Language, t } from '../../lib/i18n';

interface TontineMiniCardProps {
  tontineData: {
    tontineName: string;
    amount: number;
    date: string;
    userPosition: number;
    currentRound: number;
    totalRounds: number;
    nextWinnerName: string;
  } | null;
  onPay: () => void;
  language: Language;
}

export function TontineMiniCard({
  tontineData,
  onPay,
  language
}: TontineMiniCardProps) {
  if (!tontineData) {
    return (
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs text-center space-y-2">
        <Users className="text-slate-300 mx-auto" size={24} />
        <h4 className="font-bold text-xs text-slate-800">{t('aucunTontineActive', language)}</h4>
        <p className="text-[10px] text-slate-400">{t('tontineMiniDesc', language)}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-md space-y-4 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:15px_15px]" />
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-500/15 border border-indigo-500/25 rounded-xl flex items-center justify-center text-indigo-300">
            <Landmark size={18} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-white tracking-tight">
              {tontineData.tontineName}
            </h4>
            <span className="inline-block px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md text-[8px] font-black uppercase tracking-wider">
              {t('tontineSolidaire', language)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">{t('tourActuel', language)}</p>
          <p className="font-black text-xs text-white">
            {tontineData.currentRound} / {tontineData.totalRounds}
          </p>
        </div>
      </div>

      <div className="space-y-1 bg-white/5 border border-white/5 rounded-2xl p-3 text-xs font-medium">
        <div className="flex justify-between">
          <span className="text-indigo-200">{t('nextCollect', language)}:</span>
          <span className="font-black text-white">{formatCurrency(tontineData.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-indigo-200">{t('estimatedDate', language)}:</span>
          <span className="font-black text-white">{tontineData.date}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-white/5">
          <span className="text-indigo-200">{t('winnerRound', language)}:</span>
          <span className="font-black text-emerald-400">{tontineData.nextWinnerName}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="text-[10px] text-indigo-200 font-semibold">
          {t('userPosition', language)} : <strong className="text-white">{tontineData.userPosition}ème</strong>
        </div>
        <button
          onClick={onPay}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs cursor-pointer"
        >
          <ArrowUpRight size={13} />
          <span>{t('cotiser', language)}</span>
        </button>
      </div>
    </div>
  );
}
