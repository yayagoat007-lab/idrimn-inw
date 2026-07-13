import React from 'react';
import { useAIInsights } from '../../hooks/use-ai-insights';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Landmark, HelpCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface MoroccanBenchmarksProps {
  lang: 'fr' | 'darija';
}

export function MoroccanBenchmarks({ lang }: MoroccanBenchmarksProps) {
  const { aiResults, loading } = useAIInsights("mock-user-id-9999", lang);

  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  if (loading || !aiResults) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex justify-center py-12">
        <span className="text-xs text-slate-400 font-bold animate-pulse">Comparaison des données HCP en cours...</span>
      </div>
    );
  }

  const { benchmarks, regionalAverage } = aiResults;

  // Custom formatted tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 text-white rounded-xl p-3 shadow-xl text-xs font-sans font-mono">
          <p className="font-extrabold text-slate-300 mb-1">{payload[0]?.payload?.category}</p>
          <p className="text-emerald-400">
            Vos masroufs: <span className="font-black">{payload[0]?.value?.toFixed(1)}%</span>
          </p>
          <p className="text-slate-400">
            Moyenne HCP: <span className="font-black">{payload[1]?.value?.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      <div>
        <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-emerald-600" />
          <span>Comparatif HCP & Statistiques Nationales</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold">
          Comparez votre profil d'enveloppe à la consommation moyenne des ménages selon le Haut-Commissariat au Plan du Maroc.
        </p>
      </div>

      {/* Regional benchmark box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-600">
        <div className="space-y-0.5">
          <span className="block text-[8px] uppercase font-bold text-slate-400">Région de référence</span>
          <span className="text-sm font-black text-slate-800">{regionalAverage.regionName}</span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-[8px] uppercase font-bold text-slate-400">Dépense mensuelle moyenne</span>
          <span className="text-sm font-black text-slate-800 font-mono">{formatMAD(regionalAverage.averageMonthlyExpense)}</span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-[8px] uppercase font-bold text-slate-400">Poste principal de dépense</span>
          <span className="text-sm font-black text-emerald-600">{regionalAverage.highestSpendingCategory}</span>
        </div>
      </div>

      {/* Bar Chart comparing user percents against benchmarks */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={benchmarks}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="category" 
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}%`}
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 10, fontWeight: 700, color: '#475569' }}
            />
            <Bar name="Votre budget (%)" dataKey="userPercent" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar name="Moyenne HCP (%)" dataKey="benchmarkPercent" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Analytical alerts list */}
      <div className="space-y-2">
        <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Écarts significatifs</span>
        {benchmarks.filter(b => b.diffPercent > 5).map(b => (
          <div key={b.category} className="flex gap-2.5 items-center bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <p>
              Votre budget <strong>{b.category}</strong> est supérieur de <strong>{b.diffPercent.toFixed(0)}%</strong> par rapport à la moyenne nationale HCP. Pensez à modérer ce compartiment.
            </p>
          </div>
        ))}

        {benchmarks.filter(b => b.diffPercent <= 5 && b.diffPercent > 0).length === 0 && (
          <p className="text-[10px] text-slate-400 font-semibold italic">Parfait ! Tous vos budgets s'inscrivent de manière très saine dans les fourchettes types d'HCP Maroc.</p>
        )}
      </div>

      <div className="flex items-start gap-1 bg-amber-50/40 border border-amber-100 rounded-xl p-2.5 text-[9px] text-amber-800 font-semibold leading-normal mt-4">
        <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <p>
          Note : Les données proviennent de l'enquête nationale sur l'évaluation de la consommation des ménages marocains (HCP) ajustée aux coefficients de l'inflation de 2026.
        </p>
      </div>
    </div>
  );
}
