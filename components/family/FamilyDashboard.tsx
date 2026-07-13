import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShieldAlert, TrendingUp, Wallet, Users } from 'lucide-react';

interface FamilyDashboardProps {
  stats: {
    totalBalance: number;
    totalSpentThisMonth: number;
    memberDistribution: { name: string; value: number }[];
    categoryDistribution: { name: string; value: number }[];
    familyAlerts: string[];
  };
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export function FamilyDashboard({ stats }: FamilyDashboardProps) {
  // Mock budget comparison
  const comparisonData = [
    { name: 'Alimentation', Budget: 4000, Réel: 3600 },
    { name: 'Logement', Budget: 5000, Réel: 5000 },
    { name: 'Transports', Budget: 1500, Réel: 1800 },
    { name: 'Éducation', Budget: 2000, Réel: 1500 },
    { name: 'Loisirs', Budget: 1000, Réel: 1200 }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Overviews */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-slate-150 rounded-2xl p-4 bg-white shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Trésorerie Foyer</span>
            <span className="text-sm font-black text-slate-800">{stats.totalBalance.toLocaleString('fr-MA')} DH</span>
          </div>
        </div>

        <div className="border border-slate-150 rounded-2xl p-4 bg-white shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Dépenses Foyer</span>
            <span className="text-sm font-black text-slate-800">{stats.totalSpentThisMonth.toLocaleString('fr-MA')} DH</span>
          </div>
        </div>

        <div className="border border-slate-150 rounded-2xl p-4 bg-white shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Membres Actifs</span>
            <span className="text-sm font-black text-slate-800">3 Comptes</span>
          </div>
        </div>
      </div>

      {/* Warnings Banner */}
      {stats.familyAlerts.length > 0 && (
        <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-4 space-y-2.5">
          <h4 className="text-[10px] font-black text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Alertes Budgétaires du Foyer</span>
          </h4>
          <div className="space-y-1.5">
            {stats.familyAlerts.map((alert, idx) => (
              <p key={idx} className="text-[10px] text-amber-950 font-bold leading-normal">
                • {alert}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending distribution by category */}
        <div className="border border-slate-150 rounded-2xl p-5 bg-white shadow-xs flex flex-col justify-between">
          <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider">Masrouf de Famille par Catégorie</h4>
          <div className="h-[180px] w-full flex items-center justify-center text-[9px] font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget vs Real */}
        <div className="border border-slate-150 rounded-2xl p-5 bg-white shadow-xs">
          <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider">Budget Alloué vs Réel</h4>
          <div className="h-[180px] w-full text-[9px] font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                <XAxis dataKey="name" fontSize={9} stroke="#94A3B8" />
                <YAxis fontSize={9} stroke="#94A3B8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Budget" fill="#94A3B8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Réel" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FamilyDashboard;
