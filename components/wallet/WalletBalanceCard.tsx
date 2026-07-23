import React from 'react';
import { WalletBalance } from '../../types';
import { Plus, Send, FileText, Smartphone, ShieldCheck, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { Language } from '../../lib/i18n';

interface WalletBalanceCardProps {
  balance: WalletBalance | null;
  dailySpent: number;
  language: Language;
  onAddFunds: () => void;
  onSendP2P: () => void;
  onPayBill: () => void;
  onRecharge: () => void;
  onToggleKyc: () => void;
}

export function WalletBalanceCard({
  balance,
  dailySpent,
  language,
  onAddFunds,
  onSendP2P,
  onPayBill,
  onRecharge,
  onToggleKyc
}: WalletBalanceCardProps) {
  const isDarija = language === 'darija';
  
  if (!balance) return null;

  const limitLeft = Math.max(0, balance.dailyLimit - dailySpent);

  const t = {
    balanceLabel: isDarija ? 'Rassid d l-Wallet (Solde)' : 'Solde du Portefeuille',
    dailySpentLabel: isDarija ? 'Masrouf l-yowm :' : 'Dépenses du jour :',
    limitLeftLabel: isDarija ? 'L-baqi d l-plafond :' : 'Plafond restant :',
    kycVerified: isDarija ? 'Mtheqqeq (KYC OK)' : 'Identité Vérifiée (KYC)',
    kycUnverified: isDarija ? 'Ghir mtheqqeq (Plafond 500 DH)' : 'Compte Basique (Plafond 500 DH)',
    kycAction: isDarija ? 'Theqqeq dghya' : 'Vérifier mon identité (+)',
    addFunds: isDarija ? 'Alimenter' : 'Alimenter',
    sendP2P: isDarija ? 'Envoyer' : 'Transférer',
    payBill: isDarija ? 'Payer Facture' : 'Facture',
    recharge: isDarija ? 'Recharger' : 'Recharge',
    sandbox: isDarija ? 'Portefeuille de Simulation Floussi' : 'Portefeuille de Simulation Floussi'
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden font-sans">
      
      {/* Decorative ambient background circle */}
      <div className="absolute -right-20 -top-20 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top row: Brand & KYC Status */}
      <div className="flex justify-between items-center relative z-10">
        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-1">
          <Sparkles size={11} className="text-emerald-400 animate-pulse" />
          <span>{t.sandbox}</span>
        </span>

        {balance.kycVerified ? (
          <button 
            type="button"
            onClick={onToggleKyc}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 cursor-pointer hover:bg-emerald-900/20 transition-all text-left"
          >
            <ShieldCheck size={12} className="text-emerald-400 animate-bounce" />
            <span>{t.kycVerified}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleKyc}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/40 border border-amber-500/30 rounded-full text-[10px] font-black text-amber-400 cursor-pointer hover:bg-amber-900/20 transition-all text-left"
          >
            <ShieldAlert size={12} className="text-amber-400 animate-pulse" />
            <span>{t.kycAction}</span>
          </button>
        )}
      </div>

      {/* Middle row: Big Wallet Balance display */}
      <div className="my-6 relative z-10">
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{t.balanceLabel}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black tracking-tight text-white font-sans">
            {balance.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-base font-black text-emerald-400 font-sans">{balance.currency}</span>
        </div>
      </div>

      {/* Limits & daily tracking block */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 relative z-10 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">{t.dailySpentLabel}</span>
          <span className="text-slate-200 font-extrabold font-mono mt-0.5 block">{dailySpent.toFixed(2)} DH</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">{t.limitLeftLabel}</span>
          <span className={`font-mono font-black mt-0.5 block ${limitLeft < 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {limitLeft.toFixed(2)} / {balance.dailyLimit} DH
          </span>
        </div>
      </div>

      {/* Bottom row: Premium Action Buttons */}
      <div className="grid grid-cols-4 gap-2 mt-6 relative z-10 pt-2">
        {/* ACTION 1: ADD FUNDS */}
        <button
          onClick={onAddFunds}
          className="flex flex-col items-center gap-2 group cursor-pointer text-center"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-950 transition-all active:scale-95 group-hover:-translate-y-0.5">
            <Plus size={18} />
          </div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
            {t.addFunds}
          </span>
        </button>

        {/* ACTION 2: TRANSFER */}
        <button
          onClick={onSendP2P}
          className="flex flex-col items-center gap-2 group cursor-pointer text-center"
        >
          <div className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-sm transition-all active:scale-95 group-hover:-translate-y-0.5">
            <Send size={16} />
          </div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
            {t.sendP2P}
          </span>
        </button>

        {/* ACTION 3: BILL PAYMENT */}
        <button
          onClick={onPayBill}
          className="flex flex-col items-center gap-2 group cursor-pointer text-center"
        >
          <div className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-sm transition-all active:scale-95 group-hover:-translate-y-0.5">
            <FileText size={16} />
          </div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
            {t.payBill}
          </span>
        </button>

        {/* ACTION 4: RECHARGE */}
        <button
          onClick={onRecharge}
          className="flex flex-col items-center gap-2 group cursor-pointer text-center"
        >
          <div className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-sm transition-all active:scale-95 group-hover:-translate-y-0.5">
            <Smartphone size={16} />
          </div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
            {t.recharge}
          </span>
        </button>
      </div>

    </div>
  );
}
