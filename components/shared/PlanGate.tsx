import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { SubscriptionTier } from '../../types';
import { ShieldAlert, Sparkles, Check, ChevronRight } from 'lucide-react';

interface PlanGateProps {
  requiredTier: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const TIER_RANKS: Record<SubscriptionTier, number> = {
  'free': 0,
  'premium': 1,
  'family': 2,
  'analyse': 3,
  'elite': 4
};

const PLAN_INFO = {
  'free': { name: 'Gratuit (Siyahi)', price: '0 DH', color: 'slate' },
  'premium': { name: 'Premium (Dahabi)', price: '29 DH/mois', color: 'amber' },
  'family': { name: 'Famille (Aila)', price: '49 DH/mois', color: 'blue' },
  'analyse': { name: 'Analyse+', price: '150 DH/mois', color: 'emerald' },
  'elite': { name: 'Elite', price: '200 DH/mois', color: 'indigo' }
};

export function PlanGate({ requiredTier, children, fallback }: PlanGateProps) {
  const { profile, upgradeSubscription } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const currentTier: SubscriptionTier = profile?.subscription_tier || 'free';
  const hasAccess = TIER_RANKS[currentTier] >= TIER_RANKS[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  const handleUpgrade = (tier: SubscriptionTier) => {
    upgradeSubscription(tier);
    setShowModal(false);
  };

  const requiredPlanName = PLAN_INFO[requiredTier].name;

  return (
    <div className="relative min-h-[300px]">
      {/* Blurred background preview */}
      <div className="pointer-events-none select-none blur-[6px] opacity-40">
        {fallback || children}
      </div>

      {/* Lock screen overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 p-6 text-center backdrop-blur-[2px]">
        <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          
          <h3 className="text-lg font-black text-slate-800 tracking-tight">
            Option {PLAN_INFO[requiredTier].name} Requise
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Profitez de toute la puissance de Floussi. Votre plan actuel est {PLAN_INFO[currentTier].name}.
          </p>

          <div className="my-5 w-full border-t border-slate-100 py-3 text-left space-y-2">
            <div className="flex items-start gap-2 text-xs text-slate-600 font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Accès illimité aux rapports et indicateurs avancés.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-600 font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Zéro publicité sur l'application Web, Play Store et App Store.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-600 font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Synchronisation instantanée avec vos comptes bancaires et Daret.</span>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl py-2.5 px-4 text-xs font-black tracking-wide shadow-md shadow-amber-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Passer à {requiredPlanName}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Checkout Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Floussi Premium & Analyse+</span>
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Fermer
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              Choisissez l'abonnement qui correspond à la taille de votre patrimoine et aux traditions de votre foyer.
            </p>

            <div className="space-y-3">
              {(Object.keys(PLAN_INFO) as SubscriptionTier[]).map((tier) => {
                const info = PLAN_INFO[tier];
                const isCurrent = currentTier === tier;
                const isAllowed = TIER_RANKS[tier] >= TIER_RANKS[requiredTier];

                return (
                  <div 
                    key={tier}
                    className={`border rounded-xl p-4 transition-all flex justify-between items-center ${
                      isCurrent 
                        ? 'border-emerald-500 bg-emerald-50/20' 
                        : isAllowed
                          ? 'border-slate-200 hover:border-amber-400'
                          : 'border-slate-100 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800">{info.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full uppercase">
                            Actuel
                          </span>
                        )}
                        {tier === requiredTier && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full uppercase">
                            Requis
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Abonnement mensuel Floussi Maroc • Résiliation en un clic.
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-black text-slate-800">{info.price}</span>
                      {!isCurrent && (
                        <button
                          onClick={() => handleUpgrade(tier)}
                          className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                        >
                          Choisir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
