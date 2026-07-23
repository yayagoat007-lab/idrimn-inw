import React, { useState } from 'react';
import { MoroccanEvent } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useTranslation } from '../../hooks/use-translation';
import { PiggyBank, Check, X, ShieldAlert } from 'lucide-react';

interface BudgetContributeDialogProps {
  event: MoroccanEvent;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
  language?: 'fr' | 'darija';
}

export function BudgetContributeDialog({ event, onConfirm, onCancel, language: propLanguage }: BudgetContributeDialogProps) {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState('');

  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError(language === 'darija' ? "3afak dkhil mablagh kbegh mn 0 DH." : "Veuillez saisir un montant supérieur à 0 DH.");
      return;
    }

    const remaining = event.budget_allocated - event.budget_spent;
    if (val > remaining && remaining > 0) {
      // Allow overspending but warn or cap
    }

    onConfirm(val);
  };

  const remaining = Math.max(0, event.budget_allocated - event.budget_spent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 overflow-hidden space-y-4"
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <span>{language === 'darija' ? "Zid l-flouss f s-sandoq" : "Alimenter la cagnotte"}</span>
          </h3>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600 font-semibold space-y-1">
          <p>{language === 'darija' ? "L-Monasaba : " : "Événement cible : "}<span className="text-slate-800 font-bold">{event.name}</span></p>
          <p>{language === 'darija' ? "L-Mizaniya kamla : " : "Budget total : "}<span className="font-mono text-slate-800">{formatMAD(event.budget_allocated)}</span></p>
          <p>{language === 'darija' ? "Lli tsref : " : "Déjà dépensé : "}<span className="font-mono text-rose-500">{formatMAD(event.budget_spent)}</span></p>
          <p>{language === 'darija' ? "L-Khir lli ba9i khass : " : "Épargne restante nécessaire : "}<span className="font-mono text-emerald-600">{formatMAD(remaining)}</span></p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'darija' ? "Mablagh l-mousahama (DH)" : "Montant de la contribution (DH)"}
          </label>
          <input
            type="number"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 500"
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none font-mono font-bold"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
          >
            {language === 'darija' ? "Yelghi" : "Annuler"}
          </button>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-5 text-xs font-black tracking-wide shadow-md shadow-emerald-500/10 flex items-center gap-1 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{language === 'darija' ? "Sajel l-mousahama" : "Enregistrer la contribution"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
