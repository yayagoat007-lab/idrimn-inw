import React, { useState, useEffect } from 'react';
import { Bucket } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { X, ArrowRight, ArrowRightLeft } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  buckets: Bucket[];
  sourceBucket?: Bucket | null;
  onTransfer: (fromId: string, toId: string, amount: number, note: string) => void;
}

export function TransferModal({
  isOpen,
  onClose,
  buckets,
  sourceBucket,
  onTransfer
}: TransferModalProps) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  useEffect(() => {
    if (sourceBucket) {
      setFromId(sourceBucket.id);
    } else if (buckets.length > 0) {
      setFromId(buckets[0].id);
    }
    
    if (buckets.length > 1) {
      const other = buckets.find(b => b.id !== (sourceBucket?.id || buckets[0].id));
      if (other) setToId(other.id);
    }
  }, [sourceBucket, buckets, isOpen]);

  if (!isOpen) return null;

  const handleFromChange = (id: string) => {
    setFromId(id);
    if (id === toId) {
      const other = buckets.find(b => b.id !== id);
      if (other) setToId(other.id);
    }
  };

  const selectedFromBucket = buckets.find(b => b.id === fromId);
  const selectedToBucket = buckets.find(b => b.id === toId);
  const availableToTransfer = selectedFromBucket 
    ? Math.max(0, selectedFromBucket.allocated_amount - (selectedFromBucket.spent_amount || 0)) 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fromId || !toId) {
      setError("Veuillez sélectionner les deux compartiments.");
      return;
    }
    if (fromId === toId) {
      setError("Les compartiments source et destination doivent être différents.");
      return;
    }
    if (amount <= 0) {
      setError("Le montant du transfert doit être supérieur à 0 DH.");
      return;
    }
    if (amount > availableToTransfer) {
      setError(`Le solde disponible dans ${selectedFromBucket?.name} (${formatCurrency(availableToTransfer)}) est insuffisant.`);
      return;
    }

    onTransfer(fromId, toId, amount, note);
    onClose();
    // Reset
    setAmount(0);
    setNote('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div ref={modalRef} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <ArrowRightLeft size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                Virement entre Sanadiq
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Transférer des allocations d'un sandoq à un autre
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Fermer la fenêtre de transfert"
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] font-bold text-rose-600">
              {error}
            </div>
          )}

          {/* Source Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Depuis le Sandoq (Source)</label>
            <select
              value={fromId}
              onChange={(e) => handleFromChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {buckets.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} (Dispo : {formatCurrency(Math.max(0, b.allocated_amount - b.spent_amount))})
                </option>
              ))}
            </select>
          </div>

          {/* Visual Divider / Arrow */}
          <div className="flex justify-center my-1 text-slate-300">
            <ArrowRight size={18} className="transform rotate-90 sm:rotate-0" />
          </div>

          {/* Destination Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Vers le Sandoq (Destination)</label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {buckets
                .filter(b => b.id !== fromId)
                .map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Solde : {formatCurrency(b.allocated_amount)})
                  </option>
                ))}
            </select>
          </div>

          {/* Amount and Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Montant à Transférer (DH)</label>
              <input
                type="number"
                required
                min="1"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="ex: 300"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Note / Justification (Optionnel)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ex: Ajustement fin de mois"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-5 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Confirmer le Transfert
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
