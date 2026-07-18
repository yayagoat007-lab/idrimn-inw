"use client";

import React, { useState, useEffect } from 'react';
import { useBuckets } from '../../../../hooks/use-buckets';
import { useTransactions } from '../../../../hooks/use-transactions';
import { useAuth } from '../../../../hooks/use-auth';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import { Language, getTranslation } from '../../../../lib/i18n';
import { ArrowLeft, ArrowRightLeft, ArrowRight, Sparkles, AlertCircle, History, Info } from 'lucide-react';

interface BucketsTransferPageProps {
  language?: Language;
  onNavigate?: (screen: string) => void;
}

export default function BucketsTransferPage({
  language = 'fr',
  onNavigate
}: BucketsTransferPageProps) {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const { buckets, transferBetweenBuckets } = useBuckets(userId);
  const { transactions } = useTransactions(userId);

  // Form states
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (buckets.length > 0) {
      setFromId(buckets[0].id);
      if (buckets.length > 1) {
        setToId(buckets[1].id);
      }
    }
  }, [buckets]);

  // Handle source change to prevent identical selections
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

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

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
      setError(`Le solde disponible dans ${selectedFromBucket?.name} est insuffisant.`);
      return;
    }

    await transferBetweenBuckets(fromId, toId, amount, note);
    setSuccess(true);
    setAmount(0);
    setNote('');
    setTimeout(() => setSuccess(false), 3000);
  };

  // Filter transfers logs from historical transactions list
  const transferTransactions = transactions.filter(t => t.type === 'transfer' || t.category === 'transfer');

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate && onNavigate('buckets')}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <span>Transfert entre Sanadiq</span>
          </h2>
          <p className="text-xs text-slate-400 font-semibold">
            Déplacez librement des allocations budgétaires entre vos compartiments selon vos priorités.
          </p>
        </div>
      </div>

      {/* Grid containing Transfer Form and Transfer Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form panel */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl space-y-5 shadow-3xs">
          <div>
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRightLeft size={16} className="text-emerald-600" />
              <span>Saisie de virement</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Virez des fonds disponibles instantanément
            </p>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-xs font-black text-emerald-800 rounded-2xl flex items-center gap-1.5 animate-pulse">
              <Sparkles size={14} className="text-amber-500" />
              <span>Virement de fonds enregistré avec succès !</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-xs font-black text-rose-700 rounded-2xl flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-4">
            
            {/* From Selector */}
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

            {/* Indicator Arrow */}
            <div className="flex justify-center text-slate-300">
              <ArrowRight size={18} className="transform rotate-90 lg:rotate-0" />
            </div>

            {/* To Selector */}
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
                      {b.name} (Allocation : {formatCurrency(b.allocated_amount)})
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
                  placeholder="ex: 200"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Note ou Motif</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ex: Ajustement alimentation"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <button
                type="submit"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRightLeft size={14} />
                <span>Exécuter le virement</span>
              </button>
            </div>

          </form>

        </div>

        {/* History panel */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl space-y-4 shadow-3xs h-[450px] flex flex-col justify-between">
          
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50 shrink-0">
              <div className="p-2 bg-slate-50 text-slate-700 rounded-xl">
                <History size={16} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Journal des virements</h4>
                <p className="text-[10px] text-slate-400 font-bold">Historique complet des ajustements</p>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 pr-1">
              {transferTransactions.length === 0 ? (
                <div className="text-center py-12 space-y-1.5 text-slate-400 font-bold">
                  <Info size={20} className="mx-auto opacity-30" />
                  <p className="text-[10px]">Aucun transfert enregistré</p>
                </div>
              ) : (
                transferTransactions.map(t => (
                  <div key={t.id} className="py-3 flex flex-col gap-1 text-[10px] font-bold text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800 line-clamp-1">{t.description}</span>
                      <span className="text-emerald-700 font-black">+{formatCurrency(t.amount)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                      <span>Dest : {t.merchant}</span>
                      <span>{formatDate(t.transaction_date, language)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
