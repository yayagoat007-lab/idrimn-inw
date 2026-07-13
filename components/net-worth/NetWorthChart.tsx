import React, { useState } from 'react';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Sparkles, HelpCircle } from 'lucide-react';

interface NetWorthChartProps {
  historicalData: any[];
  projectionData: any[];
}

export function NetWorthChart({ historicalData, projectionData }: NetWorthChartProps) {
  const [tab, setTab] = useState<'history' | 'projection'>('history');

  const activeData = tab === 'history' ? historicalData : projectionData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 text-white rounded-xl p-3 shadow-xl text-xs font-sans">
          <p className="font-extrabold text-slate-300 mb-1">{label}</p>
          <div className="space-y-1 font-mono">
            <p className="text-emerald-400">
              Actifs: <span className="font-black">{(payload[0]?.value || 0).toLocaleString()} DH</span>
            </p>
            <p className="text-rose-400">
              Dettes: <span className="font-black">{(payload[1]?.value || 0).toLocaleString()} DH</span>
            </p>
            <div className="border-t border-slate-700 my-1 pt-1">
              <p className="text-white font-black">
                Patrimoine Net: <span>{(payload[2]?.value || 0).toLocaleString()} DH</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Évolution de la Dakira</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold">
            Visualisez le rapport historique ou l'estimation prévisionnelle de votre richesse.
          </p>
        </div>

        {/* Toggle tabs */}
        <div className="bg-slate-100 p-0.5 rounded-xl inline-flex self-start sm:self-center">
          <button
            onClick={() => setTab('history')}
            className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all ${tab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Historique (12 mois)
          </button>
          <button
            onClick={() => setTab('projection')}
            className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${tab === 'projection' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Projection (12 mois)</span>
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activeData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="colorDebts" x1="0" y1="0" x2="0" y2="1">
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
              name="Actifs"
              dataKey="assets" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorAssets)" 
            />
            <Area 
              type="monotone" 
              name="Dettes"
              dataKey="debts" 
              stroke="#ef4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorDebts)" 
            />
            <Area 
              type="monotone" 
              name="Patrimoine Net"
              dataKey="netWorth" 
              stroke="#475569" 
              strokeWidth={2}
              fill="none" 
              strokeDasharray={tab === 'projection' ? "4 4" : undefined}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-start gap-2 bg-amber-50/50 border border-amber-100 rounded-xl p-3 mt-4 text-[11px] text-amber-800">
        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="font-semibold leading-relaxed">
          {tab === 'history' 
            ? "L'historique reflète l'appréciation moyenne de vos actifs réels (Ex: Immobilier Sidi Maarouf +0.5%/mois) combinée à l'amortissement régulier de votre crédit."
            : "La projection de 12 mois simule un plan de remboursement stable de vos crédits à hauteur de vos mensualités tout en projetant un taux d'épargne conservateur de 15% réinvesti dans vos actifs."
          }
        </p>
      </div>
    </div>
  );
}
