import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ComparisonScenario, ComparisonDataPoint } from '../../lib/scenario-comparison';
import { TrendingUp, Info } from 'lucide-react';

interface ScenarioComparisonChartProps {
  chartData: ComparisonDataPoint[];
  scenarios: ComparisonScenario[];
  language: 'fr' | 'darija';
}

export function ScenarioComparisonChart({
  chartData,
  scenarios,
  language,
}: ScenarioComparisonChartProps) {
  
  const formatYAxis = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M DH`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}k DH`;
    }
    return `${val} DH`;
  };

  const formatTooltipValue = (val: number) => {
    return `${val.toLocaleString(language === 'fr' ? 'fr-FR' : 'ar-MA')} DH`;
  };

  const t = {
    title: language === 'fr' ? 'Comparatif des Scénarios d’Épargne' : 'Mofadala dyal l-Iddikhar',
    subtitle: language === 'fr' 
      ? 'Visualise l’impact de petits efforts d’épargne mensuelle supplémentaires sur 30 ans.' 
      : 'Chouf kifach hwayej sghar dyal l-iddikhar kola chhar i9drou ibdlo kolchi f 30 3am.',
    age: language === 'fr' ? 'Âge' : 'L-3mar',
    year: language === 'fr' ? 'Année' : 'L-3am',
    netWorth: language === 'fr' ? 'Patrimoine Net' : 'Koulchi d-Flouss',
    disclaimer: language === 'fr' 
      ? 'Estimez les gains potentiels selon l’intérêt composé. Taux de rendement annuel indicatif.' 
      : 'Hess l-arba7 t-taqribiya dyal l-iddikhar.',
  };

  return (
    <div 
      className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs space-y-4"
      id="scenario-comparison-chart-container"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl">
          <TrendingUp size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            {t.title}
          </h3>
          <p className="text-[11px] text-slate-500 font-bold leading-normal mt-0.5">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="h-72 md:h-80 w-full" id="recharts-scenarios-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={700}
              tickFormatter={(age) => `${age} ${language === 'fr' ? 'ans' : '3am'}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={700}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '16px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '12px 14px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
              labelFormatter={(label) => `${t.age} : ${label} ${language === 'fr' ? 'ans' : '3am'}`}
              formatter={(value: any, name: string) => {
                const sc = scenarios.find(s => s.id === name);
                const label = sc ? (language === 'fr' ? sc.nameFr : sc.nameDarija) : name;
                return [formatTooltipValue(Number(value)), label];
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => {
                const sc = scenarios.find(s => s.id === value);
                return (
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    {sc ? (language === 'fr' ? sc.nameFr : sc.nameDarija) : value}
                  </span>
                );
              }}
            />
            {scenarios.map((sc) => (
              <Line
                key={sc.id}
                type="monotone"
                dataKey={sc.id}
                stroke={sc.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2 bg-slate-50 rounded-2xl p-3 items-start border border-slate-100">
        <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
        <span className="text-[10px] text-slate-500 font-bold leading-normal">
          {language === 'fr' 
            ? "💡 Note l’effet boule de neige : À long terme, l’écart entre les courbes grandit de façon exponentielle grâce au réinvestissement des intérêts composés (Moun7ana l-Ossi)."
            : "💡 Chouf kifach l-farq kaykbar bzaf bin l-khatat m3a l-weqt, 7it l-arbaj kat3awd t-khdem l-khedma dyalha dima."}
        </span>
      </div>
    </div>
  );
}
export default ScenarioComparisonChart;
