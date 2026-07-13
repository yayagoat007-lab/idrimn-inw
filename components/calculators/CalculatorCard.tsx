import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CalculatorCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  onClick: () => void;
}

export function CalculatorCard({ title, description, icon: Icon, colorClass, onClick }: CalculatorCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-slate-100 rounded-3xl p-6 text-left shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 h-full cursor-pointer group"
    >
      <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
        <Icon size={20} />
      </div>

      <div className="space-y-1.5">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{title}</h4>
        <p className="text-[11px] text-slate-400 font-bold uppercase leading-relaxed h-8">{description}</p>
      </div>

      <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1 group-hover:underline">
        Ouvrir le simulateur &rarr;
      </span>
    </button>
  );
}
export default CalculatorCard;
