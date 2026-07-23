import React, { useState } from 'react';
import { useBillPayment } from '../../hooks/use-bill-payment';
import { useWallet } from '../../hooks/use-wallet';
import { BillProvider } from '../../types';
import { CheckCircle2, FileText, Landmark, User, CreditCard, Sparkles } from 'lucide-react';
import { Language } from '../../lib/i18n';

interface BillPaymentFormProps {
  language: Language;
  onSuccess?: () => void;
}

export function BillPaymentForm({ language, onSuccess }: BillPaymentFormProps) {
  const isDarija = language === 'darija';
  const { balance } = useWallet();
  const { payBill } = useBillPayment();

  const [provider, setProvider] = useState<BillProvider>('ONEE');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  // Providers dictionary with logos / descriptions
  const providers: { value: BillProvider; name: string; city: string; color: string }[] = [
    { value: 'ONEE', name: 'ONEE (Électricité/Eau)', city: 'National', color: 'border-blue-200 text-blue-700 bg-blue-50/30' },
    { value: 'Lydec', name: 'Lydec', city: 'Casablanca', color: 'border-cyan-200 text-cyan-700 bg-cyan-50/30' },
    { value: 'Redal', name: 'Redal', city: 'Rabat-Salé', color: 'border-indigo-200 text-indigo-700 bg-indigo-50/30' },
    { value: 'RADEEMA', name: 'RADEEMA', city: 'Marrakech', color: 'border-teal-200 text-teal-700 bg-teal-50/30' },
    { value: 'AMENDIS', name: 'AMENDIS', city: 'Tanger-Tétouan', color: 'border-emerald-200 text-emerald-700 bg-emerald-50/30' },
    { value: 'IAM', name: 'Maroc Telecom (IAM)', city: 'National', color: 'border-orange-200 text-orange-700 bg-orange-50/30' },
    { value: 'INWI', name: 'Inwi', city: 'National', color: 'border-purple-200 text-purple-700 bg-purple-50/30' },
    { value: 'Orange', name: 'Orange', city: 'National', color: 'border-rose-200 text-rose-700 bg-rose-50/30' }
  ];

  const t = {
    providerLabel: isDarija ? 'Khtar Mouassassa :' : 'Sélectionner le fournisseur :',
    refLabel: isDarija ? 'Raqm l-3aqd / Réf contrat :' : 'Référence contrat / Réf de compte :',
    refPlaceholder: 'Ex: 19847293',
    amountLabel: isDarija ? 'L-qadr d l-fatoura (DH) :' : 'Montant de la facture (DH) :',
    submitBtn: isDarija ? 'Khless l-fatoura (Simulation)' : 'Payer la facture (Simulation)',
    successMsg: isDarija ? 'Khalass t-temm b l-khir!' : 'Facture payée avec succès !',
    simNote: isDarija ? 'Hada ghir tajriba, l-flous real ma ghay-mchiwch.' : 'Simulation locale - aucun débit bancaire réel ne sera effectué.',
    insufficient: isDarija ? 'Ma3ndekch l-baraka kafi f l-wallet' : 'Solde de portefeuille virtuel insuffisant.'
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    const parsedAmount = parseFloat(amount);
    if (!reference.trim()) {
      setError(isDarija ? 'Kteb raqm l-3aqd.' : 'Veuillez saisir votre référence contrat.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(isDarija ? 'Kteb taman s7i7.' : 'Veuillez renseigner un montant de facture valide.');
      return;
    }
    if (balance && balance.balance < parsedAmount) {
      setError(t.insufficient);
      return;
    }

    setLoading(true);
    try {
      const res = await payBill(provider, reference, parsedAmount);
      setSuccess(res);
      setAmount('');
      setReference('');
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
            <span>Facture {success.provider}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">{isDarija ? "L-Mousassasa" : "Fournisseur"}</span>
            <span className="text-slate-800 font-black">{success.provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">{isDarija ? "Raqm l-3aqd" : "Référence contrat"}</span>
            <span className="text-slate-800 font-mono font-bold">{success.accountReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">{isDarija ? "L-mablagh" : "Montant réglé"}</span>
            <span className="text-emerald-700 font-black font-mono">-{success.amount.toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">{isDarija ? "Tarikh dyal l-khalass" : "Date de paiement"}</span>
            <span className="text-slate-600 font-medium">{new Date(success.paidAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button
          onClick={() => setSuccess(null)}
          className="w-full py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer"
        >
          {isDarija ? "Khless fatoura khora" : "Payer une autre facture"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-600 font-black animate-bounce">
          ⚠️ {error}
        </div>
      )}

      {/* Provider selector */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
          {t.providerLabel}
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
          {providers.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setProvider(p.value)}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                provider === p.value
                  ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-black text-slate-800 truncate block pr-6">{p.name}</span>
              <span className="text-[9px] font-bold text-slate-400 mt-1 block uppercase tracking-wider">{p.city}</span>
              
              {provider === p.value && (
                <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-emerald-600 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reference contract input */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
          {t.refLabel}
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={t.refPlaceholder}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Amount contract input */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
          {t.amountLabel}
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs font-mono">DH</span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-2.5 pl-10 pr-12 text-sm font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
          />
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
        {loading ? (isDarija ? 'Kntteb b l-aman...' : 'Connexion sécurisée...') : t.submitBtn}
      </button>
    </form>
  );
}
