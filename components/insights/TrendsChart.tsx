import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Line 
} from 'recharts';
import { TrendingUp, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface TrendsChartProps {
  monthlyHistory: any[];
}

export function TrendsChart({ monthlyHistory }: TrendsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload[0]?.value || 0;
      const expense = payload[1]?.value || 0;
      const savings = payload[2]?.value || 0;

      return (
        <div className="bg-slate-900 border border-slate-700 text-white rounded-xl p-3 shadow-xl text-xs font-sans">
          <p className="font-extrabold text-slate-300 mb-1">{label}</p>
          <div className="space-y-1 font-mono">
            <p className="text-emerald-400">Revenus: <span className="font-black">{formatCurrency(income)}</span></p>
            <p className="text-rose-400 font-bold">Masrouf: <span>{formatCurrency(expense)}</span></p>
            <p className="text-cyan-400 font-bold">Épargne: <span>{formatCurrency(savings)}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Flux de Trésorerie Mensuels</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold">
          Revenus vs dépenses (Masrouf) des 12 derniers mois de votre foyer.
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={monthlyHistory}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 10, fontWeight: 700, color: '#475569' }}
            />
            <Area 
              type="monotone" 
              name="Revenus"
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorInc)" 
            />
            <Area 
              type="monotone" 
              name="Dépenses (Masrouf)"
              dataKey="expense" 
              stroke="#ef4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorExp)" 
            />
            <Area 
              type="monotone" 
              name="Épargne Réelle"
              dataKey="savings" 
              stroke="#06b6d4" 
              strokeWidth={2}
              fill="none" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-start gap-1.5 bg-slate-50 border border-slate-100 rounded-xl p-3 mt-4 text-[10px] text-slate-500 font-semibold leading-relaxed">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          L'écart bleu entre la courbe verte (revenus) et la rouge (dépenses) illustre l'excédent ou "matelas de sécurité" mensuel généré par votre ménage. Visez un écart d'au moins 20% par mois.
        </p>
      </div>
    </div>
  );
}
