import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { SubscriptionTier } from '../../types';

export interface PricingCardProps {
  key?: React.Key;
  id: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  isPopular?: boolean;
  ctaText: string;
  isCurrent?: boolean;
  onSelect: (id: SubscriptionTier) => void;
}

export function PricingCard({
  id,
  name,
  price,
  period,
  description,
  features,
  isPopular,
  ctaText,
  isCurrent,
  onSelect
}: PricingCardProps) {
  return (
    <div className={`relative border rounded-3xl p-6 bg-white transition-all duration-300 flex flex-col justify-between h-full ${
      isPopular 
        ? 'border-emerald-500 shadow-lg ring-1 ring-emerald-500/20' 
        : 'border-slate-150 hover:border-slate-300 hover:shadow-md'
    }`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider flex items-center gap-1">
          <Sparkles size={10} />
          <span>Le plus populaire</span>
        </span>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">{name}</h4>
          <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed h-8">{description}</p>
        </div>

        <div className="flex items-baseline gap-1.5 border-b border-slate-50 pb-4">
          <span className="text-3xl font-black text-slate-900 tracking-tight">{price}</span>
          <span className="text-xs text-slate-400 font-bold">{period}</span>
        </div>

        <ul className="space-y-2.5 pt-2">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs font-semibold">
              {feat.included ? (
                <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <X size={14} className="text-slate-300 shrink-0 mt-0.5" />
              )}
              <span className={feat.included ? 'text-slate-600' : 'text-slate-400 font-medium line-through decoration-slate-200'}>
                {feat.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => onSelect(id)}
        disabled={isCurrent}
        className={`w-full py-2.5 mt-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
          isCurrent
            ? 'bg-emerald-50 text-emerald-800 cursor-not-allowed font-black border border-emerald-100'
            : isPopular
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md shadow-emerald-600/10'
            : 'bg-slate-800 hover:bg-slate-900 text-white hover:shadow-md'
        }`}
      >
        {isCurrent ? 'Plan Actuel' : ctaText}
      </button>
    </div>
  );
}
