import React, { useState, useEffect } from 'react';
import { Bucket } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { AlertCircle, CheckCircle2, Sliders, Sparkles, Wand2 } from 'lucide-react';

interface AllocationRulesEditorProps {
  buckets: Bucket[];
  initialRules: Record<string, number>;
  monthlySalary: number;
  onSave: (rules: Record<string, number>) => void;
  onApplyTemplate: (template: '503020' | '602020') => void;
}

export function AllocationRulesEditor({
  buckets,
  initialRules,
  monthlySalary = 10000,
  onSave,
  onApplyTemplate
}: AllocationRulesEditorProps) {
  const [rules, setRules] = useState<Record<string, number>>({});

  useEffect(() => {
    // Fill in default rules (0% if none specified)
    const initial: Record<string, number> = {};
    buckets.forEach(b => {
      initial[b.id] = initialRules[b.id] || b.auto_allocate_percent || 0;
    });
    setRules(initial);
  }, [initialRules, buckets]);

  const handleSliderChange = (bucketId: string, value: number) => {
    setRules(prev => ({
      ...prev,
      [bucketId]: value
    }));
  };

  const totalPercentage = (Object.values(rules) as number[]).reduce((a, b) => a + b, 0);
  const isValid = totalPercentage === 100;

  const handleSave = () => {
    if (!isValid) {
      alert(`Le total doit être égal à 100%. Actuellement: ${totalPercentage}%`);
      return;
    }
    onSave(rules);
  };

  const autoBalance = () => {
    const diff = 100 - totalPercentage;
    if (diff === 0) return;

    // Distribute difference across buckets that have rules already, or across all
    const activeBucketIds = Object.keys(rules);
    if (activeBucketIds.length === 0) return;

    const share = Math.floor(diff / activeBucketIds.length);
    const remainder = diff % activeBucketIds.length;

    const nextRules = { ...rules };
    activeBucketIds.forEach((id, idx) => {
      nextRules[id] = Math.max(0, nextRules[id] + share + (idx === 0 ? remainder : 0));
    });

    setRules(nextRules);
  };

  return (
    <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-6 shadow-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-50">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders size={16} className="text-emerald-600" />
            <span>Règles de Répartition Automatique</span>
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Répartissez votre salaire mensuel de <span className="font-bold text-slate-600">{formatCurrency(monthlySalary)}</span> dans vos enveloppes
          </p>
        </div>

        {/* Status Indicator */}
        <div className={`px-4 py-2 rounded-2xl border text-xs font-black flex items-center gap-1.5 shrink-0 ${isValid ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100 animate-pulse'}`}>
          {isValid ? (
            <>
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Répartition Validée (100%)</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} className="text-rose-600" />
              <span>Total : {totalPercentage}% (Reste {100 - totalPercentage}%)</span>
            </>
          )}
        </div>
      </div>

      {/* Preset templates */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Modèles de répartition (Templates)</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <button
            onClick={() => onApplyTemplate('503020')}
            className="p-4 border border-slate-100 hover:border-emerald-200 bg-slate-50/40 hover:bg-emerald-50/10 rounded-2xl text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-xs text-slate-800">Modèle 50 / 30 / 20</span>
              <Sparkles size={14} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">
              50% Besoins indispensables (Daroni), 30% Envies/Loisirs, 20% Épargne & Tontine. Idéal pour débuter sainement.
            </p>
          </button>

          <button
            onClick={() => onApplyTemplate('602020')}
            className="p-4 border border-slate-100 hover:border-emerald-200 bg-slate-50/40 hover:bg-emerald-50/10 rounded-2xl text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-xs text-slate-800">Modèle Strict 60 / 20 / 20</span>
              <Sparkles size={14} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">
              60% Besoins indispensables (Daroni), 20% Envies, 20% Épargne. Recommandé en cas de dépenses fixes élevées.
            </p>
          </button>

        </div>
      </div>

      {/* Sliders list */}
      <div className="space-y-4 pt-2">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ajuster vos sanadiq</span>
        <div className="space-y-5">
          {buckets.map(b => {
            const pct = rules[b.id] || 0;
            const dhEquivalent = Math.round((monthlySalary * pct) / 100);

            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: b.color }} />
                    <span className="text-xs font-extrabold text-slate-700">{b.name}</span>
                    {b.is_essential && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-black uppercase rounded-md border border-amber-100">
                        Daroni
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800">{pct}%</span>
                    <span className="text-[10px] font-bold text-slate-400 ml-1.5">({formatCurrency(dhEquivalent)})</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pct}
                    onChange={(e) => handleSliderChange(b.id, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-50">
        <div>
          {!isValid && (
            <button
              onClick={autoBalance}
              className="flex items-center gap-1.5 text-xs font-black text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-2xl transition-colors cursor-pointer"
            >
              <Wand2 size={13} />
              Répartir le reste automatiquement
            </button>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!isValid}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md disabled:cursor-not-allowed cursor-pointer"
        >
          Enregistrer la Répartition
        </button>
      </div>

    </div>
  );
}
