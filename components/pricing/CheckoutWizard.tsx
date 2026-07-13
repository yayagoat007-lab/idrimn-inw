import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle, RefreshCw, Sparkles, Building2, Ticket } from 'lucide-react';
import { useSubscription } from '../../hooks/use-subscription';
import { SubscriptionTier } from '../../types';

interface CheckoutWizardProps {
  selectedPlan: SubscriptionTier;
  planPrice: number; // monthly price in DH
  planName: string;
  onSuccess: () => void;
}

export function CheckoutWizard({ selectedPlan, planPrice, planName, onSuccess }: CheckoutWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    method: 'card' as 'card' | 'mobile' | 'cash' | 'paypal'
  });
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0); // percent
  const [applyingCode, setApplyingCode] = useState(false);

  const { loading, applyPromoCode, processPayment } = useSubscription();

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setApplyingCode(true);
    const d = await applyPromoCode(promoCode);
    setDiscount(d);
    setApplyingCode(false);
  };

  const finalPrice = Math.max(0, Math.round(planPrice * (1 - discount / 100)));

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePay = async () => {
    const success = await processPayment({
      planId: selectedPlan,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      method: formData.method
    });
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm max-w-xl mx-auto">
      {/* Checkout Header */}
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">Passerelle Floussi Pay 🇲🇦</span>
          <h3 className="text-base font-black tracking-tight mt-1">Finalisez votre abonnement</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Plan Sélectionné</p>
          <p className="text-xs font-black text-emerald-400 capitalize">{planName}</p>
        </div>
      </div>

      {/* Progress timeline */}
      <div className="flex border-b border-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">
        <div className={`flex-1 py-3 border-b-2 ${step >= 1 ? 'border-emerald-600 text-slate-900' : 'border-transparent'}`}>
          1. Profil
        </div>
        <div className={`flex-1 py-3 border-b-2 ${step >= 2 ? 'border-emerald-600 text-slate-900' : 'border-transparent'}`}>
          2. Facturation
        </div>
        <div className={`flex-1 py-3 border-b-2 ${step === 3 ? 'border-emerald-600 text-slate-900' : 'border-transparent'}`}>
          3. Confirmation
        </div>
      </div>

      <div className="p-6 space-y-6">
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karim Alaoui"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. karim@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">N° de téléphone (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +212661234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Étape Suivante
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {/* Promo Code section */}
            <div className="bg-slate-50 p-4 rounded-2xl flex gap-2 items-center">
              <div className="relative flex-1">
                <Ticket className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Code de réduction (Ex: FLOUSSI20)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold uppercase tracking-wider"
                />
              </div>
              <button
                onClick={handleApplyPromo}
                disabled={applyingCode}
                className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-900"
              >
                {applyingCode ? <RefreshCw className="animate-spin w-4 h-4" /> : 'Appliquer'}
              </button>
            </div>

            {discount > 0 && (
              <p className="text-[11px] text-emerald-600 font-extrabold flex items-center gap-1">
                <Sparkles size={14} />
                Code promo valide : Réduction de {discount}% appliquée !
              </p>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Méthode de paiement sécurisée</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, method: 'card' })}
                  className={`border p-3.5 rounded-2xl text-center transition-all flex flex-col items-center gap-2 ${
                    formData.method === 'card' ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard size={20} className={formData.method === 'card' ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-[10px] font-black uppercase text-slate-700">CB Maroc (PayDunya)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, method: 'mobile' })}
                  className={`border p-3.5 rounded-2xl text-center transition-all flex flex-col items-center gap-2 ${
                    formData.method === 'mobile' ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone size={20} className={formData.method === 'mobile' ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-[10px] font-black uppercase text-slate-700">Paiement Mobile CMI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, method: 'cash' })}
                  className={`border p-3.5 rounded-2xl text-center transition-all flex flex-col items-center gap-2 ${
                    formData.method === 'cash' ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <Building2 size={20} className={formData.method === 'cash' ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-[10px] font-black uppercase text-slate-700">Espèces (Cash Plus)</span>
                </button>
              </div>
            </div>

            {/* Recap */}
            <div className="border border-slate-100 p-4 rounded-2xl space-y-2 bg-slate-50/50">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Prix d'origine :</span>
                <span>{planPrice} MAD / mois</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs font-semibold text-emerald-600">
                  <span>Réduction promo :</span>
                  <span>-{discount}%</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-100 pt-2">
                <span>Montant Net à Payer :</span>
                <span className="text-emerald-600">{finalPrice} MAD / mois</span>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Étape Suivante
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="py-4">
              <CheckCircle size={56} className="text-emerald-500 mx-auto animate-bounce" />
              <h4 className="text-base font-black text-slate-900 mt-4">Prêt à finaliser la transaction</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                Votre transaction va être initiée en toute sécurité via notre partenaire financier. Pas d'engagement, résiliation en un clic.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl max-w-sm mx-auto text-left space-y-2 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Récapitulatif de votre commande :</p>
              <div className="flex justify-between text-xs font-extrabold text-slate-800">
                <span>Formule :</span>
                <span className="capitalize">{planName}</span>
              </div>
              <div className="flex justify-between text-xs font-extrabold text-slate-800">
                <span>Client :</span>
                <span>{formData.fullName}</span>
              </div>
              <div className="flex justify-between text-xs font-extrabold text-slate-800">
                <span>Téléphone :</span>
                <span>{formData.phone}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-emerald-600 border-t border-slate-100 pt-2 mt-1">
                <span>Total à régler :</span>
                <span>{finalPrice} MAD / mois</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" size={14} /> : null}
                <span>Confirmer et Payer {finalPrice} DH</span>
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full py-2.5 text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-wider transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default CheckoutWizard;
