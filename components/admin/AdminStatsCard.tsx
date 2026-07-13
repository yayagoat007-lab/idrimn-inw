import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down';
  icon: LucideIcon;
  iconColor: string;
}

export function AdminStatsCard({
  title,
  value,
  trend,
  trendDirection = 'up',
  icon: Icon,
  iconColor
}: AdminStatsCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
        {trend && (
          <p className={`text-[10px] font-extrabold flex items-center gap-1 ${
            trendDirection === 'up' ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            <span>{trendDirection === 'up' ? '▲' : '▼'}</span>
            <span>{trend}</span>
          </p>
        )}
      </div>

      <div className={`w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>
    </div>
  );
}
export default AdminStatsCard;
