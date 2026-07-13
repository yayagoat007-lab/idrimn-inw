import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../lib/utils';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface CategoryPieChartProps {
  spendingByCategory: any[];
  topExpenses: any[];
}

export function CategoryPieChart({ spendingByCategory, topExpenses }: CategoryPieChartProps) {
  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 shadow-xl text-xs font-sans">
          <p className="font-extrabold">{data.name}</p>
          <p className="text-slate-300 font-mono font-bold mt-0.5">
            {formatMAD(data.value)} ({data.percent.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const hasData = spendingByCategory.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Category Donut chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-3 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight">Dépenses par Catégorie</h3>
          <p className="text-[10px] text-slate-400 font-semibold mb-4">
            Structure relative de vos dépenses pour la période active.
          </p>
        </div>

        {hasData ? (
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  iconSize={7}
                  layout="horizontal"
                  wrapperStyle={{ fontSize: 9, fontWeight: 700, color: '#475569', paddingTop: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-56 flex flex-col items-center justify-center text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold">Aucune transaction de dépense ce mois-ci.</p>
          </div>
        )}
      </div>

      {/* Top Expenses List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight">Plus Gros Achats</h3>
          <p className="text-[10px] text-slate-400 font-semibold mb-4">
            Top 5 des dépenses individuelles enregistrées.
          </p>
          
          <div className="space-y-2.5">
            {topExpenses.length > 0 ? (
              topExpenses.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 hover:bg-slate-100/50 transition-all">
                  <div className="truncate">
                    <p className="text-xs font-extrabold text-slate-800 truncate">{t.merchant}</p>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                      {t.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-800 font-mono">{formatMAD(t.amount)}</p>
                    {t.variation !== 0 && (
                      <p className={`text-[8px] font-bold ${t.variation > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {t.variation > 0 ? '+' : ''}{t.variation.toFixed(0)}% vs avg
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-bold text-slate-400 italic text-center py-10">Aucun enregistrement disponible.</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-1 bg-amber-50/40 border border-amber-100 rounded-xl p-2.5 text-[9px] text-amber-800 font-semibold leading-normal mt-4">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <p>
            En traquant vos 5 plus gros achats chaque mois, vous ciblez immédiatement les dépenses de confort superflues.
          </p>
        </div>
      </div>
    </div>
  );
}
