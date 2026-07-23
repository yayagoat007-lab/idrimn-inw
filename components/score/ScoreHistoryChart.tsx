import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { ScoreHistoryEntry, getScoreHistory } from '../../lib/floussi-score';
import { Calendar, Filter, Sparkles } from 'lucide-react';

interface ScoreHistoryChartProps {
  userId?: string;
  language: 'fr' | 'darija';
}

export function ScoreHistoryChart({ userId = "mock-user-id-9999", language }: ScoreHistoryChartProps) {
  const isDarija = language === 'darija';
  const [months, setMonths] = useState<number>(3); // Default to 3 months history

  // Dynamically load history based on active month range
  const data = getScoreHistory(userId, months);

  // Formatter for dates in French / Darija
  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      return d.toLocaleDateString(language === 'darija' ? 'ar-MA' : 'fr-FR', options);
    } catch (_) {
      return dateStr;
    }
  };

  // Custom tooltips to avoid default unstyled boxes
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload as ScoreHistoryEntry;
      return (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 shadow-md text-left text-xs space-y-1">
          <p className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">
            {formatDateLabel(entry.date)}
          </p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-200">
              {isDarija ? "سكور : " : "Score : "}
            </span>
            <strong className="text-emerald-400 font-black text-sm">{entry.score} pts</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
      
      {/* Chart Title and Timeframe Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Calendar size={16} className="text-emerald-600" />
            <span>{isDarija ? "منحنى تطور الرصيد المالي" : "Évolution du Score"}</span>
          </h4>
          <p className="text-[11px] text-slate-400 font-bold mt-1">
            {isDarija 
              ? "تابع النضج المالي ديالك وكيفاش تطور على حساب الحركات والأنشطة ديالك."
              : "Suivez votre courbe d'effort budgétaire et de discipline sur la période sélectionnée."}
          </p>
        </div>

        {/* Time Filter buttons */}
        <div className="flex gap-1.5 bg-slate-100/70 border border-slate-200/50 p-1 rounded-xl">
          <button
            onClick={() => setMonths(1)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              months === 1 
                ? 'bg-white text-slate-800 shadow-xs' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isDarija ? "30 يوم" : "30j"}
          </button>
          <button
            onClick={() => setMonths(3)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              months === 3 
                ? 'bg-white text-slate-800 shadow-xs' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isDarija ? "3 شهور" : "3 mois"}
          </button>
          <button
            onClick={() => setMonths(6)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              months === 6 
                ? 'bg-white text-slate-800 shadow-xs' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isDarija ? "6 شهور" : "6 mois"}
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-64 bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-2">
            <Sparkles size={24} className="text-slate-300 animate-pulse" />
            <p className="text-xs font-bold text-slate-400">
              {isDarija ? "مازال ما كاينش بيانات د التاريخ" : "Historique de score en cours d'initialisation..."}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#e2e8f0" 
              />

              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateLabel}
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                stroke="#cbd5e1"
                dy={8}
              />

              <YAxis 
                domain={[100, 1000]}
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                stroke="#cbd5e1"
              />

              <Tooltip content={<CustomTooltip />} />

              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#scoreColor)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick takeaway summary note */}
      {data.length > 1 && (
        <div className="flex gap-2 items-center px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
          <Sparkles size={14} className="text-amber-500 shrink-0" />
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            {isDarija 
              ? `القيمة الدنوية كانت ${Math.min(...data.map(d => d.score))} نقطة والقيمة القصوى كانت ${Math.max(...data.map(d => d.score))} نقطة ف هاد المدة.`
              : `Point le plus bas : ${Math.min(...data.map(d => d.score))} pts | Sommet atteint : ${Math.max(...data.map(d => d.score))} pts sur la période.`}
          </p>
        </div>
      )}

    </div>
  );
}

export default ScoreHistoryChart;
