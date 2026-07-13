"use client";

import React, { useState } from 'react';
import { PricingCard } from '../../../components/pricing/PricingCard';
import { FeatureComparisonTable } from '../../../components/pricing/FeatureComparisonTable';
import { CheckoutWizard } from '../../../components/pricing/CheckoutWizard';
import { SubscriptionTier } from '../../../types';
import { ArrowLeft, CheckCircle2, Sparkles, X } from 'lucide-react';

interface PricingPageProps {
  onEnterApp: () => void;
}

const PRICING_PLANS = [
  {
    id: 'free' as SubscriptionTier,
    name: 'Plan Gratuit',
    price: '0 DH',
    period: '/ mois',
    description: 'Pour s\'initier à l\'enveloppe budgétaire individuelle.',
    features: [
      { text: 'Jusqu\'à 3 Seaux d\'enveloppes', included: true },
      { text: 'Enregistrement de transactions manuel', included: true },
      { text: 'Numériseur OCR Tesseract (1/jour)', included: true },
      { text: 'Saisie Hors-ligne (IndexedDB)', included: true },
      { text: 'Zakat & Simulateurs financiers', included: true },
      { text: 'Zéro Publicité', included: false },
      { text: 'Daret (Jmâa) collective active', included: false }
    ],
    ctaText: 'Commencer gratuitement',
    isPopular: false
  },
  {
    id: 'premium' as SubscriptionTier,
    name: 'Premium',
    price: '29 DH',
    period: '/ mois',
    description: 'Zéro pub, enveloppes illimitées et rapports avancés.',
    features: [
      { text: 'Seaux d\'enveloppes ILLIMITÉS', included: true },
      { text: '100% SANS PUBLICITÉ', included: true },
      { text: 'Numériseur OCR intelligent illimité', included: true },
      { text: 'Daret (Jmâa) : lecture et suivi', included: true },
      { text: 'Conseils budgétaires de l\'IA', included: true },
      { text: 'Export complet CSV/Excel', included: true },
      { text: 'Support technique prioritaire', included: true }
    ],
    ctaText: 'Passer au Premium',
    isPopular: true
  },
  {
    id: 'family' as SubscriptionTier,
    name: 'Famille / Foyer',
    price: '49 DH',
    period: '/ mois',
    description: 'Pilotez l\'argent de tout le ménage ensemble.',
    features: [
      { text: 'Jusqu\'à 4 profils de foyer reliés', included: true },
      { text: 'Partage de seaux (Loyer, Souq, Auto)', included: true },
      { text: 'Daret amicale collective (4 membres)', included: true },
      { text: 'Conseils IA pour le foyer', included: true },
      { text: 'Tout le contenu de l\'offre Premium', included: true },
      { text: 'Tableau de bord d\'éducation enfants', included: true }
    ],
    ctaText: 'Sélectionner Famille',
    isPopular: false
  },
  {
    id: 'analyse' as SubscriptionTier,
    name: 'Analyse',
    price: '150 DH',
    period: '/ mois',
    description: 'Intelligence artificielle prédictive de pointe.',
    features: [
      { text: 'IA prédictive (lissage de trésorerie)', included: true },
      { text: 'Rapports PDF synthétiques mensuels', included: true },
      { text: 'Daret collective (jusqu\'à 6 membres)', included: true },
      { text: 'Simulations d\'investissement avancées', included: true },
      { text: 'Support prioritaire par chat 24h/7', included: true }
    ],
    ctaText: 'Choisir Analyse',
    isPopular: false
  },
  {
    id: 'elite' as SubscriptionTier,
    name: 'Elite',
    price: '200 DH',
    period: '/ mois',
    description: 'Accompagnement financier marocain d\'excellence.',
    features: [
      { text: 'Tous les outils de l\'app débloqués', included: true },
      { text: 'Daret collective ILLIMITÉE', included: true },
      { text: 'Conseillère financière humaine dédiée (1-1)', included: true },
      { text: 'Rapports PDF en temps réel', included: true },
      { text: 'Ligne directe téléphonique VIP Elite', included: true }
    ],
    ctaText: 'Accéder à l\'Elite',
    isPopular: false
  }
];

export default function PricingPage({ onEnterApp }: PricingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const activePlanDetails = PRICING_PLANS.find(p => p.id === selectedPlan);

  const handleSelectPlan = (id: SubscriptionTier) => {
    if (id === 'free') {
      onEnterApp();
    } else {
      setSelectedPlan(id);
    }
  };

  const handleCheckoutSuccess = () => {
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSelectedPlan(null);
    onEnterApp();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <button 
            onClick={onEnterApp}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Retour à l'accueil</span>
          </button>
          
          <div className="text-right">
            <span className="font-extrabold text-xs tracking-tight text-slate-900 block leading-none">
              Floussi Dahabi 🇲🇦
            </span>
          </div>
        </div>

        {/* Title Block */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
            Tarifs simples et transparents
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Pilotez votre budget en toute confiance
          </h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed uppercase">
            De l'épargne individuelle gratuite au partage familial complet. Zéro engagement, résiliez quand vous voulez.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              id={plan.id}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              isPopular={plan.isPopular}
              ctaText={plan.ctaText}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        {/* Feature comparison table widget */}
        <div className="max-w-4xl mx-auto pt-8">
          <FeatureComparisonTable />
        </div>
      </div>

      {/* Modal: Checkout Wizard */}
      {selectedPlan && activePlanDetails && !showSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl my-8">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute -top-3 -right-3 bg-white border border-slate-100 text-slate-400 hover:text-slate-600 p-1.5 rounded-full shadow-md z-10 cursor-pointer"
            >
              <X size={16} />
            </button>
            <CheckoutWizard
              selectedPlan={selectedPlan}
              planPrice={parseInt(activePlanDetails.price)}
              planName={activePlanDetails.name}
              onSuccess={handleCheckoutSuccess}
            />
          </div>
        </div>
      )}

      {/* Modal: Success Feedback */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-150 rounded-3xl p-8 max-w-md text-center space-y-6 shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-150 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1 justify-center">
                <Sparkles size={12} />
                Félicitations !
              </span>
              <h3 className="font-black text-slate-900 text-base uppercase">Abonnement Validé avec succès</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Votre transaction a été approuvée. Votre compte Floussi a été mis à niveau au statut <span className="text-emerald-600 font-black">Dahabi</span>. Profitez de toutes vos nouvelles fonctionnalités dès maintenant !
              </p>
            </div>

            <button
              onClick={handleCloseSuccess}
              className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Accéder à mon tableau de bord
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
