import React, { useState } from 'react';
import { Goal } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { X, Coins, Check, ArrowUpRight } from 'lucide-react';
import { GoalContributionLog } from '../../hooks/use-goals';

interface GoalContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  logs: GoalContributionLog[];
  onContribute: (id: string, amount: number, note: string) => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export function GoalContributionModal({
  isOpen,
  onClose,
  goal,
  logs,
  onContribute
}: GoalContributionModalProps) {
  const [amount, setAmount] = useState<number>(100);
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    onContribute(goal.id, amount, note || "Alimentation épargne");
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      // Reset
      setAmount(100);
      setNote('');
    }, 1200);
  };

  const goalLogs = logs.filter(l => l.goal_id === goal.id);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative max-h-[90vh]">
        
        {/* Success Feedback overlay */}
        {success && (
          <div className="absolute inset-0 bg-emerald-600/95 flex flex-col items-center justify-center text-white z-40 animate-fade-in">
            <div className="p-3 bg-white/20 rounded-full animate-bounce">
              <Check size={32} strokeWidth={3} />
            </div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider mt-3">Épargne Enregistrée !</h4>
            <p className="text-xs text-white/80 font-bold mt-1">+{formatCurrency(amount)} ajoutés à {goal.name}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Coins size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                Alimenter : {goal.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Cible restante : {formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Quick amount buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Versement Rapide (DH)</span>
              <div className="grid grid-cols-5 gap-2">
                {QUICK_AMOUNTS.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-3.5 rounded-2xl text-[11px] font-black transition-all cursor-pointer ${amount === val ? 'bg-slate-800 text-white shadow-md scale-105' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700'}`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual input and notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Montant Précis (DH)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="ex: 350"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Note / Commentaire (Optionnel)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ex: Reste de salaire"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer"
              >
                Confirmer l'Épargne
              </button>
            </div>

          </form>

          {/* Historical contributions logs */}
          <div className="space-y-2 pt-4 border-t border-slate-50">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Historique des versements</span>
            {goalLogs.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-bold py-2">Aucun versement n'a encore été enregistré pour cet objectif.</p>
            ) : (
              <div className="divide-y divide-slate-50 max-h-40 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/20 px-3 py-1">
                {goalLogs.map(l => (
                  <div key={l.id} className="py-2.5 flex justify-between items-center text-[10px] font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-amber-50 text-amber-700 rounded-lg">
                        <ArrowUpRight size={11} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800">{l.note}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{formatDate(l.date)}</p>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-extrabold">+{formatCurrency(l.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
