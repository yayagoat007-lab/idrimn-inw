import React from 'react';
import { Users, Landmark, Award, Percent } from 'lucide-react';

export function StatsCounter() {
  const stats = [
    { id: 1, label: 'Marocains inscrits', value: '14 500 +', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { id: 2, label: 'Non-bancarisés gérés', value: '45 %', icon: Landmark, color: 'text-blue-600 bg-blue-50' },
    { id: 3, label: 'Utilisation 100% Cash', value: '79 %', icon: Percent, color: 'text-amber-600 bg-amber-50' },
    { id: 4, label: 'Dirhams Économisés', value: '5,4 M +', icon: Award, color: 'text-purple-600 bg-purple-50' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.id} className="bg-white border border-slate-100 rounded-2xl p-5 text-center space-y-2 hover:shadow-xs transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default StatsCounter;
