import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { HajjPoste } from '../../lib/hajj-budget-template';
import { formatCurrency } from '../../lib/utils';

interface HajjBudgetBreakdownProps {
  postes: HajjPoste[];
  lang: 'fr' | 'darija';
}

export function HajjBudgetBreakdown({ postes, lang }: HajjBudgetBreakdownProps) {
  // Map postes into chart format
  const chartData = postes.map(p => ({
    name: lang === 'darija' ? p.nameDarija : p.nameFr,
    'Min (DH)': p.min,
    'Max (DH)': p.max,
  }));

  const t = {
    title: lang === 'darija' ? 'Ihsa\'iyat l-Budget (Breakdown)' : 'Répartition du Budget (MAD)',
    minLegend: lang === 'darija' ? 'Hadd l-Adna' : 'Estimation Min',
    maxLegend: lang === 'darija' ? 'Hadd l-Aqsa' : 'Estimation Max',
    tooltipLabel: lang === 'darija' ? 'Dépense' : 'Poste'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl text-white font-sans text-xs">
          <p className="font-black uppercase tracking-wider text-slate-300 mb-1.5">{label}</p>
          <div className="space-y-1 font-mono">
            <p className="text-emerald-400">
              Min: <span className="font-extrabold">{formatCurrency(payload[0].value)}</span>
            </p>
            <p className="text-blue-400">
              Max: <span className="font-extrabold">{formatCurrency(payload[1].value)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs space-y-4" id="hajj-breakdown-chart">
      <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>{t.title}</span>
      </h3>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={9} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '..' : val}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={9} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            <Bar dataKey="Min (DH)" name={t.minLegend} fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Max (DH)" name={t.maxLegend} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default HajjBudgetBreakdown;
