import React from 'react';
import { Check, X } from 'lucide-react';

interface FeatureRow {
  name: string;
  free: string | boolean;
  premium: string | boolean;
  family: string | boolean;
  analyse: string | boolean;
  elite: string | boolean;
}

const COMPARISON_DATA: FeatureRow[] = [
  { name: 'Enveloppes (Seaux)', free: '3 max', premium: 'Illimités', family: 'Illimités', analyse: 'Illimités', elite: 'Illimités' },
  { name: 'Saisie Hors-ligne', free: true, premium: true, family: true, analyse: true, elite: true },
  { name: 'Numériseur OCR', free: 'Basique', premium: 'Illimité', family: 'Illimité', analyse: 'Illimité', elite: 'Illimité' },
  { name: 'Daret (Jmâa) Digitale', free: false, premium: 'Lecture seule', family: '4 membres', analyse: '6 membres', elite: 'Illimitée' },
  { name: 'Mode Foyer (Famille)', free: false, premium: false, family: '4 profils', analyse: '6 profils', elite: 'Illimités' },
  { name: 'Conseils Experts / IA', free: false, premium: 'Basique', family: 'Avancé', analyse: 'IA prédictive', elite: 'Conseillère 1-1' },
  { name: 'Synthèses PDF (Rapports)', free: false, premium: false, family: false, analyse: 'Mensuel', elite: 'Temps réel' },
  { name: 'Support technique', free: 'Par email', premium: 'Prioritaire', family: 'Prioritaire', analyse: '24/7 Chat', elite: 'Ligne directe Elite' },
  { name: 'Thèmes de l\'app', free: '1 standard', premium: '2 classiques', family: '5 marocains', analyse: '5 marocains', elite: '10 personnalisables' },
  { name: 'Sans Publicités', free: false, premium: true, family: true, analyse: true, elite: true }
];

export function FeatureComparisonTable() {
  const renderCell = (val: string | boolean) => {
    if (typeof val === 'boolean') {
      return val ? (
        <Check size={16} className="text-emerald-500 mx-auto" />
      ) : (
        <X size={16} className="text-slate-200 mx-auto" />
      );
    }
    return <span className="text-[11px] text-slate-700 font-extrabold">{val}</span>;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
      <div className="p-6 border-b border-slate-50">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Comparatif détaillé des fonctionnalités</h3>
        <p className="text-[10px] text-slate-400 font-medium">Tout ce qu'il faut savoir pour choisir la formule idéale</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="p-4 w-1/3">Fonctionnalité</th>
              <th className="p-4 text-center">Gratuit</th>
              <th className="p-4 text-center text-amber-600 bg-amber-50/20">Premium</th>
              <th className="p-4 text-center text-emerald-600">Famille</th>
              <th className="p-4 text-center text-blue-600">Analyse</th>
              <th className="p-4 text-center text-purple-600">Elite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {COMPARISON_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4 text-xs font-bold text-slate-800">{row.name}</td>
                <td className="p-4 text-center">{renderCell(row.free)}</td>
                <td className="p-4 text-center bg-amber-50/5">{renderCell(row.premium)}</td>
                <td className="p-4 text-center">{renderCell(row.family)}</td>
                <td className="p-4 text-center">{renderCell(row.analyse)}</td>
                <td className="p-4 text-center">{renderCell(row.elite)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default FeatureComparisonTable;
