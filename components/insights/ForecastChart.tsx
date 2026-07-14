import React, { useState, useMemo } from 'react';
import { useTransactions } from '../../hooks/use-transactions';
import { forecastSpending, ForecastSpendingPoint } from '../../lib/forecasting';
import { useAuth } from '../../hooks/use-auth';
import { 
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceDot 
} from 'recharts';
import { TrendingUp, CalendarDays, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface ForecastChartProps {
  lang: 'fr' | 'darija';
}

export function ForecastChart({ lang }: ForecastChartProps) {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const { transactions, loading } = useTransactions(userId);
  const [monthsAhead, setMonthsAhead] = useState<1 | 3 | 6 | 12>(6);

  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  const { chartData, forecastPoints } = useMemo(() => {
    if (loading || transactions.length === 0) {
      return { chartData: [], forecastPoints: [] };
    }

    // 1. Compute past 6 months of actual spending
    const pastExpensesByMonth: Record<string, number> = {};
    const expenses = transactions.filter(t => t.type === 'expense');

    expenses.forEach(t => {
      const date = new Date(t.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      pastExpensesByMonth[monthKey] = (pastExpensesByMonth[monthKey] || 0) + t.amount;
    });

    const sortedPastMonths = Object.keys(pastExpensesByMonth).sort();
    // Keep last 6 historical months
    const last6Months = sortedPastMonths.slice(-6);

    const historyData = last6Months.map(month => ({
      month,
      actual: Math.round(pastExpensesByMonth[month]),
      predicted: null as number | null,
      confidenceLow: null as number | null,
      confidenceHigh: null as number | null,
      isForecast: false,
      isSeasonalPeak: false,
      peakReason: ""
    }));

    // 2. Generate future forecasts
    const forecasts = forecastSpending(transactions, monthsAhead);

    const forecastData = forecasts.map(f => ({
      month: f.month,
      actual: null as number | null,
      predicted: f.predicted,
      confidenceLow: f.confidenceLow,
      confidenceHigh: f.confidenceHigh,
      isForecast: true,
      isSeasonalPeak: f.isSeasonalPeak,
      peakReason: f.peakReason || ""
    }));

    // 3. Connect past to future for smooth chart drawing (last history point is start of predictions)
    let connectedData = [...historyData];
    if (historyData.length > 0 && forecastData.length > 0) {
      const lastHistory = historyData[historyData.length - 1];
      // We insert a virtual connector node to avoid a visual gap in the lines
      const connector = {
        month: lastHistory.month,
        actual: lastHistory.actual,
        predicted: lastHistory.actual, // match actual spend
        confidenceLow: lastHistory.actual,
        confidenceHigh: lastHistory.actual,
        isForecast: true,
        isSeasonalPeak: false,
        peakReason: ""
      };
      connectedData.push(connector);
    }

    connectedData = [...connectedData, ...forecastData];

    return {
      chartData: connectedData,
      forecastPoints: forecasts
    };
  }, [transactions, loading, monthsAhead]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center py-16">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-extrabold">Calcul de vos prévisions financières...</p>
      </div>
    );
  }

  const activeSeasonalPeak = forecastPoints.find(f => f.isSeasonalPeak);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      {/* 1. Header with Title and Range Selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-black text-slate-800 tracking-tight">
              {lang === 'darija' ? "Tawaqo'at l-masrouf Floussi" : "Prédictions de Dépenses Floussi"}
            </h3>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            Régression linéaire intelligente & Ajustements Saisonniers Marocains
          </p>
        </div>

        {/* Interactive Horizon Selector */}
        <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-bold self-end sm:self-auto border border-slate-200">
          {([1, 3, 6, 12] as const).map(m => (
            <button
              key={m}
              onClick={() => setMonthsAhead(m)}
              className={`px-3 py-1 rounded-md transition-all ${
                monthsAhead === m
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {m} mois
            </button>
          ))}
        </div>
      </div>

      {/* 2. Responsive Recharts Chart Canvas */}
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(val) => {
                const parts = val.split('-');
                if (parts.length < 2) return val;
                const m = parseInt(parts[1], 10);
                const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
                return `${monthNames[m - 1]} ${parts[0].slice(2)}`;
              }}
              stroke="#94a3b8"
              tick={{ fontSize: 10, fontWeight: 'bold' }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fontSize: 10, fontWeight: 'bold' }}
              tickFormatter={(val) => `${val} DH`}
            />
            
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const monthParts = data.month.split('-');
                  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
                  const readableMonth = `${monthNames[parseInt(monthParts[1], 10) - 1]} ${monthParts[0]}`;
                  
                  return (
                    <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-lg border border-slate-800 space-y-2 text-xs">
                      <p className="font-extrabold text-slate-400">{readableMonth}</p>
                      {data.isForecast ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-purple-400">
                            Prévu : <span className="font-mono font-black">{formatMAD(data.predicted)}</span>
                          </p>
                          <p className="text-[9px] text-slate-400">
                            Intervalle : <span className="font-mono">{formatMAD(data.confidenceLow)}</span> - <span className="font-mono">{formatMAD(data.confidenceHigh)}</span>
                          </p>
                          {data.isSeasonalPeak && (
                            <span className="inline-flex mt-1 items-center gap-1 text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md font-bold">
                              🌙 {data.peakReason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="font-semibold text-emerald-400">
                          Dépensé : <span className="font-mono font-black">{formatMAD(data.actual)}</span>
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Confidence Band Area */}
            <Area
              type="monotone"
              dataKey="confidenceHigh"
              stroke="none"
              fill="#c084fc"
              opacity={0.12}
              name="Intervalle haut"
            />
            <Area
              type="monotone"
              dataKey="confidenceLow"
              stroke="none"
              fill="#c084fc"
              opacity={0.12}
              name="Intervalle bas"
            />

            {/* Past Expenses Line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1 }}
              name="Dépenses réelles"
            />

            {/* Future Predictions Line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#a855f7"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, strokeWidth: 1, fill: '#ffffff' }}
              name="Dépenses estimées"
            />

            {/* reference dots for seasonal peaks */}
            {chartData.map((d, i) => {
              if (d.isSeasonalPeak && d.predicted) {
                return (
                  <ReferenceDot
                    key={i}
                    x={d.month}
                    y={d.predicted}
                    r={6}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                );
              }
              return null;
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <div className="flex gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Dépenses Historiques</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-slate-600">Prévision Floussi IA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-purple-100" />
            <span className="text-slate-600">Enveloppe d'Incertitude</span>
          </div>
        </div>

        {activeSeasonalPeak ? (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
            <CalendarDays className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Impact Saisonnier Détecté</span>
              <p className="text-[11px] text-slate-700 font-semibold leading-normal">
                Les prévisions intègrent l'impact de <span className="font-extrabold text-amber-600">{activeSeasonalPeak.peakReason}</span>. Sidi Floussi a ajusté de façon proactive la consommation estimée de nourriture, d'achats de cadeaux ou de déplacements.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider block">Intervalle d'incertitude</span>
              <p className="text-[11px] text-slate-700 font-semibold leading-normal">
                Le couloir bleuté représente un intervalle de confiance de 80%. L'écart s'élargit plus on avance dans le temps, tenant compte des imprévus de la vie.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
