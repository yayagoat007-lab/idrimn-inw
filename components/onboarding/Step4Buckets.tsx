import React, { useState, useEffect } from 'react';
import { Home, Wallet, PiggyBank, Heart, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Language } from '../../lib/i18n';
import { BucketPreview } from './BucketPreview';

interface Step4BucketsProps {
  incomeAmount: number;
  language: Language;
  onPrev: () => void;
  onFinish: (bucketAllocations: any) => void;
  submitting: boolean;
}

export function Step4Buckets({
  incomeAmount,
  language,
  onPrev,
  onFinish,
  submitting
}: Step4BucketsProps) {
  // Pre-filled bucket percentages based on standard 50/30/10/10 layout
  const [fixedPct, setFixedPct] = useState(40); // Rent, bills (Dar)
  const [cashPct, setCashPct] = useState(30);  // Souq, hanout (Cash Dialna)
  const [savingsPct, setSavingsPct] = useState(20); // Investment, emergency (Tofir)
  const [charityPct, setCharityPct] = useState(10); // Help, Aid (Sadaqah)

  const totalPct = fixedPct + cashPct + savingsPct + charityPct;
  const isSumValid = totalPct === 100;

  const buckets = [
    {
      id: 'fixed',
      name: language === 'darija' ? 'الدار و الصائر الثابت' : 'Daba Dar (Fixe)',
      percentage: fixedPct,
      amount: Math.round((incomeAmount * fixedPct) / 100),
      color: 'bg-emerald-600',
      icon: Home
    },
    {
      id: 'cash',
      name: language === 'darija' ? 'الكاش و المارشي' : 'Cash Dialna (Souq)',
      percentage: cashPct,
      amount: Math.round((incomeAmount * cashPct) / 100),
      color: 'bg-blue-600',
      icon: Wallet
    },
    {
      id: 'savings',
      name: language === 'darija' ? 'التوفير و الحصالة' : 'Tofir (Épargne)',
      percentage: savingsPct,
      amount: Math.round((incomeAmount * savingsPct) / 100),
      color: 'bg-amber-500',
      icon: PiggyBank
    },
    {
      id: 'charity',
      name: language === 'darija' ? 'المساعدة و الصدقة' : 'Sadaqah (Charité)',
      percentage: charityPct,
      amount: Math.round((incomeAmount * charityPct) / 100),
      color: 'bg-rose-500',
      icon: Heart
    }
  ];

  const handleResetToStandard = () => {
    setFixedPct(40);
    setCashPct(30);
    setSavingsPct(20);
    setCharityPct(10);
  };

  const handleFinish = () => {
    if (!isSumValid) return;
    onFinish(buckets);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">
          {language === 'darija' ? 'توزيع الظروفة' : 'Vos enveloppes budgétaires'}
        </h3>
        <p className="text-xs font-semibold text-slate-400">
          Ajustez la répartition mensuelle. La somme doit être égale à 100%.
        </p>
      </div>

      {/* Sum validation alert */}
      <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-bold transition-all ${
        isSumValid 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
          : 'bg-rose-50 border-rose-100 text-rose-800 animate-pulse'
      }`}>
        <AlertCircle size={16} className={isSumValid ? 'text-emerald-600 flex-shrink-0' : 'text-rose-600 flex-shrink-0'} />
        <div className="flex-1">
          {isSumValid ? (
            <span>Parfait ! Votre répartition est équilibrée (100%).</span>
          ) : (
            <div className="space-y-0.5">
              <span>Le total actuel est de {totalPct}%. Il doit faire exactement 100%.</span>
              <p className="text-[10px] font-medium text-rose-700">
                Ajustez les curseurs ou cliquez sur{' '}
                <button type="button" onClick={handleResetToStandard} className="underline font-bold text-rose-800">
                  Réinitialiser (40/30/20/10)
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sliders container */}
      <div className="space-y-4 bg-white p-3.5 border border-slate-100 rounded-2xl">
        {/* Fixed Pct Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5"><Home size={14} className="text-emerald-600" /> Daba Dar (Loyer, Factures)</span>
            <span className="text-emerald-700">{fixedPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={fixedPct}
            onChange={(e) => setFixedPct(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Cash Pct Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5"><Wallet size={14} className="text-blue-600" /> Cash Dialna (Swin, Café, Hanout)</span>
            <span className="text-blue-700">{cashPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={cashPct}
            onChange={(e) => setCashPct(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Savings Pct Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5"><PiggyBank size={14} className="text-amber-500" /> Tofir (Épargne, Projets)</span>
            <span className="text-amber-700">{savingsPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={savingsPct}
            onChange={(e) => setSavingsPct(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Charity Pct Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5"><Heart size={14} className="text-rose-500" /> Sadaqah (Entraide, Aid)</span>
            <span className="text-rose-700">{charityPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={charityPct}
            onChange={(e) => setCharityPct(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>
      </div>

      {/* Visual Preview */}
      <BucketPreview buckets={buckets} incomeAmount={incomeAmount} />

      <div className="flex gap-3 pt-2">
        <button
          onClick={onPrev}
          disabled={submitting}
          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          <span>Retour</span>
        </button>
        <button
          onClick={handleFinish}
          disabled={!isSumValid || submitting}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:pointer-events-none"
        >
          {submitting ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Création...</span>
            </>
          ) : (
            <span>Terminer</span>
          )}
        </button>
      </div>
    </div>
  );
}
export default Step4Buckets;
