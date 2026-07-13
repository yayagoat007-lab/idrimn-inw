import React, { useState } from 'react';
import { formatCurrency } from '../../lib/utils';
import { Sparkles, Check, Flame } from 'lucide-react';

interface QuickAddExpenseProps {
  bucketId: string;
  bucketName: string;
  onAddExpense: (bucketId: string, amount: number, description: string, merchant: string) => void;
  onCancel?: () => void;
}

const PRESET_AMOUNTS = [10, 20, 50, 100, 200, 500];
const SUGGESTED_DESCRIPTIONS = ["Hanout", "Taxi", "Café", "Skhra", "Marché (Khodra)", "Gazoil"];

export function QuickAddExpense({
  bucketId,
  bucketName,
  onAddExpense,
  onCancel
}: QuickAddExpenseProps) {
  const [amount, setAmount] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('Moul Hanout');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    
    onAddExpense(bucketId, amount, description || "Dépense rapide", merchant || "Hanout");
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      if (onCancel) onCancel();
    }, 1200);
  };

  const selectPreset = (val: number) => {
    setAmount(val);
  };

  const selectDescription = (desc: string) => {
    setDescription(desc);
    if (desc === "Taxi") {
      setMerchant("Taxi Casablanca");
    } else if (desc === "Café") {
      setMerchant("Café du Coin");
    } else if (desc === "Marché (Khodra)") {
      setMerchant("Souq l'Khodra");
    } else {
      setMerchant("Moul Hanout");
    }
  };

  return (
    <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-5 shadow-xs font-sans relative overflow-hidden">
      
      {/* Success feedback screen */}
      {success && (
        <div className="absolute inset-0 bg-emerald-600/95 flex flex-col items-center justify-center text-white z-40 animate-fade-in">
          <div className="p-3 bg-white/20 rounded-full animate-bounce">
            <Check size={32} strokeWidth={3} />
          </div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider mt-3">Enregistré !</h4>
          <p className="text-xs text-white/80 font-bold mt-1">Dépense de {formatCurrency(amount)} ajoutée</p>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full w-fit">
          <Flame size={12} />
          <span>Saisie Express (Cash)</span>
        </div>
        <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mt-1.5">
          Saisie Rapide : {bucketName}
        </h4>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
          Enregistrez une dépense cash en 3 secondes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preset selection */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400">Montant Rapide (DH)</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_AMOUNTS.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => selectPreset(val)}
                className={`py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${amount === val ? 'bg-slate-800 text-white shadow-md scale-105' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700'}`}
              >
                {val} DH
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount input */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Ou Montant Personnalisé (DH)</label>
          <input
            type="number"
            required
            min="1"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Suggested Quick Descriptions */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400">Suggestions Darija / Rapides</span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_DESCRIPTIONS.map(desc => (
              <button
                key={desc}
                type="button"
                onClick={() => selectDescription(desc)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${description === desc ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {desc}
              </button>
            ))}
          </div>
        </div>

        {/* Custom description and merchant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: Skhra khfifa"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Commerçant / Hanout</label>
            <input
              type="text"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="ex: Moul l'Hrayri"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Enregistrer (Cash)</span>
          </button>
        </div>

      </form>

    </div>
  );
}
