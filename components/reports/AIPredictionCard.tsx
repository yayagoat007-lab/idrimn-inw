import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AIPredictionCardProps {
  score: number;
  projection: number;
  anomalies: string[];
  suggestions: {
    id?: string;
    title: string;
    description: string;
    potentialSaving: number;
    actionLabel: string;
    actionKey: string;
  }[];
  onActionClick: (key: string) => void;
}

export function AIPredictionCard({ score, projection, anomalies, suggestions, onActionClick }: AIPredictionCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Score & Projections */}
      <div className="border border-slate-150 rounded-2xl p-5 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-3 text-emerald-600">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-black uppercase tracking-wider">Santé Financière IA</h4>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{score}</span>
            <span className="text-xs text-slate-400 font-bold">/ 100</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Calculé sur votre ratio d'épargne et votre rigueur budgétaire.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-50">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Projection à 3 mois</div>
          <div className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>+ {projection.toLocaleString('fr-MA')} DH</span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold mt-1 leading-relaxed">
            Si vous maintenez ce rythme de masroufs, votre sandoq accumulera cette somme d'ici 90 jours.
          </p>
        </div>
      </div>

      {/* 2. Anomalies */}
      <div className="border border-slate-150 rounded-2xl p-5 bg-white shadow-xs">
        <div className="flex items-center gap-1.5 mb-3 text-amber-500">
          <AlertTriangle className="w-4 h-4" />
          <h4 className="text-xs font-black uppercase tracking-wider">Détecteur d'Anomalies</h4>
        </div>

        <div className="space-y-2.5">
          {anomalies.map((anom, idx) => (
            <div key={idx} className="flex gap-2 p-2.5 bg-amber-50/20 border border-amber-100 rounded-xl">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-600 font-bold leading-normal">
                {anom}
              </p>
            </div>
          ))}

          {anomalies.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50/20 border border-emerald-100 rounded-xl text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[10px] font-bold">Aucune anomalie budgétaire détectée ce mois-ci !</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Smart Suggestions */}
      <div className="border border-slate-150 rounded-2xl p-5 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-3 text-blue-600">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-black uppercase tracking-wider">Optimisations Suggérées</h4>
          </div>

          <div className="space-y-3">
            {suggestions.map((sug, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <h5 className="text-[10px] font-black text-slate-800 leading-tight">{sug.title}</h5>
                    <p className="text-[9px] text-slate-400 font-semibold leading-normal mt-0.5">{sug.description}</p>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-md shrink-0">
                    +{sug.potentialSaving}DH
                  </span>
                </div>
                <button
                  onClick={() => onActionClick(sug.actionKey)}
                  className="w-full text-center py-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[9px] font-black uppercase text-slate-700 rounded-lg transition-all"
                >
                  {sug.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AIPredictionCard;
