import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface PlanLimitBannerProps {
  currentTier: string;
  limitMessage?: string;
  onUpgrade?: () => void;
}

export function PlanLimitBanner({
  currentTier = 'free',
  limitMessage = "Vous avez atteint la limite de 3 buckets pour votre plan Siyahi (Gratuit).",
  onUpgrade
}: PlanLimitBannerProps) {
  if (currentTier !== 'free') return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-5 rounded-3xl relative overflow-hidden">
      {/* Decorative stars background */}
      <div className="absolute right-4 top-4 text-amber-200 opacity-40">
        <Sparkles size={48} className="animate-pulse" />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1 max-w-lg">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-800 bg-amber-200/50 px-2.5 py-0.5 rounded-full w-fit">
            <ShieldCheck size={12} />
            <span>Limite Plan Siyahi (Gratuit)</span>
          </div>
          <h4 className="text-sm font-black text-amber-900 leading-snug mt-1">
            Débloquez les Sanadiq illimités avec Floussi Premium (Dahabi) !
          </h4>
          <p className="text-xs text-amber-800/80 font-medium leading-relaxed">
            {limitMessage} Pour seulement <span className="font-bold">29 DH / mois</span>, créez autant d'enveloppes de budget que vous le souhaitez, éliminez les publicités, et activez la synchronisation en direct.
          </p>
        </div>

        <button
          onClick={onUpgrade}
          className="w-full sm:w-auto px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>Devenir Dahabi</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
