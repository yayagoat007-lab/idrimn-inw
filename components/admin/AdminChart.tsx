import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AdminChartProps {
  data: { month: string; revenue: number; users: number }[];
}

export function AdminChart({ data }: AdminChartProps) {
  const formatYAxisRevenue = (value: number) => {
    return `${value / 1000}k DH`;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Courbe de croissance business</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase">Évolution des revenus récurrents (MRR) et utilisateurs actifs</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={formatYAxisRevenue}
              tick={{ fontSize: 10, fill: '#10b981', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: '#3b82f6', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #f1f5f9', 
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              name="Revenus (DH)"
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="users" 
              name="Inscrits"
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUsers)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default AdminChart;
