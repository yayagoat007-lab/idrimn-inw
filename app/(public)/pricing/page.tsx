"use client";

import { Check, ArrowRight } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../../../lib/constants';

interface PricingPageProps {
  onEnterApp: () => void;
}

export default function PricingPage({ onEnterApp }: PricingPageProps) {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
            Tarifs transparents
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
            Choisissez l'offre qui convient à votre foyer
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            De l'épargne individuelle gratuite au partage familial complet, trouvez la formule idéale pour maîtriser vos finances marocaines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {Object.entries(SUBSCRIPTION_TIERS).slice(0, 3).map(([key, value]) => (
            <div key={key} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-gray-900 capitalize">{value.name}</h4>
                <p className="text-2xl font-extrabold text-gray-900">{value.price}</p>
                <ul className="space-y-2 pt-3 border-t border-gray-50">
                  {value.features.map((feat: string, idx: number) => (
                    <li key={idx} className="text-[11px] text-gray-600 flex items-start gap-1.5">
                      <Check size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onEnterApp}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>S'inscrire</span>
                <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
