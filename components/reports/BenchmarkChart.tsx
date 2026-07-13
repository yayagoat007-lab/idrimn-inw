import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BenchmarkChartProps {
  data: {
    category: string;
    userPercent: number;
    userAmount: number;
    benchmarkPercent: number;
    benchmarkAmount: number;
    diffPercent: number;
  }[];
}

export function BenchmarkChart({ data }: BenchmarkChartProps) {
  const chartData = data.map(item => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    'Mes dépenses (DH)': Math.round(item.userAmount),
    'Moyenne Maroc (DH)': Math.round(item.benchmarkAmount)
  }));

  return (
    <div className="border border-slate-150 rounded-2xl bg-white p-5 shadow-xs">
      <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider">
        Toi vs Indice de Référence National (HCP)
      </h4>

      <div className="h-[240px] w-full text-[10px] font-bold">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
            <Tooltip 
              contentStyle={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'sans-serif' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
            <Bar dataKey="Mes dépenses (DH)" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Moyenne Maroc (DH)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default BenchmarkChart;
