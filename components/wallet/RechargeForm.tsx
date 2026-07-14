import React, { useState } from 'react';
import { useMobileRecharge } from '../../hooks/use-mobile-recharge';
import { useWallet } from '../../hooks/use-wallet';
import { MobileOperator } from '../../types';
import { CheckCircle2, Smartphone, Sparkles } from 'lucide-react';

interface RechargeFormProps {
  lang: 'fr' | 'darija';
  onSuccess?: () => void;
}

export function RechargeForm({ lang, onSuccess }: RechargeFormProps) {
  const { balance } = useWallet();
  const { rechargeMobile } = useMobileRecharge();

  const [operator, setOperator] = useState<MobileOperator>('IAM');
  const [phone, setPhone] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number>(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  const operators: { value: MobileOperator; label: string; color: string; desc: string }[] = [
    { value: 'IAM', label: 'Maroc Telecom', color: 'border-blue-200 text-blue-700 bg-blue-50/20', desc: 'Jawal' },
    { value: 'Orange', label: 'Orange', color: 'border-orange-200 text-orange-600 bg-orange-50/10', desc: 'Recharge Orange' },
    { value: 'INWI', label: 'Inwi', color: 'border-purple-200 text-purple-700 bg-purple-50/20', desc: 'Tic Tac' }
  ];

  const quickAmounts = [10, 20, 50, 100, 200];

  const t = {
    phoneLabel: lang === 'darija' ? 'Raqm d l-hatif :' : 'Numéro de téléphone marocain :',
    phonePlaceholder: 'Ex: 0612345678',
    opLabel: lang === 'darija' ? 'Khtar l-khit :' : 'Opérateur réseau :',
    amountLabel: lang === 'darija' ? 'Khtar l-qadr (DH) :' : 'Montant de recharge :',
    submitBtn: lang === 'darija' ? 'Recharger dghya (Simulation)' : 'Recharger immédiatement (Simulation)',
    successMsg: lang === 'darija' ? 'Recharge t-khelesset b l-khir!' : 'Recharge mobile effectuée !',
    simNote: lang === 'darija' ? 'Hada ghir tajriba, l-flous real ma ghay-mchiwch.' : 'Simulation locale - aucun débit bancaire réel.',
    insufficient: lang === 'darija' ? 'Ma3ndekch flous kafi f l-wallet' : 'Solde de portefeuille virtuel insuffisant.'
  };

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!phone || phone.length < 9) {
      setError(lang === 'darija' ? 'Raqm l-hatif ghalat.' : 'Veuillez saisir un numéro de téléphone marocain valide.');
      return;
    }

    if (balance && balance.balance < selectedAmount) {
      setError(t.insufficient);
      return;
    }

    setLoading(true);
    try {
      const res = await rechargeMobile(operator, phone, selectedAmount);
      setSuccess(res);
      setPhone('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-3xl p-5 text-center space-y-4 animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="text-emerald-600" size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{t.successMsg}</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles size={11} className="text-amber-500" />
            <span>Recharge {success.operator}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">Opérateur</span>
            <span className="text-slate-800 font-black">{success.operator}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">Destinataire</span>
            <span className="text-slate-800 font-mono font-bold">{success.phoneNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">Montant</span>
            <span className="text-emerald-700 font-black font-mono">-{success.amount.toFixed(2)} DH</span>
          </div>
        </div>

        <button
          onClick={() => setSuccess(null)}
          className="w-full py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer"
        >
          Faire une autre recharge
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRecharge} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-600 font-black animate-bounce">
          ⚠️ {error}
        </div>
      )}

      {/* Operator Brand selection */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
          {t.opLabel}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {operators.map((op) => (
            <button
              key={op.value}
              type="button"
              onClick={() => setOperator(op.value)}
              className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                operator === op.value
                  ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500'
                  : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-black text-slate-800 block">{op.label}</span>
              <span className="text-[8px] font-bold text-slate-400 mt-1 block uppercase tracking-widest">{op.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Phone Number Input */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
          {t.phoneLabel}
        </label>
        <div className="relative">
          <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="tel"
            placeholder={t.phonePlaceholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Quick Amount Chips */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
          {t.amountLabel}
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setSelectedAmount(amt)}
              className={`flex-1 min-w-[54px] py-2 rounded-xl text-center text-xs font-black transition-all cursor-pointer font-mono ${
                selectedAmount === amt
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-150 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {amt} DH
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 font-bold leading-normal">
        🌐 <strong>{t.simNote}</strong>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-md cursor-pointer transition-all active:scale-98"
      >
        {loading ? 'Rechargement...' : t.submitBtn}
      </button>
    </form>
  );
}
